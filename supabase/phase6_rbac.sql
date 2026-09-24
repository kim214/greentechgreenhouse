-- =============================================================================
-- GreenTech Phase 6 — role-based access (run in Supabase SQL Editor)
-- Requires Phase 2 schema. Safe after Phase 4/5.
-- Drops the Phase 4 fleet-wide reads. Farmers keep only their own house.
-- Admins keep full platform access. Does not change MQTT.
-- =============================================================================

DROP POLICY IF EXISTS "fleet_greenhouses_read" ON public.greenhouses;
DROP POLICY IF EXISTS "fleet_crops_read" ON public.crops;
DROP POLICY IF EXISTS "fleet_devices_read" ON public.devices;
DROP POLICY IF EXISTS "fleet_sensors_read" ON public.sensors;
DROP POLICY IF EXISTS "fleet_irrigation_read" ON public.irrigation_events;
DROP POLICY IF EXISTS "fleet_ventilation_read" ON public.ventilation_events;
DROP POLICY IF EXISTS "fleet_automation_read" ON public.automation_events;
DROP POLICY IF EXISTS "fleet_activity_read" ON public.activity_logs;
DROP POLICY IF EXISTS "fleet_alerts_read" ON public.alerts;
DROP POLICY IF EXISTS "fleet_readings_read" ON public.sensor_readings;
DROP POLICY IF EXISTS "fleet_alerts_update" ON public.alerts;

-- Unowned activity lines are admin-only
DROP POLICY IF EXISTS "activity_logs_select" ON public.activity_logs;
CREATE POLICY "activity_logs_select"
  ON public.activity_logs FOR SELECT
  USING (
    public.is_admin()
    OR (greenhouse_id IS NOT NULL AND public.owns_greenhouse(greenhouse_id))
  );

-- Owners and admins can resolve house alerts (user_id is often null on fleet rows)
DROP POLICY IF EXISTS "alerts_update_owner_admin" ON public.alerts;
CREATE POLICY "alerts_update_owner_admin"
  ON public.alerts FOR UPDATE
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (greenhouse_id IS NOT NULL AND public.owns_greenhouse(greenhouse_id))
  );

-- Provision a personal house for a signed-in farmer who does not own one yet.
-- Code uses OP- so Phase 3 simulation (GH-%) never overwrites it.
-- MQTT / ESP32 remains the live climate source for that farmer.
CREATE OR REPLACE FUNCTION public.ensure_own_greenhouse()
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pid UUID;
  gid UUID;
  new_code TEXT;
  hub_id UUID;
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
    RETURN gid;
  END IF;

  new_code := 'OP-' || UPPER(SUBSTRING(REPLACE(pid::text, '-', ''), 1, 6));

  INSERT INTO public.greenhouses (code, name, owner_id, location, status, mode)
  VALUES (new_code, 'My Greenhouse', pid, NULL, 'online', 'AUTO')
  ON CONFLICT (code) DO NOTHING
  RETURNING id INTO gid;

  IF gid IS NULL THEN
    SELECT id INTO gid FROM public.greenhouses WHERE owner_id = pid LIMIT 1;
  END IF;

  IF gid IS NULL THEN
    new_code := 'OP-' || UPPER(SUBSTRING(REPLACE(gen_random_uuid()::text, '-', ''), 1, 6));
    INSERT INTO public.greenhouses (code, name, owner_id, location, status, mode)
    VALUES (new_code, 'My Greenhouse', pid, NULL, 'online', 'AUTO')
    RETURNING id INTO gid;
  END IF;

  INSERT INTO public.crops (
    greenhouse_id, name, variety, growth_stage, planted_at, expected_harvest, health_status, estimated_yield_kg
  )
  SELECT gid, 'Mixed greens', 'House mix', 'vegetative', CURRENT_DATE, CURRENT_DATE + 45, 'healthy', NULL
  WHERE NOT EXISTS (SELECT 1 FROM public.crops c WHERE c.greenhouse_id = gid);

  INSERT INTO public.devices (greenhouse_id, code, type, name, is_online, last_heartbeat, power_status)
  SELECT gid, prefix || SUBSTRING(new_code FROM 4), dtype, dname, true, NOW(), 'ok'
  FROM (VALUES
    ('CTL-', 'controller', 'House controller'),
    ('PMP-', 'pump', 'Irrigation pump'),
    ('FAN-', 'fan', 'Ventilation fan'),
    ('HUB-', 'sensor_hub', 'Climate sensor hub')
  ) AS d(prefix, dtype, dname)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.devices x WHERE x.greenhouse_id = gid AND x.type = d.dtype
  );

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
    ) AS s(stype, sprefix)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.sensors y WHERE y.greenhouse_id = gid AND y.type = s.stype
    );
  END IF;

  INSERT INTO public.activity_logs (greenhouse_id, actor_profile_id, message)
  VALUES (gid, pid, 'Farmer account opened the operations dashboard.');

  RETURN gid;
END;
$$;

GRANT EXECUTE ON FUNCTION public.ensure_own_greenhouse() TO authenticated;
