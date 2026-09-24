-- =============================================================================
-- Promote YOUR real Supabase account to admin
-- 1. Sign up / confirm the email in the GreenTech app or Supabase Auth.
-- 2. Replace YOUR_EMAIL_HERE below.
-- 3. Run this in the SQL Editor.
-- =============================================================================

INSERT INTO public.profiles (auth_user_id, role, full_name, email, location, status, last_seen_at)
SELECT
  u.id,
  'admin',
  COALESCE(u.raw_user_meta_data->>'full_name', split_part(u.email, '@', 1)),
  u.email,
  'Nairobi, Kenya',
  'active',
  NOW()
FROM auth.users u
WHERE u.email = 'nathankimutai48@gmail.com'
ON CONFLICT (auth_user_id) DO UPDATE
SET
  role = 'admin',
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  last_seen_at = NOW();
