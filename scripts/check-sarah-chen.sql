-- Quick check for sarah_chen@hotmail.com

-- 1. Check auth user
SELECT 
    'Sarah Chen Auth User' as check,
    id as auth_id,
    email,
    created_at,
    last_sign_in_at
FROM auth.users
WHERE email = 'sarah_chen@hotmail.com';

-- 2. Check tutor record and linkage
SELECT 
    'Sarah Chen Tutor' as check,
    t.id as tutor_id,
    t.email,
    t.auth_user_id,
    au.id as expected_auth_id,
    CASE 
        WHEN t.id IS NULL THEN '❌ No tutor record'
        WHEN t.auth_user_id IS NULL THEN '❌ Tutor not linked'
        WHEN t.auth_user_id = au.id THEN '✅ Properly linked'
        ELSE '❌ Mismatched auth_user_id'
    END as status
FROM auth.users au
LEFT JOIN tutors t ON t.email = au.email
WHERE au.email = 'sarah_chen@hotmail.com';

-- 3. Check bonuses
SELECT 
    'Sarah Chen Bonuses' as check,
    COUNT(*) as total_bonuses,
    COUNT(*) FILTER (WHERE tb.metadata IS NOT NULL) as bonuses_with_metadata
FROM tutors t
LEFT JOIN tutor_bonuses tb ON tb.tutor_id = t.id
WHERE t.email = 'sarah_chen@hotmail.com';

-- 4. Test what the API would see
SELECT 
    'API Access Test' as check,
    t.id as tutor_id,
    COUNT(tb.id) as accessible_bonuses
FROM tutors t
LEFT JOIN tutor_bonuses tb ON tb.tutor_id = t.id
WHERE t.auth_user_id = (SELECT id FROM auth.users WHERE email = 'sarah_chen@hotmail.com')
GROUP BY t.id;

-- 5. Quick fix if needed
WITH sarah AS (
    SELECT 
        au.id as auth_id,
        t.id as tutor_id,
        t.auth_user_id
    FROM auth.users au
    LEFT JOIN tutors t ON t.email = au.email
    WHERE au.email = 'sarah_chen@hotmail.com'
)
SELECT 
    'FIX COMMAND' as action,
    CASE 
        WHEN auth_id IS NULL THEN 
            'ERROR: sarah_chen@hotmail.com not in auth.users - she needs to sign up first'
        WHEN tutor_id IS NULL THEN 
            'ERROR: No tutor record for sarah_chen@hotmail.com - run fix-metadata-column.sql'
        WHEN auth_user_id IS NULL OR auth_user_id != auth_id THEN 
            'UPDATE tutors SET auth_user_id = ''' || auth_id || ''' WHERE email = ''sarah_chen@hotmail.com'';'
        ELSE 
            'Everything looks correct for Sarah Chen'
    END as fix_sql
FROM sarah; 