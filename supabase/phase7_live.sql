-- =============================================================================
-- GreenTech Phase 7 — live updates (run in Supabase SQL Editor)
-- Adds operational tables to supabase_realtime so dashboards refresh on
-- inserts/updates instead of polling harder. Does not change tick rate or MQTT.
-- =============================================================================

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'sensor_readings',
    'alerts',
    'activity_logs',
    'irrigation_events',
    'ventilation_events',
    'automation_events',
    'devices',
    'greenhouses',
    'crops'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1
      FROM pg_publication_tables
      WHERE pubname = 'supabase_realtime'
        AND schemaname = 'public'
        AND tablename = t
    ) THEN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    END IF;
  END LOOP;
END $$;
