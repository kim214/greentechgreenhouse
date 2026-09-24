-- =============================================================================
-- GreenTech Phase 2 — schema (run in Supabase SQL Editor)
-- Safe to run after Phase 1 tables (analytics, alerts, sensor_readings) exist.
-- Does not change MQTT or frontend behaviour.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- --- Existing table extensions (nullable so current app inserts still work) ---

ALTER TABLE public.alerts
  ADD COLUMN IF NOT EXISTS greenhouse_id UUID,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'simulation';

ALTER TABLE public.alerts
  ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.sensor_readings
  ADD COLUMN IF NOT EXISTS greenhouse_id UUID,
  ADD COLUMN IF NOT EXISTS sensor_id UUID,
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'simulation';

ALTER TABLE public.sensor_readings
  ALTER COLUMN user_id DROP NOT NULL;

-- --- Profiles (farmers + admins). Seed farmers have no auth_user_id. ---

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'admin')),
  full_name TEXT NOT NULL,
  email TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'offline')),
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_auth_user_id ON public.profiles(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- --- Greenhouses ---

CREATE TABLE IF NOT EXISTS public.greenhouses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  mode TEXT NOT NULL DEFAULT 'AUTO' CHECK (mode IN ('AUTO', 'MANUAL')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_greenhouses_owner_id ON public.greenhouses(owner_id);

-- --- Crops ---

CREATE TABLE IF NOT EXISTS public.crops (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  greenhouse_id UUID NOT NULL REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  variety TEXT,
  growth_stage TEXT NOT NULL DEFAULT 'vegetative',
  planted_at DATE NOT NULL,
  expected_harvest DATE,
  health_status TEXT NOT NULL DEFAULT 'healthy',
  estimated_yield_kg NUMERIC(8,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_crops_greenhouse_id ON public.crops(greenhouse_id);

-- --- Devices ---

CREATE TABLE IF NOT EXISTS public.devices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  greenhouse_id UUID NOT NULL REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('controller', 'pump', 'fan', 'sensor_hub')),
  name TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  last_heartbeat TIMESTAMPTZ,
  power_status TEXT NOT NULL DEFAULT 'ok',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (greenhouse_id, code)
);

CREATE INDEX IF NOT EXISTS idx_devices_greenhouse_id ON public.devices(greenhouse_id);

-- --- Sensors ---

CREATE TABLE IF NOT EXISTS public.sensors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_id UUID NOT NULL REFERENCES public.devices(id) ON DELETE CASCADE,
  greenhouse_id UUID NOT NULL REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('temperature', 'humidity', 'soil_moisture', 'light')),
  code TEXT NOT NULL,
  is_online BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensors_greenhouse_id ON public.sensors(greenhouse_id);

-- --- Events ---

CREATE TABLE IF NOT EXISTS public.irrigation_events (
  id BIGSERIAL PRIMARY KEY,
  greenhouse_id UUID NOT NULL REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  trigger TEXT NOT NULL CHECK (trigger IN ('auto', 'manual')),
  estimated_litres NUMERIC(8,2),
  source TEXT NOT NULL DEFAULT 'simulation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_irrigation_events_gh ON public.irrigation_events(greenhouse_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.ventilation_events (
  id BIGSERIAL PRIMARY KEY,
  greenhouse_id UUID NOT NULL REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ NOT NULL,
  ended_at TIMESTAMPTZ,
  trigger TEXT NOT NULL CHECK (trigger IN ('auto', 'manual')),
  source TEXT NOT NULL DEFAULT 'simulation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventilation_events_gh ON public.ventilation_events(greenhouse_id, started_at DESC);

CREATE TABLE IF NOT EXISTS public.automation_events (
  id BIGSERIAL PRIMARY KEY,
  greenhouse_id UUID NOT NULL REFERENCES public.greenhouses(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  reason TEXT,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'simulation'
);

CREATE INDEX IF NOT EXISTS idx_automation_events_gh ON public.automation_events(greenhouse_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS public.activity_logs (
  id BIGSERIAL PRIMARY KEY,
  greenhouse_id UUID REFERENCES public.greenhouses(id) ON DELETE SET NULL,
  actor_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  source TEXT NOT NULL DEFAULT 'simulation'
);

CREATE INDEX IF NOT EXISTS idx_activity_logs_occurred ON public.activity_logs(occurred_at DESC);

-- FKs from extended tables
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'alerts_greenhouse_id_fkey'
  ) THEN
    ALTER TABLE public.alerts
      ADD CONSTRAINT alerts_greenhouse_id_fkey
      FOREIGN KEY (greenhouse_id) REFERENCES public.greenhouses(id) ON DELETE SET NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'sensor_readings_greenhouse_id_fkey'
  ) THEN
    ALTER TABLE public.sensor_readings
      ADD CONSTRAINT sensor_readings_greenhouse_id_fkey
      FOREIGN KEY (greenhouse_id) REFERENCES public.greenhouses(id) ON DELETE SET NULL;
  END IF;
END $$;

-- --- Helpers ---

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.auth_user_id = auth.uid()
      AND p.role = 'admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.owns_greenhouse(p_greenhouse_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.greenhouses g
    JOIN public.profiles p ON p.id = g.owner_id
    WHERE g.id = p_greenhouse_id
      AND p.auth_user_id = auth.uid()
  );
$$;

-- Auto-create a farmer profile when a real user signs up
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id, role, full_name, email, status, last_seen_at)
  VALUES (
    NEW.id,
    'farmer',
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'active',
    NOW()
  )
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_auth_user();

