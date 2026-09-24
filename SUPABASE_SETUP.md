# Supabase Setup Guide – GreenTech Greenhouse

Follow these steps to configure Supabase for effective login, signup, and data storage.

---

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in.
2. Click **New project**.
3. Choose organization, name, password (for the DB), and region.
4. Wait for the project to be created.

---

## 2. Get API Keys and URL

1. In the project dashboard, go to **Project Settings** (gear icon).
2. Open **API**.
3. Copy:
   - **Project URL** → use as `VITE_SUPABASE_URL`
   - **anon public** key → use as `VITE_SUPABASE_ANON_KEY`

4. Add them to your env:
   - Local: `frontend-web/.env`
   - Vercel: **Settings → Environment Variables**

---

## 3. Configure Authentication

1. Go to **Authentication** → **Providers**.
2. Ensure **Email** is enabled.

3. Go to **Authentication** → **URL Configuration**:
   - **Site URL**:  
     - Local: `http://localhost:5173`  
     - Production: `https://greentechgreenhouse.vercel.app`
   - **Redirect URLs**: add (required for password reset and auth redirects):
     - `http://localhost:5173/**`
     - `http://localhost:5173/reset-password`
     - `https://greentechgreenhouse.vercel.app/**`
     - `https://greentechgreenhouse.vercel.app/reset-password`

4. In **Authentication** → **Providers** → **Email**:
   - **Confirm email**:  
     - **ON**: Users must confirm via email before logging in (recommended).  
     - **OFF**: Can log in immediately after signup (useful for testing).

---

## 4. Create Database Tables

Open **SQL Editor** and run:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom types for alerts
CREATE TYPE alert_severity AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE alert_category AS ENUM ('sensor', 'system', 'irrigation', 'climate', 'maintenance', 'analytics');

