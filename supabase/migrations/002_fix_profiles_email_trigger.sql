-- ============================================================
-- MIGRATION 002 — Fix profiles: add email column + auto-create
-- trigger to resolve RLS violation on signup.
--
-- ROOT CAUSE:
--   The original schema had no `email` column, but authStore.ts
--   tried to insert one. Additionally, the client-side INSERT
--   fires before the Supabase session is fully established, so
--   auth.uid() returns NULL — causing the RLS policy
--   "auth.uid() = id" to fail with a permission denied error.
--
-- FIX:
--   1. Add the missing `email` column to profiles.
--   2. Drop the client-side INSERT policy (no longer needed).
--   3. Create a SECURITY DEFINER trigger function on auth.users
--      that auto-creates the profile row the moment a new auth
--      user is created. SECURITY DEFINER runs as the function
--      owner (postgres role), bypassing RLS entirely — this is
--      the canonical Supabase pattern for profile creation.
--   4. The client-side signUp() now passes full_name and username
--      via options.data (raw_user_meta_data), which the trigger
--      reads directly from the auth.users row.
-- ============================================================

-- ─── STEP 1: Add missing email column ────────────────────────
-- IF NOT EXISTS prevents an error if you already added it manually.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT;

-- ─── STEP 2: Drop old client-side INSERT policy ───────────────
-- This policy required auth.uid() to be set at insert time,
-- which isn't guaranteed during the signUp() flow.
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

-- ─── STEP 3: Create the auto-profile trigger function ─────────
-- SECURITY DEFINER means this runs as the postgres superuser,
-- so it can INSERT into profiles regardless of RLS policies.
-- The NEW record is the freshly-created row in auth.users.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    username
  )
  VALUES (
    -- auth.users.id becomes the profile id (same UUID)
    NEW.id,

    -- email lives on auth.users directly
    NEW.email,

    -- full_name and username are passed from the client via
    -- supabase.auth.signUp({ options: { data: { ... } } })
    -- and stored in raw_user_meta_data (a JSONB column).
    -- COALESCE falls back to empty string if not provided.
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'username',  'user_' || substr(NEW.id::text, 1, 8))
  )
  -- ON CONFLICT handles the edge case where the profile row
  -- already exists (e.g., manual insert or re-trigger).
  ON CONFLICT (id) DO UPDATE
    SET
      email     = EXCLUDED.email,
      full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
      username  = COALESCE(EXCLUDED.username,  public.profiles.username);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Make sure only one trigger of this type exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Fire AFTER INSERT on auth.users — once per new user row
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ─── STEP 4: Re-create a safe INSERT policy (optional fallback)
-- This allows a logged-in user to insert their own profile if
-- somehow the trigger didn't fire (e.g., in local dev without
-- the trigger). The trigger is the primary mechanism.
CREATE POLICY "Users can insert their own profile"
  ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ─── STEP 5: Backfill email for any existing profiles ─────────
-- If you already have profile rows without an email value,
-- this pulls the email from auth.users to fill the gap.
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id
  AND p.email IS NULL;
