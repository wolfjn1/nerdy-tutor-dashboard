-- Debug script for 403 errors on achievements page
-- 
-- INSTRUCTIONS:
-- 1. Replace 'YOUR_EMAIL_HERE' with the email of the logged-in user
-- 2. Run each query separately to debug the issue

-- Set the email to debug (CHANGE THIS!)
-- Example: 'sarah_chen@hotmail.com'
WITH debug_user AS (
    SELECT 'YOUR_EMAIL_HERE' as email
)

-- Query 1: Check if the user exists in auth.users
SELECT 
    'Auth User Check' as check_type,
    au.id as auth_user_id,
    au.email,
    au.created_at,
    au.last_sign_in_at
FROM auth.users au
JOIN debug_user du ON au.email = du.email;

-- Query 2: Check tutor record and linkage
WITH debug_user AS (
    SELECT 'YOUR_EMAIL_HERE' as email
)
SELECT 
    'Tutor Record Check' as check_type,
    t.id as tutor_id,
    t.email,
    t.auth_user_id,
    t.first_name || ' ' || t.last_name as full_name,
    au.id as expected_auth_id,
    CASE 
        WHEN t.id IS NULL THEN '❌ No tutor record found'
        WHEN t.auth_user_id IS NULL THEN '❌ Tutor exists but no auth_user_id'
        WHEN t.auth_user_id = au.id THEN '✅ Properly linked'
        ELSE '❌ Mismatched auth_user_id'
    END as status
FROM debug_user du
LEFT JOIN tutors t ON t.email = du.email
LEFT JOIN auth.users au ON au.email = du.email;

-- Query 3: Check bonus records
WITH debug_user AS (
    SELECT 'YOUR_EMAIL_HERE' as email
)
SELECT 
    'Bonus Summary' as check_type,
    COUNT(*) as total_bonuses,
    SUM(CASE WHEN tb.status = 'pending' THEN 1 ELSE 0 END) as pending,
    SUM(CASE WHEN tb.status = 'approved' THEN 1 ELSE 0 END) as approved,
    SUM(CASE WHEN tb.status = 'paid' THEN 1 ELSE 0 END) as paid,
    SUM(amount) as total_amount
FROM debug_user du
JOIN tutors t ON t.email = du.email
LEFT JOIN tutor_bonuses tb ON tb.tutor_id = t.id;

-- Query 4: Test what the API would see
WITH debug_user AS (
    SELECT 'YOUR_EMAIL_HERE' as email
),
auth_check AS (
    SELECT au.id as auth_id
    FROM debug_user du
    JOIN auth.users au ON au.email = du.email
)
SELECT 
    'API Simulation' as check_type,
    t.id as tutor_id,
    t.email,
    t.auth_user_id,
    ac.auth_id as current_auth_id,
    CASE 
        WHEN t.auth_user_id = ac.auth_id THEN '✅ API should find tutor'
        ELSE '❌ API cannot find tutor'
    END as api_result
FROM auth_check ac
LEFT JOIN tutors t ON t.auth_user_id = ac.auth_id;

-- Query 5: Final diagnosis and fix
WITH debug_user AS (
    SELECT 'YOUR_EMAIL_HERE' as email
),
diagnosis AS (
    SELECT 
        du.email,
        au.id as auth_id,
        t.id as tutor_id,
        t.auth_user_id as current_auth_user_id
    FROM debug_user du
    LEFT JOIN auth.users au ON au.email = du.email
    LEFT JOIN tutors t ON t.email = du.email
)
SELECT 
    'DIAGNOSIS' as result,
    CASE 
        WHEN auth_id IS NULL THEN '❌ No auth user with email: ' || email
        WHEN tutor_id IS NULL THEN '❌ No tutor record with email: ' || email
        WHEN current_auth_user_id IS NULL THEN '❌ Tutor not linked to auth user'
        WHEN current_auth_user_id != auth_id THEN '❌ Tutor linked to wrong auth user'
        ELSE '✅ Everything looks correct'
    END as issue,
    CASE 
        WHEN auth_id IS NULL THEN 'User needs to sign up or you are checking wrong database'
        WHEN tutor_id IS NULL THEN 'Create tutor record for this user'
        WHEN current_auth_user_id IS NULL THEN 
            'Run: UPDATE tutors SET auth_user_id = ''' || auth_id || ''' WHERE email = ''' || email || ''';'
        WHEN current_auth_user_id != auth_id THEN 
            'Run: UPDATE tutors SET auth_user_id = ''' || auth_id || ''' WHERE id = ''' || tutor_id || ''';'
        ELSE 'Check: 1) Using correct Supabase project, 2) Logged in with correct email, 3) Clear cache and cookies'
    END as fix_command
FROM diagnosis; 