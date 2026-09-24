-- =============================================================================
-- GreenTech — farmer can register several houses
-- Requires Phase 2–7 (and 10 recommended).
-- Each new house gets devices, crop, and 7-day operating history.
-- Simulation ticks OP-% houses unless a live controller reading landed recently.
-- MQTT persist uses record_live_reading(); never labelled in the UI.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.seed_house_operating_history(p_greenhouse_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v INT;
  temp_base NUMERIC;
  hum_base NUMERIC;
  soil_base NUMERIC;
BEGIN
  IF p_greenhouse_id IS NULL THEN
    RETURN;
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.sensor_readings sr
    WHERE sr.greenhouse_id = p_greenhouse_id
    LIMIT 1
  ) THEN
    RETURN;
  END IF;

  v := ABS(HASHTEXT(p_greenhouse_id::text));
  temp_base := 21.8 + (v % 6) * 0.45;
  hum_base := 58 + (v % 5) * 1.4;
  soil_base := 52 - (v % 7);

  INSERT INTO public.sensor_readings (
    greenhouse_id, temperature, humidity, soil_moisture, source, created_at
  )
  SELECT
    p_greenhouse_id,
    ROUND(GREATEST(16, LEAST(36,
      temp_base
      + 3.1 * SIN(2 * PI() * EXTRACT(HOUR FROM ts) / 24.0)
      + ((EXTRACT(DOY FROM ts)::INT + v) % 5) * 0.08
    ))::NUMERIC, 2),
    ROUND(GREATEST(35, LEAST(88,
      hum_base
      + 7.5 * COS(2 * PI() * EXTRACT(HOUR FROM ts) / 24.0)
    ))::NUMERIC, 2),
    ROUND(GREATEST(18, LEAST(88,
      soil_base
      - 9 * SIN(2 * PI() * EXTRACT(HOUR FROM ts) / 24.0)
      + CASE WHEN EXTRACT(HOUR FROM ts) IN (6, 7, 8) THEN 12 ELSE 0 END
    ))::NUMERIC, 2),
    'simulation',
    ts
  FROM generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '1 hour') AS ts;

  INSERT INTO public.irrigation_events (
    greenhouse_id, started_at, ended_at, trigger, estimated_litres, source
  )
  VALUES
    (
      p_greenhouse_id,
      NOW() - INTERVAL '2 days 5 hours',
      NOW() - INTERVAL '2 days 4 hours 28 minutes',
      'auto',
      36.4 + (v % 8),
      'simulation'
    ),
    (
      p_greenhouse_id,
      NOW() - INTERVAL '14 hours',
      NOW() - INTERVAL '13 hours 32 minutes',
      'auto',
      29.8 + (v % 6),
      'simulation'
    );

  INSERT INTO public.ventilation_events (
    greenhouse_id, started_at, ended_at, trigger, source
  )
  VALUES (
    p_greenhouse_id,
    NOW() - INTERVAL '1 day 3 hours',
    NOW() - INTERVAL '1 day 2 hours 10 minutes',
    'auto',
    'simulation'
  );

  INSERT INTO public.automation_events (greenhouse_id, event_type, reason, occurred_at, source)
  VALUES
    (p_greenhouse_id, 'irrigation_started', 'Soil moisture fell below 32%', NOW() - INTERVAL '14 hours', 'simulation'),
    (p_greenhouse_id, 'irrigation_stopped', 'Soil moisture reached target', NOW() - INTERVAL '13 hours 32 minutes', 'simulation');

  INSERT INTO public.activity_logs (greenhouse_id, message, source, occurred_at)
  VALUES
    (p_greenhouse_id, 'House registered and brought online.', 'simulation', NOW()),
    (p_greenhouse_id, 'Irrigation cycle completed.', 'simulation', NOW() - INTERVAL '13 hours 32 minutes');
END;
$$;

