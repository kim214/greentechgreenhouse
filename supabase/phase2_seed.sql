-- =============================================================================
-- GreenTech Phase 2 — fictional operational seed (15 greenhouses)
-- Run AFTER phase2_schema.sql
-- Safe to re-run: clears Phase 2 seed rows tagged by greenhouse codes GH-001..GH-015
-- Does not delete real user analytics/alerts that have no greenhouse_id
-- =============================================================================

BEGIN;

-- Remove previous seed (by greenhouse code prefix)
DELETE FROM public.activity_logs
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.automation_events
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.ventilation_events
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.irrigation_events
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.alerts
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.sensor_readings
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.sensors
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.devices
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.crops
WHERE greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%');
DELETE FROM public.greenhouses WHERE code LIKE 'GH-%';
DELETE FROM public.profiles
WHERE auth_user_id IS NULL AND email LIKE '%@riftvalley.farms';

WITH farm AS (
  SELECT * FROM (VALUES
    (1,  'Wanjiku M.',     'wanjiku.m@riftvalley.farms',     'Naivasha, Kenya',     'active',  'GH-001', 'Valley View House',   'online',      'AUTO',   'Tomato',     'Anna F1',       'fruiting',    86,  DATE '2026-06-12', DATE '2026-10-05', 'healthy',     true,  true),
    (2,  'Peter Ochieng',  'peter.o@riftvalley.farms',       'Kisumu, Kenya',       'active',  'GH-002', 'Ridge Lettuce Bay',   'online',      'AUTO',   'Lettuce',    'Butterhead',    'vegetative',  54,  DATE '2026-07-20', DATE '2026-09-28', 'healthy',     true,  true),
    (3,  'Amina Yusuf',    'amina.y@riftvalley.farms',       'Isiolo, Kenya',       'active',  'GH-003', 'Lake Shore Peppers',  'online',      'AUTO',   'Pepper',     'California W.', 'flowering',   41,  DATE '2026-05-30', DATE '2026-10-18', 'stressed',    true,  true),
    (4,  'Samuel Kiptoo',  'samuel.k@riftvalley.farms',      'Eldoret, Kenya',      'active',  'GH-004', 'Highland Berries',    'online',      'AUTO',   'Strawberry', 'Chandler',      'fruiting',    72,  DATE '2026-04-08', DATE '2026-09-30', 'healthy',     true,  false),
    (5,  'Grace Atieno',   'grace.a@riftvalley.farms',       'Homa Bay, Kenya',     'active',  'GH-005', 'Sunrise Cucumbers',   'online',      'AUTO',   'Cucumber',   'Marketmore',    'vegetative',  63,  DATE '2026-08-01', DATE '2026-10-22', 'healthy',     true,  true),
    (6,  'David Mwangi',   'david.m@riftvalley.farms',       'Nyeri, Kenya',        'active',  'GH-006', 'Greenbelt Herbs',     'online',      'AUTO',   'Basil',      'Genovese',      'harvest',     38,  DATE '2026-07-02', DATE '2026-09-20', 'healthy',     true,  true),
    (7,  'Lydia Chebet',   'lydia.c@riftvalley.farms',       'Kericho, Kenya',      'offline', 'GH-007', 'Riverbend Tomatoes',  'offline',     'AUTO',   'Tomato',     'Roma VF',       'vegetative',  0,   DATE '2026-08-14', DATE '2026-11-10', 'unknown',     false, false),
    (8,  'Joseph Mutiso',  'joseph.m@riftvalley.farms',      'Machakos, Kenya',     'active',  'GH-008', 'Cedar Kale House',    'online',      'AUTO',   'Kale',       'Toscano',       'vegetative',  49,  DATE '2026-07-28', DATE '2026-10-08', 'healthy',     true,  true),
    (9,  'Hannah Njeri',   'hannah.n@riftvalley.farms',      'Thika, Kenya',        'active',  'GH-009', 'Oak Fields Spinach',  'online',      'AUTO',   'Spinach',    'Bloomsdale',    'vegetative',  28,  DATE '2026-08-18', DATE '2026-10-02', 'stressed',    true,  true),
    (10, 'Omar Hassan',    'omar.h@riftvalley.farms',        'Garissa, Kenya',      'active',  'GH-010', 'North Plot Beans',    'online',      'MANUAL', 'Beans',      'French Bean',   'flowering',   57,  DATE '2026-06-25', DATE '2026-09-26', 'healthy',     true,  true),
    (11, 'Faith Wambui',   'faith.w@riftvalley.farms',       'Kiambu, Kenya',       'active',  'GH-011', 'West Wing Roses',     'online',      'AUTO',   'Rose',       'Red Intuition', 'flowering',   120, DATE '2026-03-15', DATE '2026-10-30', 'healthy',     true,  true),
    (12, 'Brian Otieno',   'brian.o@riftvalley.farms',       'Bungoma, Kenya',      'active',  'GH-012', 'East Block Chili',    'online',      'AUTO',   'Chili',      'Bird''s Eye',   'fruiting',    33,  DATE '2026-05-18', DATE '2026-10-12', 'healthy',     true,  true),
    (13, 'Mercy Achieng',  'mercy.a@riftvalley.farms',       'Siaya, Kenya',        'active',  'GH-013', 'Central Mixed Greens','online',      'AUTO',   'Mixed greens','Mesclun',      'harvest',     44,  DATE '2026-08-05', DATE '2026-09-24', 'healthy',     true,  true),
    (14, 'Daniel Kariuki', 'daniel.k@riftvalley.farms',      'Meru, Kenya',         'offline', 'GH-014', 'South Acre Capsicum', 'maintenance', 'AUTO',   'Capsicum',   'Yolo Wonder',   'vegetative',  0,   DATE '2026-08-22', DATE '2026-11-18', 'unknown',     false, false),
    (15, 'Esther Cherono', 'esther.c@riftvalley.farms',      'Nakuru, Kenya',       'active',  'GH-015', 'Hilltop Strawberries','online',      'AUTO',   'Strawberry', 'Albion',        'fruiting',    68,  DATE '2026-04-22', DATE '2026-10-01', 'healthy',     true,  true)
  ) AS t(
    n, farmer_name, farmer_email, farmer_location, farmer_status,
    gh_code, gh_name, gh_status, gh_mode,
    crop_name, crop_variety, crop_stage, yield_kg, planted, harvest, crop_health,
    controller_online, pump_online
  )
),
ins_profiles AS (
  INSERT INTO public.profiles (role, full_name, email, location, status, last_seen_at, created_at)
  SELECT
    'farmer',
    farmer_name,
    farmer_email,
    farmer_location,
    farmer_status,
    CASE WHEN farmer_status = 'offline' THEN NOW() - INTERVAL '2 days' ELSE NOW() - (n || ' hours')::INTERVAL END,
    NOW() - (n * 9 || ' days')::INTERVAL
  FROM farm
  RETURNING id, email
),
ins_gh AS (
  INSERT INTO public.greenhouses (code, name, owner_id, location, status, mode, created_at)
  SELECT
    f.gh_code,
    f.gh_name,
    p.id,
    f.farmer_location,
    f.gh_status,
    f.gh_mode,
    NOW() - (f.n * 9 || ' days')::INTERVAL
  FROM farm f
  JOIN ins_profiles p ON p.email = f.farmer_email
  RETURNING id, code
)
INSERT INTO public.crops (
  greenhouse_id, name, variety, growth_stage, planted_at, expected_harvest, health_status, estimated_yield_kg
)
SELECT
  g.id, f.crop_name, f.crop_variety, f.crop_stage, f.planted, f.harvest, f.crop_health, f.yield_kg
