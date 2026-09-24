-- =============================================================================
-- GreenTech Phase 10 — hourly history for charts and benefits
-- After 20s ticks, raw latest-N queries no longer represent 7 days.
-- These RPCs return one reading per hour (invoker RLS still applies).
-- =============================================================================

CREATE OR REPLACE FUNCTION public.hourly_sensor_history(
  p_greenhouse_id UUID,
  p_days INT DEFAULT 7
)
RETURNS TABLE (
  temperature NUMERIC,
  humidity NUMERIC,
  soil_moisture NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT ON (date_trunc('hour', sr.created_at))
    sr.temperature,
    sr.humidity,
    sr.soil_moisture,
    sr.created_at
  FROM public.sensor_readings sr
  WHERE sr.greenhouse_id = p_greenhouse_id
    AND sr.created_at >= NOW() - make_interval(days => GREATEST(p_days, 1))
  ORDER BY date_trunc('hour', sr.created_at), sr.created_at DESC;
$$;

CREATE OR REPLACE FUNCTION public.hourly_sensor_history_fleet(p_days INT DEFAULT 7)
RETURNS TABLE (
  greenhouse_id UUID,
  temperature NUMERIC,
  humidity NUMERIC,
  soil_moisture NUMERIC,
  created_at TIMESTAMPTZ
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT DISTINCT ON (sr.greenhouse_id, date_trunc('hour', sr.created_at))
    sr.greenhouse_id,
    sr.temperature,
    sr.humidity,
    sr.soil_moisture,
    sr.created_at
  FROM public.sensor_readings sr
  WHERE sr.greenhouse_id IS NOT NULL
    AND sr.created_at >= NOW() - make_interval(days => GREATEST(p_days, 1))
  ORDER BY sr.greenhouse_id, date_trunc('hour', sr.created_at), sr.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.hourly_sensor_history(UUID, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.hourly_sensor_history_fleet(INT) TO authenticated;