-- --- RLS ---

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.greenhouses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.irrigation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ventilation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.automation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Drop-if-exists then create (idempotent re-run)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname, tablename
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN (
        'profiles', 'greenhouses', 'crops', 'devices', 'sensors',
        'irrigation_events', 'ventilation_events', 'automation_events', 'activity_logs'
      )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', pol.policyname, pol.tablename);
  END LOOP;
END $$;

CREATE POLICY "profiles_select"
  ON public.profiles FOR SELECT
  USING (public.is_admin() OR auth_user_id = auth.uid());

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth_user_id = auth.uid() OR public.is_admin());

CREATE POLICY "greenhouses_select"
  ON public.greenhouses FOR SELECT
  USING (public.is_admin() OR public.owns_greenhouse(id));

CREATE POLICY "crops_select"
  ON public.crops FOR SELECT
  USING (public.is_admin() OR public.owns_greenhouse(greenhouse_id));

CREATE POLICY "devices_select"
  ON public.devices FOR SELECT
  USING (public.is_admin() OR public.owns_greenhouse(greenhouse_id));

CREATE POLICY "sensors_select"
  ON public.sensors FOR SELECT
  USING (public.is_admin() OR public.owns_greenhouse(greenhouse_id));

CREATE POLICY "irrigation_events_select"
  ON public.irrigation_events FOR SELECT
  USING (public.is_admin() OR public.owns_greenhouse(greenhouse_id));

CREATE POLICY "ventilation_events_select"
  ON public.ventilation_events FOR SELECT
  USING (public.is_admin() OR public.owns_greenhouse(greenhouse_id));

CREATE POLICY "automation_events_select"
  ON public.automation_events FOR SELECT
  USING (public.is_admin() OR public.owns_greenhouse(greenhouse_id));

CREATE POLICY "activity_logs_select"
  ON public.activity_logs FOR SELECT
  USING (
    public.is_admin()
    OR greenhouse_id IS NULL
    OR public.owns_greenhouse(greenhouse_id)
  );

-- Admins can insert operational rows (seed is run as postgres / SQL editor bypasses RLS)
CREATE POLICY "admin_insert_greenhouses"
  ON public.greenhouses FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "admin_insert_activity"
  ON public.activity_logs FOR INSERT WITH CHECK (public.is_admin());

-- Existing alerts / readings: keep own-user policies; allow admin + greenhouse owners
DROP POLICY IF EXISTS "Users can read own alerts" ON public.alerts;
CREATE POLICY "alerts_select_extended"
  ON public.alerts FOR SELECT
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (greenhouse_id IS NOT NULL AND public.owns_greenhouse(greenhouse_id))
  );

DROP POLICY IF EXISTS "Users can read own sensor readings" ON public.sensor_readings;
CREATE POLICY "sensor_readings_select_extended"
  ON public.sensor_readings FOR SELECT
  USING (
    public.is_admin()
    OR user_id = auth.uid()
    OR (greenhouse_id IS NOT NULL AND public.owns_greenhouse(greenhouse_id))
  );