FROM farm f
JOIN ins_gh g ON g.code = f.gh_code;

-- Devices + sensors
INSERT INTO public.devices (greenhouse_id, code, type, name, is_online, last_heartbeat, power_status)
SELECT g.id, 'CTL-' || RIGHT(g.code, 3), 'controller', g.name || ' Controller',
       f.controller_online,
       CASE WHEN f.controller_online THEN NOW() - INTERVAL '40 seconds' ELSE NOW() - INTERVAL '36 hours' END,
       CASE WHEN f.controller_online THEN 'ok' ELSE 'offline' END
FROM public.greenhouses g
JOIN public.profiles p ON p.id = g.owner_id
JOIN (
  SELECT * FROM (VALUES
    ('GH-001', true), ('GH-002', true), ('GH-003', true), ('GH-004', true),
    ('GH-005', true), ('GH-006', true), ('GH-007', false), ('GH-008', true),
    ('GH-009', true), ('GH-010', true), ('GH-011', true), ('GH-012', true),
    ('GH-013', true), ('GH-014', false), ('GH-015', true)
  ) AS x(code, controller_online)
) f ON f.code = g.code
WHERE g.code LIKE 'GH-%';

INSERT INTO public.devices (greenhouse_id, code, type, name, is_online, last_heartbeat, power_status)
SELECT g.id, 'PMP-' || RIGHT(g.code, 3), 'pump', 'Irrigation pump',
       CASE WHEN g.code IN ('GH-007', 'GH-014') THEN false ELSE true END,
       CASE WHEN g.code IN ('GH-007', 'GH-014') THEN NOW() - INTERVAL '36 hours' ELSE NOW() - INTERVAL '2 minutes' END,
       CASE WHEN g.code IN ('GH-007', 'GH-014') THEN 'offline' ELSE 'ok' END
