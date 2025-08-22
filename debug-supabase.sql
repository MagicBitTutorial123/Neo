-- Debug Script for user_profiles table
-- Run these commands in Supabase SQL Editor to troubleshoot

-- 1. Check if the table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- 2. Check table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 3. Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 4. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 5. Check permissions
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'user_profiles';

-- 6. Check if there are any rows (this should show 0 if table is empty)
SELECT COUNT(*) as total_rows FROM public.user_profiles;

-- 7. Check auth.users table to see if users exist there
SELECT id, email, email_confirmed_at, created_at 
FROM auth.users 
LIMIT 5;

-- 8. Check if there are any errors in the table
SELECT * FROM public.user_profiles LIMIT 5;
