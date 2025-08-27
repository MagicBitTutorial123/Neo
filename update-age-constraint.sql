-- Update age constraint from 13-120 to 5-120
-- Run this in your Supabase SQL Editor

-- First, drop the existing constraint
ALTER TABLE public.user_profiles DROP CONSTRAINT IF EXISTS user_profiles_age_check;

-- Add the new constraint with the updated range
ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_age_check CHECK (age >= 5 AND age <= 120);

-- Verify the change
SELECT 
  constraint_name,
  check_clause
FROM information_schema.check_constraints 
WHERE constraint_name = 'user_profiles_age_check';

-- Test the constraint by trying to insert/update with different ages
-- This should work (age 5):
-- UPDATE public.user_profiles SET age = 5 WHERE user_id = 'your-user-id';

-- This should fail (age 4):
-- UPDATE public.user_profiles SET age = 4 WHERE user_id = 'your-user-id';
