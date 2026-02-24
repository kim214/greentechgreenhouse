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
