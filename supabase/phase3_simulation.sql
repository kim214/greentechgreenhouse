-- =============================================================================
-- GreenTech Phase 3 — simulation tick (run in Supabase SQL Editor)
-- Requires Phase 2 schema + seed.
-- Any authenticated user may call this RPC. It updates fleet houses only.
-- It never publishes MQTT and never writes source labels to the UI.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.run_simulation_tick()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gh RECORD;
  last_temp NUMERIC;
  last_hum NUMERIC;
  last_soil NUMERIC;
  next_temp NUMERIC;
  next_hum NUMERIC;
  next_soil NUMERIC;
  hr INTEGER;
  irrigating BOOLEAN;
  ventilating BOOLEAN;
  pump_online BOOLEAN;
  fan_online BOOLEAN;
  ticked INT := 0;
  events INT := 0;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  FOR gh IN
    SELECT g.id, g.code, g.mode, g.status, g.owner_id
    FROM public.greenhouses g
    WHERE g.code LIKE 'GH-%'
      AND g.status = 'online'
  LOOP
    -- Skip if a reading landed in the last 12 seconds (avoids stacked clients)
    IF EXISTS (
      SELECT 1
      FROM public.sensor_readings sr
      WHERE sr.greenhouse_id = gh.id
        AND sr.created_at > NOW() - INTERVAL '12 seconds'
    ) THEN
      CONTINUE;
    END IF;

    SELECT sr.temperature, sr.humidity, sr.soil_moisture
    INTO last_temp, last_hum, last_soil
    FROM public.sensor_readings sr
    WHERE sr.greenhouse_id = gh.id
    ORDER BY sr.created_at DESC
    LIMIT 1;

    last_temp := COALESCE(last_temp, 24.0);
    last_hum := COALESCE(last_hum, 60.0);
    last_soil := COALESCE(last_soil, 55.0);
    hr := EXTRACT(HOUR FROM NOW())::INT;

    SELECT EXISTS (
      SELECT 1 FROM public.irrigation_events ie
      WHERE ie.greenhouse_id = gh.id AND ie.ended_at IS NULL
    ) INTO irrigating;

    SELECT EXISTS (
      SELECT 1 FROM public.ventilation_events ve
      WHERE ve.greenhouse_id = gh.id AND ve.ended_at IS NULL
    ) INTO ventilating;

    SELECT COALESCE(bool_or(d.is_online), false)
    INTO pump_online
    FROM public.devices d
    WHERE d.greenhouse_id = gh.id AND d.type = 'pump';

    SELECT COALESCE(bool_or(d.is_online), false)
    INTO fan_online
    FROM public.devices d
    WHERE d.greenhouse_id = gh.id AND d.type = 'fan';

    -- Temperature: slow drift, warmer midday, cooler night, fans pull heat down
    next_temp := last_temp
      + CASE
          WHEN hr BETWEEN 10 AND 16 THEN 0.16
          WHEN hr BETWEEN 0 AND 6 THEN -0.12
          ELSE 0.02
        END
      + (random() - 0.5) * 0.18
      + CASE WHEN ventilating THEN -0.22 ELSE 0 END;
    next_temp := GREATEST(16.0, LEAST(37.5, next_temp));

    -- Humidity: ventilation dries, irrigation adds moisture
    next_hum := last_hum
      + (random() - 0.5) * 0.35
      + CASE WHEN ventilating THEN -0.45 ELSE 0.08 END
      + CASE WHEN irrigating THEN 0.35 ELSE -0.05 END;
    next_hum := GREATEST(32.0, LEAST(90.0, next_hum));

    -- Soil: dries slowly; dries faster when warm; rises only while irrigating
    next_soil := last_soil
      + CASE WHEN irrigating THEN 2.15 ELSE -0.28 - GREATEST(next_temp - 24.0, 0) * 0.025 END
      + (random() - 0.5) * 0.12;
    next_soil := GREATEST(16.0, LEAST(90.0, next_soil));

    INSERT INTO public.sensor_readings (
      greenhouse_id, temperature, humidity, soil_moisture, source, created_at
    ) VALUES (
      gh.id, ROUND(next_temp, 2), ROUND(next_hum, 2), ROUND(next_soil, 2), 'simulation', NOW()
    );

    -- AUTO irrigation
    IF gh.mode = 'AUTO' AND pump_online AND NOT irrigating AND next_soil < 32 THEN
      INSERT INTO public.irrigation_events (greenhouse_id, started_at, trigger, estimated_litres, source)
      VALUES (gh.id, NOW(), 'auto', 0, 'simulation');
      INSERT INTO public.automation_events (greenhouse_id, event_type, reason, source)
      VALUES (gh.id, 'irrigation_started', 'Soil moisture fell below 32%', 'simulation');
      INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message, source)
      VALUES (gh.id, gh.owner_id, 'Greenhouse ' || gh.code || ' irrigation activated automatically.', 'simulation');
      IF NOT EXISTS (
        SELECT 1 FROM public.alerts a
        WHERE a.greenhouse_id = gh.id
          AND a.category = 'irrigation'
          AND a.is_resolved = false
          AND a.created_at > NOW() - INTERVAL '3 hours'
      ) THEN
        INSERT INTO public.alerts (greenhouse_id, title, description, severity, category, source)
        VALUES (
          gh.id,
          'Low soil moisture',
          'Root-zone moisture dropped below 32%. Irrigation started automatically.',
          'high',
          'irrigation',
          'simulation'
        );
      END IF;
      events := events + 1;
    ELSIF irrigating AND next_soil >= 60 THEN
      UPDATE public.irrigation_events
      SET
        ended_at = NOW(),
        estimated_litres = GREATEST(8, EXTRACT(EPOCH FROM (NOW() - started_at)) / 60.0 * 1.4)
      WHERE greenhouse_id = gh.id AND ended_at IS NULL;
      INSERT INTO public.automation_events (greenhouse_id, event_type, reason, source)
      VALUES (gh.id, 'irrigation_stopped', 'Soil moisture reached target', 'simulation');
      INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message, source)
      VALUES (gh.id, gh.owner_id, 'Greenhouse ' || gh.code || ' irrigation stopped.', 'simulation');
      UPDATE public.alerts
      SET is_resolved = true, is_read = true
      WHERE greenhouse_id = gh.id
        AND category = 'irrigation'
        AND is_resolved = false;
      events := events + 1;
    END IF;

    -- AUTO ventilation
    IF gh.mode = 'AUTO' AND fan_online AND NOT ventilating AND next_temp > 30.5 THEN
      INSERT INTO public.ventilation_events (greenhouse_id, started_at, trigger, source)
      VALUES (gh.id, NOW(), 'auto', 'simulation');
      INSERT INTO public.automation_events (greenhouse_id, event_type, reason, source)
      VALUES (gh.id, 'ventilation_opened', 'Temperature exceeded 30.5°C', 'simulation');
      INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message, source)
      VALUES (gh.id, gh.owner_id, 'Ventilation system activated in ' || gh.code || '.', 'simulation');
      IF NOT EXISTS (
        SELECT 1 FROM public.alerts a
        WHERE a.greenhouse_id = gh.id
          AND a.category = 'climate'
          AND a.is_resolved = false
          AND a.created_at > NOW() - INTERVAL '2 hours'
      ) THEN
        INSERT INTO public.alerts (greenhouse_id, title, description, severity, category, source)
        VALUES (
          gh.id,
          'High temperature',
          'Air temperature exceeded 30.5°C. Ventilation opened automatically.',
          'high',
          'climate',
          'simulation'
        );
      END IF;
      events := events + 1;
    ELSIF ventilating AND next_temp < 27.5 THEN
      UPDATE public.ventilation_events
      SET ended_at = NOW()
      WHERE greenhouse_id = gh.id AND ended_at IS NULL;
      INSERT INTO public.automation_events (greenhouse_id, event_type, reason, source)
      VALUES (gh.id, 'ventilation_closed', 'Temperature returned to the preferred range', 'simulation');
      INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message, source)
      VALUES (gh.id, gh.owner_id, 'Ventilation closed in ' || gh.code || '.', 'simulation');
      UPDATE public.alerts
      SET is_resolved = true, is_read = true
      WHERE greenhouse_id = gh.id
        AND category = 'climate'
        AND is_resolved = false;
      events := events + 1;
    END IF;

    -- Crop stress from environment
    UPDATE public.crops c
    SET health_status = CASE
      WHEN next_soil < 30 OR next_temp > 33 THEN 'stressed'
      WHEN next_soil >= 40 AND next_temp <= 31 THEN 'healthy'
      ELSE c.health_status
    END
    WHERE c.greenhouse_id = gh.id;

    -- Heartbeats for online devices
    UPDATE public.devices
    SET last_heartbeat = NOW()
    WHERE greenhouse_id = gh.id AND is_online = true;

    ticked := ticked + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'houses', ticked, 'events', events);
END;
$$;

REVOKE ALL ON FUNCTION public.run_simulation_tick() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.run_simulation_tick() TO authenticated;
