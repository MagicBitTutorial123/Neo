# OAuth Database Error Troubleshooting Guide

## Current Issue: "Database error saving new user"

The error `Database+error+saving+new+user` indicates that Supabase is trying to create a user but failing at the database level.

## Root Causes & Solutions

### 1. **RLS Policy Issues** (Most Likely)
**Problem**: Row Level Security policies are too restrictive and blocking profile creation.

**Solution**: Run the SQL from `fix-rls-policies.sql` in your Supabase SQL editor:

```sql
-- Drop restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

-- Create permissive policy
CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR 
    (auth.uid() IS NOT NULL AND user_id = auth.uid())
  );

-- Allow service role
CREATE POLICY "Service role can create profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

-- Grant permissions
GRANT ALL ON public.user_profiles TO service_role;
```

### 2. **Missing Service Role Key**
**Problem**: The OAuth callback can't create profiles due to insufficient permissions.

**Solution**: Add `SUPABASE_SERVICE_ROLE_KEY` to your `.env.local`:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**How to get it**:
1. Go to Supabase Dashboard → Settings → API
2. Copy the "service_role" key (NOT the anon key)

### 3. **Database Trigger Failure**
**Problem**: The `handle_new_user` trigger might not be working.

**Solution**: Verify the trigger exists in Supabase SQL editor:

```sql
-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- If missing, recreate it
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, email, full_name, avatar, created_at, updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
    COALESCE(NEW.raw_user_meta_data->>'avatar', '/Avatar01.png'),
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### 4. **Table Structure Issues**
**Problem**: The `user_profiles` table might not exist or have wrong structure.

**Solution**: Run the complete table creation SQL from `create-user-profiles.sql`.

## Immediate Fix Steps

### Step 1: Add Service Role Key
```bash
# In your .env.local file
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### Step 2: Fix RLS Policies
Run this in Supabase SQL editor:
```sql
-- Fix the restrictive policy
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;

CREATE POLICY "Users can insert own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service role
CREATE POLICY "Service role can create profiles" ON public.user_profiles
  FOR INSERT WITH CHECK (true);

GRANT ALL ON public.user_profiles TO service_role;
```

### Step 3: Test OAuth Flow
1. Restart your dev server: `npm run dev`
2. Try Google OAuth login
3. Check browser console for detailed error logs

## Debug Information

### Check Current Policies
```sql
SELECT 
  policyname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';
```

### Check Table Permissions
```sql
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'user_profiles';
```

### Check Trigger Status
```sql
SELECT 
  trigger_name,
  event_manipulation,
  action_statement,
  action_timing
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

## Fallback Solution

If the database trigger still fails, the OAuth callback will now:
1. Try to create profile with user permissions
2. Fall back to service role if available
3. Continue with login even if profile creation fails
4. Profile can be created later by the client

## Testing

After applying fixes:
1. Clear browser cookies/localStorage
2. Try Google OAuth login
3. Check browser console for success messages
4. Verify profile exists in Supabase `user_profiles` table

## Common Error Messages

- `"new row violates row-level security policy"` → RLS policy issue
- `"permission denied for table user_profiles"` → Missing permissions
- `"function handle_new_user() does not exist"` → Missing trigger
- `"relation user_profiles does not exist"` → Missing table

## Next Steps

1. Apply the RLS policy fixes
2. Add service role key to environment
3. Test OAuth flow
4. Monitor console logs for success/errors
5. Verify profile creation in database