-- Analytics table
CREATE TABLE analytics (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plant_health_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  irrigation_need_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  climate_risk_score NUMERIC(5,2) NOT NULL DEFAULT 0,
  recommendations TEXT[] DEFAULT '{}',
  snapshot JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_analytics_user_id ON analytics(user_id);
CREATE INDEX idx_analytics_created_at ON analytics(created_at DESC);

-- Alerts table
CREATE TABLE alerts (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  severity alert_severity NOT NULL DEFAULT 'medium',
  category alert_category NOT NULL DEFAULT 'sensor',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_user_resolved ON alerts(user_id, is_resolved);
CREATE INDEX idx_alerts_created_at ON alerts(created_at DESC);

-- Sensor readings table
CREATE TABLE sensor_readings (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  temperature NUMERIC(5,2) NOT NULL,
  humidity NUMERIC(5,2) NOT NULL,
  soil_moisture NUMERIC(5,2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sensor_readings_user_id ON sensor_readings(user_id);
CREATE INDEX idx_sensor_readings_created_at ON sensor_readings(created_at DESC);
```

---

## 5. Enable Row Level Security (RLS)

In **SQL Editor** run:

```sql
-- Enable RLS on all tables
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;

-- Analytics policies
CREATE POLICY "Users can read own analytics"
  ON analytics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics"
  ON analytics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Alerts policies
CREATE POLICY "Users can read own alerts"
  ON alerts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts"
  ON alerts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
  ON alerts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own alerts"
  ON alerts FOR DELETE
  USING (auth.uid() = user_id);

-- Sensor readings policies
CREATE POLICY "Users can read own sensor readings"
  ON sensor_readings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own sensor readings"
  ON sensor_readings FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## 6. How Login and Signup Work

### Signup

1. User submits email, password, full name.
2. Supabase creates a user in `auth.users` and stores `full_name` in `user_metadata`.
3. If **Confirm email** is ON: user gets an email with a confirmation link.
4. After confirmation (or immediately if OFF), user can log in.

### Login

1. User submits email and password.
2. Supabase validates credentials.
3. On success, the app stores `user.id` (UUID) in `localStorage` and redirects to the dashboard.
4. Supabase stores the session in `localStorage`; all API calls use the session token.

### Session

- Supabase keeps the session in `localStorage` and sends the auth token with requests.
- RLS uses `auth.uid()` to restrict data to the signed-in user.
- No extra client-side session handling is required.

---

## 6b. Forgot Password (Password Recovery)

### Flow

1. User clicks **Forgot password?** on the login page.
2. User enters email on `/forgot-password` and submits.
3. App calls `supabase.auth.resetPasswordForEmail(email, { redirectTo: '/reset-password' })`.
4. Supabase sends a reset email with a link.
5. User clicks the link → Supabase redirects to `/reset-password` with recovery tokens in the URL hash.
6. App detects the recovery session and shows the "Set new password" form.
7. User enters new password → app calls `supabase.auth.updateUser({ password })`.
8. User is redirected to `/login` to sign in with the new password.

### Supabase settings required

- **Redirect URLs** must include your reset page, e.g. `https://greentechgreenhouse.vercel.app/reset-password` (and `http://localhost:5173/reset-password` for local dev). See step 3 above.
- **Email templates**: Supabase uses a default template for "Reset Password". You can customize it under **Authentication** → **Email Templates** → **Reset Password** if needed.

---

## 7. Troubleshooting

| Issue | Fix |
|-------|-----|
| "User not found" or login fails | Ensure Email provider is enabled. Check credentials. |
| "Email not confirmed" | Either confirm the email or turn off **Confirm email** in Auth settings. |
| RLS blocks reads/writes | Verify policies. Logged-in user must match `user_id` in rows. |
| Redirect errors after login | Add Site URL and Redirect URLs under URL Configuration. |
| Build fails (missing env) | Ensure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in Vercel. |
| Password reset link not working | Add `/reset-password` (full URL) to Redirect URLs. Check spam folder. |
| "Invalid or expired link" on reset page | Reset links expire (~1 hour). Request a new one from `/forgot-password`. |

---

## 8. Phase 2 — operational schema and seed data

After the Phase 1 tables exist, run these in the **SQL Editor** in order:

1. `supabase/phase2_schema.sql` — profiles, greenhouses, crops, devices, sensors, events, activity logs, RLS
2. `supabase/phase2_seed.sql` — 15 fictional farmers and greenhouses with consistent history
3. `supabase/promote_admin.sql` — replace `YOUR_EMAIL_HERE` with the email you registered in Supabase Auth

The existing MQTT dashboard is unchanged. Seed `source` columns are internal only and are not shown in the UI.

## 9. Phase 3 — simulation tick

After Phase 2 seed data exists, run `supabase/phase3_simulation.sql` in the SQL Editor.

While a user is signed in, the app calls `run_simulation_tick` about every 20 seconds. That updates only the fictional GH-001…GH-015 houses in the database. It does **not** publish MQTT or replace ESP32 readings.

## 10. Phase 4 — farmer dashboard reads

After Phase 3, run `supabase/phase4_farmer.sql` so a signed-in user can read GH-001…GH-015 operational rows.

The farmer dashboard then shows climate, devices, crop, alerts, irrigation history, and analytics for the selected house. If MQTT is connected and the ESP32 is sending readings, those live values override the house climate and actuator state. Nothing in the UI is labelled demo or simulated.

## 11. Phase 5 — admin portal

No extra SQL. After `promote_admin.sql`, sign in with that email.

- `/admin` shows farmers, greenhouses, devices, alerts, and activity for the whole fleet
- Non-admin users are sent back to `/dashboard`
- MQTT and the farmer dashboard are unchanged

## 12. Phase 6 — role-based access

After Phase 4/5, run `supabase/phase6_rbac.sql`.

That removes the Phase 4 “any signed-in user can read the whole fleet” policies.

- **Admin** still sees every farmer, house, device, alert, and activity
- **Farmer** only sees houses they own
- A farmer who has no house yet gets a personal `OP-` house (simulation does not overwrite it)
- `/admin` requires an admin profile; `/dashboard` and `/settings` require a signed-in session
- MQTT is unchanged. Live ESP32 readings still win when connected

## 13. Phase 7 — live updates

After Phase 6, run `supabase/phase7_live.sql` so dashboards receive row changes over Realtime.

The simulation tick stays at about 20 seconds and still does not publish MQTT. The UI refreshes when new readings, alerts, automation, or device heartbeats land. Between ticks, house climate on screen drifts slightly so the dashboard stays in motion. If MQTT is connected, ESP32 values still replace that climate. Hidden browser tabs do not call the tick.

## 14. Phase 8 — calculated benefits

No extra SQL. Farmer **Analytics** and admin **Overview** now compute water use, water saved, irrigation frequency, automation efficiency, yield, crop performance, uptime, resource utilization, and climate stability from the last 7 days of readings and irrigation/ventilation events.

Timer-style water use is two cycles per day at that house’s (or the fleet’s) average recorded cycle size. Smart use is the sum of logged litres, or soil-rise pulses when a house has no irrigation rows. Nothing in the UI is labelled demo or simulated.

## 15. Phase 9 — UI polish

No extra SQL. Farmer and admin shells now share a responsive layout: desktop sidebar, mobile drawer, skip-to-content link, loading skeletons, empty and error states, and tighter padding on small screens. MQTT behaviour is unchanged.

## 16. Phase 10 — history + system check

Run `supabase/phase10_history.sql` so Analytics and admin benefits use **one reading per hour** for the last 7 days. Without that, 20-second ticks make “latest 200 rows” look like the last hour instead of the week.

Verify the chain after all Phase 2–10 scripts:

1. Admin at `/admin` sees 15 farmers and their houses
2. Farmer at `/dashboard` sees only their house
3. Each house has controller, pump, fan, sensor hub
4. Online `GH-%` houses keep getting new `sensor_readings` while someone is signed in
5. Soil below 32% or temperature above 30.5°C creates irrigation/ventilation events
6. Those events appear in activity and alerts
7. Dashboards refresh from the database (Realtime or the next poll)
8. Analytics water / yield / stability numbers change by house (GH-003 vs GH-007)

MQTT still overrides climate when the ESP32 is connected. Do not label demo or simulated in the UI.

## 17. Farmer multi-house

Run `supabase/phase11_farmer_houses.sql` after Phase 6 (and 10 if you use hourly charts).

A signed-in farmer can add up to 10 personal houses from the dashboard **+** button. Each house gets devices, a crop, and 7-day operating history, then keeps updating while someone is signed in. When the ESP32 is connected, live readings replace climate on the **currently open** house and are stored for that house. Other houses keep their own history.

## 18. Active irrigation and ventilation

Run `supabase/phase12_active_cycles.sql` so some houses show automatic cycles in progress:

- Irrigation running: GH-005, GH-009, GH-015
- Ventilation open: GH-003, GH-012
- Personal `OP-` houses: first house irrigates; a second house ventilates (or the first does both if it is the only one)

Admin Overview counts those open cycles. Farmer Overview, Controls, and Live Sentry show them on the selected house. Live Sentry plays house camera recordings with a live clock; irrigation and vent cameras overlay the running actuator.

## 19. Admin revenue and payments

Run these in the Supabase SQL Editor **in order**, after Phase 6 (so `is_admin()` exists):

1. `supabase/phase13_finance.sql` — ledger tables, admin-only RLS, audit RPC, and an idempotent ingest function for future provider-verified payments
2. `supabase/phase13_finance_seed.sql` — optional development ledger (`data_origin = 'sample'`). Safe to re-run; it never deletes `verified` rows

Sign in as a promoted administrator and open **Admin → Revenue**.

Integrity rules baked into the dashboard:

- **Total revenue collected** sums only `data_origin = verified` and `status = successful`
- Recorded receipts (sample + verified successful rows) power charts and operational totals so the 18-month series is usable before a processor is live
- Forecast values are computed in the client and never stored as collected payments
- Exports labelled verified omit sample rows
- No payment provider is wired yet. When one is added, call `finance_ingest_verified_payment(jsonb)` from a trusted backend after webhook verification. Duplicate `transaction_id` values are rejected

Farmers cannot read finance tables. `/admin` remains `RequireAuth adminOnly`.

---

## Checklist

- [ ] Supabase project created
- [ ] API URL and anon key in `.env` and Vercel
- [ ] Email auth enabled
- [ ] Site URL and Redirect URLs set
- [ ] Confirm email ON or OFF as desired
- [ ] Tables created (analytics, alerts, sensor_readings)
- [ ] RLS policies applied
- [ ] Test signup and login
- [ ] Add `/reset-password` to Redirect URLs for forgot password
- [ ] Phase 2: run `supabase/phase2_schema.sql` then `supabase/phase2_seed.sql`
- [ ] Phase 2: promote your real email with `supabase/promote_admin.sql`
- [ ] Phase 3: run `supabase/phase3_simulation.sql`
- [ ] Phase 4: run `supabase/phase4_farmer.sql`
- [ ] Phase 5: sign in as the promoted admin and open `/admin`
- [ ] Phase 6: run `supabase/phase6_rbac.sql`
- [ ] Phase 7: run `supabase/phase7_live.sql`
- [ ] Phase 8: open Analytics and Admin Overview and confirm water/yield numbers move with house data
- [ ] Phase 9: check dashboard and admin on a phone-width screen and confirm nav, loading, and empty states
- [ ] Phase 10: run `supabase/phase10_history.sql` and walk the admin → farmer → sensors → automation → analytics chain
- [ ] Farmer houses: run `supabase/phase11_farmer_houses.sql`, sign in as a farmer, add a second house, and switch between them
- [ ] Active cycles: run `supabase/phase12_active_cycles.sql` so GH-005/009/015 irrigate and GH-003/012 ventilate automatically
- [ ] Finance: run `supabase/phase13_finance.sql` then `supabase/phase13_finance_seed.sql`, sign in as admin, and open Admin → Revenue