FROM public.greenhouses g WHERE g.code LIKE 'GH-%';

INSERT INTO public.devices (greenhouse_id, code, type, name, is_online, last_heartbeat, power_status)
SELECT g.id, 'FAN-' || RIGHT(g.code, 3), 'fan', 'Ventilation fan',
       CASE WHEN g.code IN ('GH-007', 'GH-014') THEN false ELSE true END,
       CASE WHEN g.code IN ('GH-007', 'GH-014') THEN NOW() - INTERVAL '36 hours' ELSE NOW() - INTERVAL '90 seconds' END,
       CASE WHEN g.code IN ('GH-007', 'GH-014') THEN 'offline' ELSE 'ok' END
FROM public.greenhouses g WHERE g.code LIKE 'GH-%';

INSERT INTO public.devices (greenhouse_id, code, type, name, is_online, last_heartbeat, power_status)
SELECT g.id, 'HUB-' || RIGHT(g.code, 3), 'sensor_hub', 'Climate sensor hub',
       CASE WHEN g.code IN ('GH-004') THEN false
            WHEN g.code IN ('GH-007', 'GH-014') THEN false
            ELSE true END,
       CASE WHEN g.code IN ('GH-004') THEN NOW() - INTERVAL '18 minutes'
            WHEN g.code IN ('GH-007', 'GH-014') THEN NOW() - INTERVAL '36 hours'
            ELSE NOW() - INTERVAL '25 seconds' END,
       CASE WHEN g.code IN ('GH-007', 'GH-014') THEN 'offline'
            WHEN g.code IN ('GH-004') THEN 'degraded'
            ELSE 'ok' END
FROM public.greenhouses g WHERE g.code LIKE 'GH-%';

INSERT INTO public.sensors (device_id, greenhouse_id, type, code, is_online)
SELECT d.id, d.greenhouse_id, s.type, s.prefix || RIGHT(g.code, 3),
       CASE
         WHEN g.code IN ('GH-007', 'GH-014') THEN false
         WHEN g.code = 'GH-004' AND s.type = 'humidity' THEN false
         ELSE true
       END
FROM public.devices d
JOIN public.greenhouses g ON g.id = d.greenhouse_id
JOIN (VALUES
  ('temperature', 'TMP-'),
  ('humidity', 'HUM-'),
  ('soil_moisture', 'SOL-'),
  ('light', 'LUX-')
) AS s(type, prefix) ON d.type = 'sensor_hub'
WHERE g.code LIKE 'GH-%';

