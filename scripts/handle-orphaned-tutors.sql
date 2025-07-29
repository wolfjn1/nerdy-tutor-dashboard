-- Handle orphaned tutor records (tutors without matching auth users)

-- List the orphaned tutors again for reference
SELECT 
    'ORPHANED TUTORS' as status,
    t.id,
    t.email,
    t.first_name || ' ' || t.last_name as full_name
FROM tutors t
WHERE t.auth_user_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = t.email
)
ORDER BY t.email;

-- OPTION 1: Delete orphaned test tutors (RECOMMENDED if these are test data)
-- Uncomment the lines below to delete them

/*
-- First, delete any related records to avoid foreign key violations
DELETE FROM tutor_bonuses WHERE tutor_id IN (
    SELECT id FROM tutors t
    WHERE t.auth_user_id IS NULL
    AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
);

DELETE FROM tutor_tiers WHERE tutor_id IN (
    SELECT id FROM tutors t
    WHERE t.auth_user_id IS NULL
    AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
);

DELETE FROM gamification_points WHERE tutor_id IN (
    SELECT id FROM tutors t
    WHERE t.auth_user_id IS NULL
    AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
);

DELETE FROM tutor_badges WHERE tutor_id IN (
    SELECT id FROM tutors t
    WHERE t.auth_user_id IS NULL
    AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
);

-- Then delete the orphaned tutors
DELETE FROM tutors t
WHERE t.auth_user_id IS NULL
AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email);

SELECT 'Deleted orphaned tutor records' as result;
*/

-- OPTION 2: Create auth users for these tutors (if they're real tutors)
-- This requires Supabase Admin access to create auth users
-- Note: You'll need to handle passwords separately

/*
-- This would need to be done through Supabase Dashboard or Auth Admin API
-- as you cannot directly insert into auth.users from SQL
*/

-- OPTION 3: Keep them but update RLS to handle orphaned records gracefully
-- This is already done in the updated RLS policies which check for email matches

-- Verify final state
SELECT 
    'Final State' as check_type,
    COUNT(*) FILTER (WHERE auth_user_id IS NOT NULL) as linked_tutors,
    COUNT(*) FILTER (WHERE auth_user_id IS NULL) as unlinked_tutors,
    COUNT(*) as total_tutors
FROM tutors; 