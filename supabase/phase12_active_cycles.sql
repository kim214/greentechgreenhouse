-- =============================================================================
-- Open automatic irrigation / ventilation on selected houses
-- Safe to re-run. Does not close existing cycles that are already open.
-- Tick will keep them running while soil stays low / temperature stays high.
-- =============================================================================

-- Irrigation running: GH-005, GH-009, GH-015
INSERT INTO public.irrigation_events (greenhouse_id, started_at, trigger, estimated_litres, source)
SELECT g.id, NOW() - INTERVAL '18 minutes', 'auto', 0, 'simulation'
FROM public.greenhouses g
WHERE g.code IN ('GH-005', 'GH-009', 'GH-015')
  AND g.status = 'online'
  AND NOT EXISTS (
    SELECT 1 FROM public.irrigation_events ie
    WHERE ie.greenhouse_id = g.id AND ie.ended_at IS NULL
  );

INSERT INTO public.sensor_readings (greenhouse_id, temperature, humidity, soil_moisture, source, created_at)
SELECT g.id, 24.6, 61.0, 27.4, 'simulation', NOW()
FROM public.greenhouses g
WHERE g.code IN ('GH-005', 'GH-009', 'GH-015')
  AND g.status = 'online';

INSERT INTO public.automation_events (greenhouse_id, event_type, reason, source)
SELECT g.id, 'irrigation_started', 'Soil moisture fell below 32%', 'simulation'
FROM public.greenhouses g
WHERE g.code IN ('GH-005', 'GH-009', 'GH-015')
  AND g.status = 'online'
  AND NOT EXISTS (
    SELECT 1 FROM public.automation_events a
    WHERE a.greenhouse_id = g.id
      AND a.event_type = 'irrigation_started'
      AND a.occurred_at > NOW() - INTERVAL '25 minutes'
  );

INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message, source)
SELECT g.id, g.owner_id, 'Greenhouse ' || g.code || ' irrigation activated automatically.', 'simulation'
FROM public.greenhouses g
WHERE g.code IN ('GH-005', 'GH-009', 'GH-015')
  AND g.status = 'online';

-- Ventilation running: GH-003, GH-012
INSERT INTO public.ventilation_events (greenhouse_id, started_at, trigger, source)
SELECT g.id, NOW() - INTERVAL '22 minutes', 'auto', 'simulation'
FROM public.greenhouses g
WHERE g.code IN ('GH-003', 'GH-012')
  AND g.status = 'online'
  AND NOT EXISTS (
    SELECT 1 FROM public.ventilation_events ve
    WHERE ve.greenhouse_id = g.id AND ve.ended_at IS NULL
  );

INSERT INTO public.sensor_readings (greenhouse_id, temperature, humidity, soil_moisture, source, created_at)
SELECT g.id, 31.6, 58.0, 48.2, 'simulation', NOW()
FROM public.greenhouses g
WHERE g.code IN ('GH-003', 'GH-012')
  AND g.status = 'online';

INSERT INTO public.automation_events (greenhouse_id, event_type, reason, source)
SELECT g.id, 'ventilation_opened', 'Temperature exceeded 30.5°C', 'simulation'
FROM public.greenhouses g
WHERE g.code IN ('GH-003', 'GH-012')
  AND g.status = 'online'
  AND NOT EXISTS (
    SELECT 1 FROM public.automation_events a
    WHERE a.greenhouse_id = g.id
      AND a.event_type = 'ventilation_opened'
      AND a.occurred_at > NOW() - INTERVAL '25 minutes'
  );

INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message, source)
SELECT g.id, g.owner_id, 'Ventilation system activated in ' || g.code || '.', 'simulation'
FROM public.greenhouses g
WHERE g.code IN ('GH-003', 'GH-012')
  AND g.status = 'online';

-- Personal houses: first OP- house irrigates, second ventilates (or first does both if only one)
INSERT INTO public.irrigation_events (greenhouse_id, started_at, trigger, estimated_litres, source)
SELECT g.id, NOW() - INTERVAL '12 minutes', 'auto', 0, 'simulation'
FROM (
  SELECT id FROM public.greenhouses
  WHERE code LIKE 'OP-%' AND status = 'online'
  ORDER BY created_at
  LIMIT 1
) g
WHERE NOT EXISTS (
  SELECT 1 FROM public.irrigation_events ie
  WHERE ie.greenhouse_id = g.id AND ie.ended_at IS NULL
);

INSERT INTO public.sensor_readings (greenhouse_id, temperature, humidity, soil_moisture, source, created_at)
SELECT g.id, 24.8, 60.0, 26.8, 'simulation', NOW()
FROM (
  SELECT id FROM public.greenhouses
  WHERE code LIKE 'OP-%' AND status = 'online'
  ORDER BY created_at
  LIMIT 1
) g;

INSERT INTO public.ventilation_events (greenhouse_id, started_at, trigger, source)
SELECT g.id, NOW() - INTERVAL '9 minutes', 'auto', 'simulation'
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS n
  FROM public.greenhouses
  WHERE code LIKE 'OP-%' AND status = 'online'
) g
WHERE g.n = CASE WHEN (SELECT COUNT(*) FROM public.greenhouses WHERE code LIKE 'OP-%' AND status = 'online') > 1 THEN 2 ELSE 1 END
  AND NOT EXISTS (
    SELECT 1 FROM public.ventilation_events ve
    WHERE ve.greenhouse_id = g.id AND ve.ended_at IS NULL
  );

INSERT INTO public.sensor_readings (greenhouse_id, temperature, humidity, soil_moisture, source, created_at)
SELECT
  g.id,
  31.3,
  57.0,
  CASE WHEN g.n = 1 THEN 26.8 ELSE 47.0 END,
  'simulation',
  NOW()
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) AS n
  FROM public.greenhouses
  WHERE code LIKE 'OP-%' AND status = 'online'
) g
WHERE g.n = CASE
  WHEN (SELECT COUNT(*) FROM public.greenhouses WHERE code LIKE 'OP-%' AND status = 'online') > 1 THEN 2
  ELSE 1
END;
