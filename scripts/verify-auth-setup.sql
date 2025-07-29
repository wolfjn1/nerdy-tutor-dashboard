-- Verification script for auth setup and RLS policies
-- Run this to diagnose auth-related issues

-- 1. Check auth users
SELECT 
    'Auth Users' as check_type,
    COUNT(*) as count,
    STRING_AGG(email, ', ') as emails
FROM auth.users;

-- 2. Check tutors table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tutors'
AND column_name IN ('id', 'email', 'auth_user_id')
ORDER BY ordinal_position;

-- 3. Check tutors with/without auth_user_id
SELECT 
    'Tutors with auth_user_id' as status,
    COUNT(*) as count
FROM tutors
WHERE auth_user_id IS NOT NULL
UNION ALL
SELECT 
    'Tutors without auth_user_id' as status,
    COUNT(*) as count
FROM tutors
WHERE auth_user_id IS NULL;

-- 4. Check specific demo user
SELECT 
    t.id as tutor_id,
    t.email as tutor_email,
    t.auth_user_id,
    au.id as auth_id,
    au.email as auth_email,
    CASE WHEN t.auth_user_id = au.id THEN 'MATCHED' ELSE 'MISMATCH' END as status
FROM tutors t
LEFT JOIN auth.users au ON au.email = t.email
WHERE t.email = 'sarah_chen@hotmail.com';

-- 5. Check RLS policies on tutor_bonuses
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'tutor_bonuses';

-- 6. Check if RLS is enabled on tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE tablename IN ('tutors', 'tutor_bonuses', 'gamification_points', 'tutor_badges', 'tutor_tiers')
AND schemaname = 'public';

-- 7. Check bonus data for demo user
SELECT 
    tb.id,
    tb.tutor_id,
    t.email,
    tb.bonus_type,
    tb.amount,
    tb.status,
    tb.created_at
FROM tutor_bonuses tb
JOIN tutors t ON t.id = tb.tutor_id
WHERE t.email = 'sarah_chen@hotmail.com'
ORDER BY tb.created_at DESC
LIMIT 5;

-- 8. Test RLS policy with specific auth user
-- Replace the UUID below with the actual auth user ID from step 4
-- SELECT * FROM tutor_bonuses WHERE tutor_id IN (
--     SELECT id FROM tutors WHERE auth_user_id = 'YOUR-AUTH-USER-ID-HERE'
-- );

-- 9. Check for any orphaned bonus records
SELECT 
    'Orphaned bonuses (no matching tutor)' as issue,
    COUNT(*) as count
FROM tutor_bonuses tb
LEFT JOIN tutors t ON t.id = tb.tutor_id
WHERE t.id IS NULL;

-- 10. Summary of potential issues
WITH auth_check AS (
    SELECT 
        COUNT(*) as tutors_without_auth
    FROM tutors
    WHERE auth_user_id IS NULL
),
bonus_check AS (
    SELECT 
        COUNT(*) as total_bonuses
    FROM tutor_bonuses
)
SELECT 
    CASE 
        WHEN ac.tutors_without_auth > 0 THEN 'WARNING: ' || ac.tutors_without_auth || ' tutors without auth_user_id'
        ELSE 'OK: All tutors have auth_user_id'
    END as auth_status,
    CASE 
        WHEN bc.total_bonuses = 0 THEN 'INFO: No bonus records found'
        ELSE 'INFO: ' || bc.total_bonuses || ' total bonus records'
    END as bonus_status
FROM auth_check ac, bonus_check bc; 