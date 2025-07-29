-- Simple verification script for achievements page setup

-- 1. Check auth linkage
SELECT 
    'Tutors without auth_user_id' as check,
    COUNT(*) as count
FROM tutors
WHERE auth_user_id IS NULL;

-- 2. Check metadata column
SELECT 
    'Metadata column exists' as check,
    CASE WHEN COUNT(*) > 0 THEN 'YES' ELSE 'NO' END as result
FROM information_schema.columns 
WHERE table_name = 'tutor_bonuses' 
AND column_name = 'metadata';

-- 3. Check RLS enabled
SELECT 
    tablename,
    CASE rowsecurity WHEN true THEN 'RLS Enabled' ELSE 'RLS Disabled' END as status
FROM pg_tables
WHERE tablename IN ('tutors', 'tutor_bonuses')
AND schemaname = 'public';

-- 4. Check demo user
SELECT 
    'Demo user (sarah_chen@hotmail.com)' as user,
    CASE WHEN COUNT(*) > 0 THEN 'Exists' ELSE 'Not found' END as status,
    COUNT(*) as tutor_records
FROM tutors
WHERE email = 'sarah_chen@hotmail.com';

-- 5. Check demo user bonuses
SELECT 
    'Demo user bonuses' as check,
    COUNT(*) as count
FROM tutor_bonuses tb
JOIN tutors t ON t.id = tb.tutor_id
WHERE t.email = 'sarah_chen@hotmail.com';

-- 6. Summary
SELECT 
    '=== SUMMARY ===' as result
UNION ALL
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM tutors WHERE auth_user_id IS NULL) = 0 
        THEN '✅ All tutors have auth_user_id'
        ELSE '❌ Some tutors missing auth_user_id: ' || (SELECT COUNT(*) FROM tutors WHERE auth_user_id IS NULL)
    END as result
UNION ALL
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tutor_bonuses' AND column_name = 'metadata') > 0
        THEN '✅ Metadata column exists'
        ELSE '❌ Metadata column missing'
    END as result
UNION ALL
SELECT 
    CASE 
        WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'tutor_bonuses' AND schemaname = 'public') = true
        THEN '✅ RLS enabled on tutor_bonuses'
        ELSE '❌ RLS not enabled on tutor_bonuses'
    END as result; 