-- Hourly readings for last 7 days (online houses only). Pattern depends on GH index.
INSERT INTO public.sensor_readings (
  greenhouse_id, sensor_id, temperature, humidity, soil_moisture, source, created_at
)
SELECT
  g.id,
  NULL,
  ROUND(GREATEST(16, LEAST(36,
    22.4
    + (RIGHT(g.code, 2)::INT % 5) * 0.35
    + 3.2 * SIN(2 * PI() * EXTRACT(HOUR FROM ts) / 24.0)
    + CASE WHEN g.code = 'GH-003' THEN 4.8 ELSE 0 END
  ))::NUMERIC, 2),
  ROUND(GREATEST(35, LEAST(88,
    62
    - (RIGHT(g.code, 2)::INT % 4) * 1.1
    + 8 * COS(2 * PI() * EXTRACT(HOUR FROM ts) / 24.0)
    + CASE WHEN g.code = 'GH-012' THEN -6 ELSE 0 END
  ))::NUMERIC, 2),
  ROUND(GREATEST(18, LEAST(88,
    58
    - (RIGHT(g.code, 2)::INT % 6)
    - 10 * SIN(2 * PI() * EXTRACT(HOUR FROM ts) / 24.0)
    + CASE WHEN g.code = 'GH-009' THEN -18 ELSE 0 END
    + CASE WHEN g.code = 'GH-005' AND EXTRACT(HOUR FROM ts) IN (6,7,8) THEN 14 ELSE 0 END
  ))::NUMERIC, 2),
  'simulation',
  ts
FROM public.greenhouses g
CROSS JOIN generate_series(NOW() - INTERVAL '7 days', NOW(), INTERVAL '1 hour') AS ts
WHERE g.code LIKE 'GH-%'
  AND g.status = 'online';

-- Irrigation events (consistent with low-soil / scheduled houses)
INSERT INTO public.irrigation_events (greenhouse_id, started_at, ended_at, trigger, estimated_litres, source)
SELECT g.id, NOW() - INTERVAL '6 hours 10 minutes', NOW() - INTERVAL '5 hours 40 minutes', 'auto', 42.5, 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-005'
UNION ALL
SELECT g.id, NOW() - INTERVAL '1 day 3 hours', NOW() - INTERVAL '1 day 2 hours 25 minutes', 'auto', 38.0, 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-009'
UNION ALL
SELECT g.id, NOW() - INTERVAL '2 days 8 hours', NOW() - INTERVAL '2 days 7 hours 30 minutes', 'auto', 51.2, 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-001'
UNION ALL
SELECT g.id, NOW() - INTERVAL '18 hours', NOW() - INTERVAL '17 hours 35 minutes', 'manual', 22.0, 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-010'
UNION ALL
SELECT g.id, NOW() - INTERVAL '3 days 5 hours', NOW() - INTERVAL '3 days 4 hours 20 minutes', 'auto', 46.8, 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-015';

-- Ventilation events
INSERT INTO public.ventilation_events (greenhouse_id, started_at, ended_at, trigger, source)
SELECT g.id, NOW() - INTERVAL '90 minutes', NULL, 'auto', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-003'
UNION ALL
SELECT g.id, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours 10 minutes', 'auto', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-012'
UNION ALL
SELECT g.id, NOW() - INTERVAL '1 day 6 hours', NOW() - INTERVAL '1 day 5 hours', 'auto', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-001';

