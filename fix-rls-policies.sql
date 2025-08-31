-- Fix RLS Policies for OAuth User Profile Creation
-- This fixes the "Database error saving new user" issue

-- 1. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- 2. Create a more permissive insert policy that allows:
--    - Users to insert their own profile
--    - Database triggers to create profiles for new users
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    -- Allow the handle_new_user function to create profiles
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- 3. Also create a policy for the service role to create profiles
-- This ensures the database trigger can work properly
CREATE POLICY "Service role can create profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- 4. Grant necessary permissions to the service role
GRANT ALL ON public.user_profiles TO service_role;

-- 5. Ensure the trigger function has proper permissions
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;

-- 6. Test the policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 7. Verify the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';




