-- =============================================================================
-- GreenTech Phase 4 — farmer dashboard reads (run in Supabase SQL Editor)
-- Requires Phase 2 schema + seed.
-- Lets any signed-in user read GH-001…GH-015 operational rows so the
-- farmer dashboard can bind. Phase 6 will tighten this to owner-only.
-- Does not change MQTT.
-- =============================================================================

DO $$
BEGIN
  -- Fleet reads (policies OR with existing owner/admin rules)
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'greenhouses' AND policyname = 'fleet_greenhouses_read'
  ) THEN
    CREATE POLICY "fleet_greenhouses_read"
      ON public.greenhouses FOR SELECT
      USING (auth.uid() IS NOT NULL AND code LIKE 'GH-%');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'crops' AND policyname = 'fleet_crops_read'
  ) THEN
    CREATE POLICY "fleet_crops_read"
      ON public.crops FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'devices' AND policyname = 'fleet_devices_read'
  ) THEN
    CREATE POLICY "fleet_devices_read"
      ON public.devices FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sensors' AND policyname = 'fleet_sensors_read'
  ) THEN
    CREATE POLICY "fleet_sensors_read"
      ON public.sensors FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'irrigation_events' AND policyname = 'fleet_irrigation_read'
  ) THEN
    CREATE POLICY "fleet_irrigation_read"
      ON public.irrigation_events FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'ventilation_events' AND policyname = 'fleet_ventilation_read'
  ) THEN
    CREATE POLICY "fleet_ventilation_read"
      ON public.ventilation_events FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'automation_events' AND policyname = 'fleet_automation_read'
  ) THEN
    CREATE POLICY "fleet_automation_read"
      ON public.automation_events FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'activity_logs' AND policyname = 'fleet_activity_read'
  ) THEN
    CREATE POLICY "fleet_activity_read"
      ON public.activity_logs FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'fleet_alerts_read'
  ) THEN
    CREATE POLICY "fleet_alerts_read"
      ON public.alerts FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'sensor_readings' AND policyname = 'fleet_readings_read'
  ) THEN
    CREATE POLICY "fleet_readings_read"
      ON public.sensor_readings FOR SELECT
      USING (
        auth.uid() IS NOT NULL
        AND greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'alerts' AND policyname = 'fleet_alerts_update'
  ) THEN
    CREATE POLICY "fleet_alerts_update"
      ON public.alerts FOR UPDATE
      USING (
        auth.uid() IS NOT NULL
        AND (
          user_id = auth.uid()
          OR greenhouse_id IN (SELECT id FROM public.greenhouses WHERE code LIKE 'GH-%')
        )
      );
  END IF;
END $$;
