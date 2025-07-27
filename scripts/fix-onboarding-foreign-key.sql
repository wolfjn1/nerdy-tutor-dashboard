-- Fix for onboarding foreign key issue
-- This script modifies the tutor_onboarding table to handle cases where
-- users don't have a corresponding record in the tutors table

-- Option 1: Create missing tutor records for existing auth users
-- This creates a tutor record for any auth user who doesn't have one
INSERT INTO tutors (auth_user_id, email, first_name, last_name, subjects, hourly_rate, availability, rating, total_earnings)
SELECT 
    au.id as auth_user_id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', 'New') as first_name,
    COALESCE(au.raw_user_meta_data->>'last_name', 'Tutor') as last_name,
    '{}' as subjects,
    50 as hourly_rate,
    '{}' as availability,
    0 as rating,
    0 as total_earnings
FROM auth.users au
LEFT JOIN tutors t ON t.auth_user_id = au.id
WHERE t.id IS NULL;

-- Option 2: Alternative approach - modify the foreign key constraint
-- WARNING: This approach changes the table structure significantly
-- Only use if Option 1 doesn't work for your use case

/*
-- First, drop the existing foreign key constraint
ALTER TABLE tutor_onboarding 
DROP CONSTRAINT IF EXISTS tutor_onboarding_tutor_id_fkey;

-- Add auth_user_id column
ALTER TABLE tutor_onboarding 
ADD COLUMN IF NOT EXISTS auth_user_id UUID;

-- Update existing records to set auth_user_id based on tutor_id
UPDATE tutor_onboarding to_table
SET auth_user_id = t.auth_user_id
FROM tutors t
WHERE to_table.tutor_id = t.id;

-- Make auth_user_id not null
ALTER TABLE tutor_onboarding 
ALTER COLUMN auth_user_id SET NOT NULL;

-- Add new foreign key to auth.users
ALTER TABLE tutor_onboarding 
ADD CONSTRAINT tutor_onboarding_auth_user_id_fkey 
FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create index on auth_user_id
CREATE INDEX IF NOT EXISTS idx_tutor_onboarding_auth_user_id 
ON tutor_onboarding(auth_user_id);

-- Update unique constraint
ALTER TABLE tutor_onboarding 
DROP CONSTRAINT IF EXISTS tutor_onboarding_tutor_id_step_completed_key;

ALTER TABLE tutor_onboarding 
ADD CONSTRAINT tutor_onboarding_auth_user_id_step_completed_key 
UNIQUE(auth_user_id, step_completed);
*/

-- Verify the fix worked
SELECT 
    COUNT(*) as total_auth_users,
    COUNT(t.id) as users_with_tutor_records,
    COUNT(*) - COUNT(t.id) as users_without_tutor_records
FROM auth.users au
LEFT JOIN tutors t ON t.auth_user_id = au.id; 