-- Automation events
INSERT INTO public.automation_events (greenhouse_id, event_type, reason, occurred_at, source)
SELECT g.id, 'irrigation_started', 'Soil moisture fell below 32%', NOW() - INTERVAL '6 hours 10 minutes', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-005'
UNION ALL
SELECT g.id, 'irrigation_stopped', 'Soil moisture reached 61%', NOW() - INTERVAL '5 hours 40 minutes', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-005'
UNION ALL
SELECT g.id, 'ventilation_opened', 'Temperature exceeded 30.5°C', NOW() - INTERVAL '90 minutes', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-003'
UNION ALL
SELECT g.id, 'mode_changed', 'Operator set mode to MANUAL', NOW() - INTERVAL '20 hours', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-010';

-- Alerts (user_id null — owned via greenhouse_id)
INSERT INTO public.alerts (user_id, greenhouse_id, title, description, severity, category, is_read, is_resolved, source, created_at)
SELECT NULL, g.id,
  'High temperature',
  'Air temperature rose above the preferred 30°C band. Ventilation is open.',
  'high', 'climate', false, false, 'simulation', NOW() - INTERVAL '85 minutes'
FROM public.greenhouses g WHERE g.code = 'GH-003'
UNION ALL
SELECT NULL, g.id,
  'Low soil moisture',
  'Root-zone moisture is below 35%. Automatic irrigation completed a cycle 1 day ago; monitor recovery.',
  'critical', 'irrigation', false, false, 'simulation', NOW() - INTERVAL '7 hours'
FROM public.greenhouses g WHERE g.code = 'GH-009'
UNION ALL
SELECT NULL, g.id,
  'Humidity sensor offline',
  'Humidity probe HUM-004 stopped reporting. Other climate sensors remain online.',
  'medium', 'sensor', true, false, 'simulation', NOW() - INTERVAL '18 minutes'
FROM public.greenhouses g WHERE g.code = 'GH-004'
UNION ALL
SELECT NULL, g.id,
  'Controller unreachable',
  'House controller has not sent a heartbeat for more than 24 hours.',
  'critical', 'system', false, false, 'simulation', NOW() - INTERVAL '30 hours'
FROM public.greenhouses g WHERE g.code = 'GH-007'
UNION ALL
SELECT NULL, g.id,
  'House in maintenance',
  'South Acre Capsicum taken offline for controller replacement.',
  'medium', 'maintenance', true, false, 'simulation', NOW() - INTERVAL '10 hours'
FROM public.greenhouses g WHERE g.code = 'GH-014'
UNION ALL
SELECT NULL, g.id,
  'Irrigation cycle completed',
  'Automatic irrigation ran for 30 minutes and restored soil moisture to target.',
  'low', 'irrigation', true, true, 'simulation', NOW() - INTERVAL '5 hours 35 minutes'
FROM public.greenhouses g WHERE g.code = 'GH-005';

-- Activity
INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message, occurred_at, source)
SELECT g.id, g.owner_id,
  'Greenhouse ' || g.code || ' irrigation activated automatically.',
  NOW() - INTERVAL '6 hours 10 minutes', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-005'
UNION ALL
SELECT g.id, g.owner_id,
  'Temperature exceeded preferred threshold in ' || g.code || '.',
  NOW() - INTERVAL '90 minutes', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-003'
UNION ALL
SELECT g.id, g.owner_id,
  'Ventilation system activated in ' || g.code || '.',
  NOW() - INTERVAL '90 minutes', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-003'
UNION ALL
SELECT g.id, g.owner_id,
  'Sensor HUM-004 stopped reporting in ' || g.code || '.',
  NOW() - INTERVAL '18 minutes', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-004'
UNION ALL
SELECT g.id, g.owner_id,
  'Farmer account opened the operations dashboard.',
  NOW() - INTERVAL '3 hours', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-001'
UNION ALL
SELECT g.id, g.owner_id,
  'Greenhouse ' || g.code || ' controller heartbeat lost.',
  NOW() - INTERVAL '36 hours', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-007'
UNION ALL
SELECT g.id, g.owner_id,
  'Mode changed to MANUAL in ' || g.code || '.',
  NOW() - INTERVAL '20 hours', 'simulation'
FROM public.greenhouses g WHERE g.code = 'GH-010';

COMMIT;