CREATE OR REPLACE FUNCTION public.provision_owned_greenhouse(
  p_profile_id UUID,
  p_name TEXT,
  p_location TEXT,
  p_crop_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  gid UUID;
  new_code TEXT;
  seq INT;
  hub_id UUID;
  house_name TEXT;
  crop_name TEXT;
BEGIN
  IF p_profile_id IS NULL THEN
    RAISE EXCEPTION 'profile_required';
  END IF;

  house_name := NULLIF(BTRIM(p_name), '');
  IF house_name IS NULL THEN
    RAISE EXCEPTION 'name_required';
  END IF;
  crop_name := COALESCE(NULLIF(BTRIM(p_crop_name), ''), 'Mixed greens');

  seq := (SELECT COUNT(*) FROM public.greenhouses WHERE owner_id = p_profile_id)::INT + 1;
  LOOP
    new_code := 'OP-' || UPPER(SUBSTRING(REPLACE(p_profile_id::text, '-', ''), 1, 4)) || LPAD(seq::text, 2, '0');
    EXIT WHEN NOT EXISTS (SELECT 1 FROM public.greenhouses WHERE code = new_code);
    seq := seq + 1;
    IF seq > 99 THEN
      new_code := 'OP-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 6));
      EXIT;
    END IF;
  END LOOP;

  INSERT INTO public.greenhouses (code, name, owner_id, location, status, mode)
  VALUES (new_code, house_name, p_profile_id, NULLIF(BTRIM(COALESCE(p_location, '')), ''), 'online', 'AUTO')
  RETURNING id INTO gid;

  INSERT INTO public.crops (
    greenhouse_id, name, variety, growth_stage, planted_at, expected_harvest, health_status, estimated_yield_kg
  )
  VALUES (gid, crop_name, 'House mix', 'vegetative', CURRENT_DATE, CURRENT_DATE + 45, 'healthy', 18 + (seq % 7));

  INSERT INTO public.devices (greenhouse_id, code, type, name, is_online, last_heartbeat, power_status)
  SELECT gid, prefix || SUBSTRING(new_code FROM 4), dtype, dname, true, NOW(), 'ok'
  FROM (VALUES
    ('CTL-', 'controller', 'House controller'),
    ('PMP-', 'pump', 'Irrigation pump'),
    ('FAN-', 'fan', 'Ventilation fan'),
    ('HUB-', 'sensor_hub', 'Climate sensor hub')
  ) AS d(prefix, dtype, dname);

  SELECT id INTO hub_id
  FROM public.devices
  WHERE greenhouse_id = gid AND type = 'sensor_hub'
  LIMIT 1;

  IF hub_id IS NOT NULL THEN
    INSERT INTO public.sensors (device_id, greenhouse_id, type, code, is_online)
    SELECT hub_id, gid, stype, sprefix || SUBSTRING(new_code FROM 4), true
    FROM (VALUES
      ('temperature', 'TMP-'),
      ('humidity', 'HUM-'),
      ('soil_moisture', 'SOL-'),
      ('light', 'LUX-')
    ) AS s(stype, sprefix);
  END IF;

  PERFORM public.seed_house_operating_history(gid);
  RETURN gid;
END;
$$;

CREATE OR REPLACE FUNCTION public.register_own_greenhouse(
  p_name TEXT,
  p_location TEXT DEFAULT NULL,
  p_crop_name TEXT DEFAULT 'Mixed greens'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
  owned INT;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  IF public.is_admin() THEN
    RAISE EXCEPTION 'admins_use_platform_view';
  END IF;

  SELECT id INTO pid
  FROM public.profiles
  WHERE auth_user_id = auth.uid();

  IF pid IS NULL THEN
    INSERT INTO public.profiles (auth_user_id, role, full_name, email, status, last_seen_at)
    SELECT
      u.id,
      'farmer',
      COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
      u.email,
      'active',
      NOW()
    FROM auth.users u
    WHERE u.id = auth.uid()
    ON CONFLICT (auth_user_id) DO UPDATE
      SET last_seen_at = NOW()
    RETURNING id INTO pid;
  END IF;

  SELECT COUNT(*) INTO owned FROM public.greenhouses WHERE owner_id = pid;
  IF owned >= 10 THEN
    RAISE EXCEPTION 'house_limit_reached';
  END IF;

  RETURN public.provision_owned_greenhouse(pid, p_name, p_location, p_crop_name);
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_own_greenhouse()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
  gid UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not_authenticated';
  END IF;

  UPDATE public.profiles
  SET last_seen_at = NOW(), status = 'active'
  WHERE auth_user_id = auth.uid();

  IF public.is_admin() THEN
    RETURN NULL;
  END IF;

  SELECT id INTO pid
  FROM public.profiles
  WHERE auth_user_id = auth.uid();

  IF pid IS NULL THEN
    INSERT INTO public.profiles (auth_user_id, role, full_name, email, status, last_seen_at)
    SELECT
      u.id,
      'farmer',
      COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
      u.email,
      'active',
      NOW()
    FROM auth.users u
    WHERE u.id = auth.uid()
    ON CONFLICT (auth_user_id) DO UPDATE
      SET last_seen_at = NOW()
    RETURNING id INTO pid;
  END IF;

  SELECT id INTO gid
  FROM public.greenhouses
  WHERE owner_id = pid
  ORDER BY created_at
  LIMIT 1;

  IF gid IS NOT NULL THEN
    PERFORM public.seed_house_operating_history(gid);
    RETURN gid;
  END IF;

  RETURN public.provision_owned_greenhouse(pid, 'My Greenhouse', NULL, 'Mixed greens');
END;
$$;

CREATE OR REPLACE FUNCTION public.record_live_reading(
  p_greenhouse_id UUID,
  p_temperature NUMERIC,
  p_humidity NUMERIC,
  p_soil_moisture NUMERIC
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_authenticated');
  END IF;

  IF p_greenhouse_id IS NULL OR NOT public.owns_greenhouse(p_greenhouse_id) THEN
    IF NOT public.is_admin() THEN
      RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
    END IF;
  END IF;

  IF p_temperature IS NULL AND p_humidity IS NULL AND p_soil_moisture IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'empty');
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.sensor_readings sr
    WHERE sr.greenhouse_id = p_greenhouse_id
      AND sr.source = 'mqtt'
      AND sr.created_at > NOW() - INTERVAL '15 seconds'
  ) THEN
    RETURN jsonb_build_object('ok', true, 'skipped', true);
  END IF;

  INSERT INTO public.sensor_readings (
    greenhouse_id, user_id, temperature, humidity, soil_moisture, source, created_at
  ) VALUES (
    p_greenhouse_id,
    auth.uid(),
    ROUND(p_temperature, 2),
    ROUND(p_humidity, 2),
    ROUND(p_soil_moisture, 2),
    'mqtt',
    NOW()
  );

  UPDATE public.devices
  SET last_heartbeat = NOW(), is_online = true
  WHERE greenhouse_id = p_greenhouse_id;

  RETURN jsonb_build_object('ok', true);
END;
$$;

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
    WHERE g.status = 'online'
      AND (g.code LIKE 'GH-%' OR g.code LIKE 'OP-%')
  LOOP
    IF EXISTS (
      SELECT 1
      FROM public.sensor_readings sr
      WHERE sr.greenhouse_id = gh.id
        AND sr.created_at > NOW() - INTERVAL '12 seconds'
    ) THEN
      CONTINUE;
    END IF;

    -- Live controller recently wrote this house — do not overwrite it
    IF EXISTS (
      SELECT 1
      FROM public.sensor_readings sr
      WHERE sr.greenhouse_id = gh.id
        AND sr.source = 'mqtt'
        AND sr.created_at > NOW() - INTERVAL '3 minutes'
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

    next_temp := last_temp
      + CASE
          WHEN hr BETWEEN 10 AND 16 THEN 0.16
          WHEN hr BETWEEN 0 AND 6 THEN -0.12
          ELSE 0.02
        END
      + (random() - 0.5) * 0.18
      + CASE WHEN ventilating THEN -0.22 ELSE 0 END;
    next_temp := GREATEST(16.0, LEAST(37.5, next_temp));

    next_hum := last_hum
      + (random() - 0.5) * 0.35
      + CASE WHEN ventilating THEN -0.45 ELSE 0.08 END
      + CASE WHEN irrigating THEN 0.35 ELSE -0.05 END;
    next_hum := GREATEST(32.0, LEAST(90.0, next_hum));

    next_soil := last_soil
      + CASE WHEN irrigating THEN 2.15 ELSE -0.28 - GREATEST(next_temp - 24.0, 0) * 0.025 END
      + (random() - 0.5) * 0.12;
    next_soil := GREATEST(16.0, LEAST(90.0, next_soil));

    INSERT INTO public.sensor_readings (
      greenhouse_id, temperature, humidity, soil_moisture, source, created_at
    ) VALUES (
      gh.id, ROUND(next_temp, 2), ROUND(next_hum, 2), ROUND(next_soil, 2), 'simulation', NOW()
    );

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

    UPDATE public.crops c
    SET health_status = CASE
      WHEN next_soil < 30 OR next_temp > 33 THEN 'stressed'
      WHEN next_soil >= 40 AND next_temp <= 31 THEN 'healthy'
      ELSE c.health_status
    END
    WHERE c.greenhouse_id = gh.id;

    UPDATE public.devices
    SET last_heartbeat = NOW()
    WHERE greenhouse_id = gh.id AND is_online = true;

    ticked := ticked + 1;
  END LOOP;

  RETURN jsonb_build_object('ok', true, 'houses', ticked, 'events', events);
END;
$$;

REVOKE ALL ON FUNCTION public.seed_house_operating_history(UUID) FROM PUBLIC, authenticated;
REVOKE ALL ON FUNCTION public.provision_owned_greenhouse(UUID, TEXT, TEXT, TEXT) FROM PUBLIC, authenticated;
GRANT EXECUTE ON FUNCTION public.register_own_greenhouse(TEXT, TEXT, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.ensure_own_greenhouse() TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_live_reading(UUID, NUMERIC, NUMERIC, NUMERIC) TO authenticated;
GRANT EXECUTE ON FUNCTION public.run_simulation_tick() TO authenticated;

-- Backfill personal houses that were created before this script
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT g.id
    FROM public.greenhouses g
    WHERE g.code LIKE 'OP-%'
      AND NOT EXISTS (
        SELECT 1 FROM public.sensor_readings sr WHERE sr.greenhouse_id = g.id
      )
  LOOP
    PERFORM public.seed_house_operating_history(r.id);
  END LOOP;
END $$;
