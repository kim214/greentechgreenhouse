-- =============================================================================
-- Attach YOUR real login to one seeded farmer (GH-001 … GH-015)
-- The seed names (Wanjiku, Peter, …) have no passwords. This links a login
-- you create to that farmer’s existing house.
--
-- 1. In the app, sign up with a real email you can open (not your admin email).
--    Gmail alias example: nathankimutai48+wanjiku@gmail.com
--    Confirm the email if Supabase asks, then you can ignore that new empty house.
-- 2. Replace YOUR_FARMER_EMAIL and GH-001 below.
-- 3. Run this in the SQL Editor.
-- 4. Log out, then log in with that email and the password you chose.
-- =============================================================================

DO $$
DECLARE
  uid UUID;
  seed_pid UUID;
  house_code TEXT := 'GH-001';          -- change to GH-002 … GH-015
  farmer_email TEXT := 'YOUR_FARMER_EMAIL';
BEGIN
  SELECT id INTO uid
  FROM auth.users
  WHERE lower(email) = lower(farmer_email);

  IF uid IS NULL THEN
    RAISE EXCEPTION 'No Auth user for %. Sign up with that email first.', farmer_email;
  END IF;

  SELECT p.id INTO seed_pid
  FROM public.profiles p
  JOIN public.greenhouses g ON g.owner_id = p.id
  WHERE g.code = house_code;

  IF seed_pid IS NULL THEN
    RAISE EXCEPTION 'No seeded farmer for %. Run phase2_seed.sql first.', house_code;
  END IF;

  -- Drop this login off any extra profile created at signup
  UPDATE public.profiles
  SET auth_user_id = NULL
  WHERE auth_user_id = uid
    AND id <> seed_pid;

  UPDATE public.profiles
  SET
    auth_user_id = uid,
    status = 'active',
    last_seen_at = NOW()
  WHERE id = seed_pid;
END $$;
