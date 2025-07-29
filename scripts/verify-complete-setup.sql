-- Comprehensive verification for achievements page setup

-- 1. Summary of auth linkage
WITH auth_summary AS (
    SELECT 
        COUNT(*) FILTER (WHERE auth_user_id IS NOT NULL) as linked_tutors,
        COUNT(*) FILTER (WHERE auth_user_id IS NULL) as unlinked_tutors,
        COUNT(*) as total_tutors
    FROM tutors
)
SELECT 
    'Auth Linkage Summary' as check_type,
    linked_tutors || ' linked, ' || unlinked_tutors || ' unlinked, ' || total_tutors || ' total' as result,
    CASE 
        WHEN unlinked_tutors = 0 THEN '✅ PASS'
        ELSE '❌ FAIL - ' || unlinked_tutors || ' tutors need linking'
    END as status
FROM auth_summary;

-- 2. Check if metadata column exists
SELECT 
    'Metadata Column' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN 'Column exists'
        ELSE 'Column missing'
    END as result,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS'
        ELSE '❌ FAIL - Run ALTER TABLE tutor_bonuses ADD COLUMN metadata JSONB'
    END as status
FROM information_schema.columns 
WHERE table_name = 'tutor_bonuses' 
AND column_name = 'metadata';

-- 3. Check RLS policies
SELECT 
    'RLS Policy: ' || policyname as check_type,
    cmd || ' on ' || tablename as result,
    '✅ EXISTS' as status
FROM pg_policies
WHERE tablename IN ('tutors', 'tutor_bonuses', 'gamification_points', 'tutor_badges', 'tutor_tiers')
AND schemaname = 'public'
ORDER BY tablename, policyname;

-- 4. Check if RLS is enabled
SELECT 
    'RLS Enabled: ' || tablename as check_type,
    CASE rowsecurity 
        WHEN true THEN 'Enabled'
        ELSE 'Disabled'
    END as result,
    CASE rowsecurity 
        WHEN true THEN '✅ PASS'
        ELSE '❌ FAIL - Run ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY'
    END as status
FROM pg_tables
WHERE tablename IN ('tutors', 'tutor_bonuses', 'gamification_points', 'tutor_badges', 'tutor_tiers')
AND schemaname = 'public';

-- 5. Check demo user setup
WITH demo_check AS (
    SELECT 
        t.id as tutor_id,
        t.auth_user_id,
        COUNT(DISTINCT tb.id) as bonus_count,
        COUNT(DISTINCT tt.id) as tier_count
    FROM tutors t
    LEFT JOIN tutor_bonuses tb ON tb.tutor_id = t.id
    LEFT JOIN tutor_tiers tt ON tt.tutor_id = t.id
    WHERE t.email = 'sarah_chen@hotmail.com'
    GROUP BY t.id, t.auth_user_id
)
SELECT 
    'Demo User (sarah_chen)' as check_type,
    CASE 
        WHEN COUNT(*) = 0 THEN 'Not found'
        ELSE 'Has ' || MAX(bonus_count) || ' bonuses, ' || MAX(tier_count) || ' tier record'
    END as result,
    CASE 
        WHEN COUNT(*) = 0 THEN '❌ FAIL - Demo user not found'
        WHEN MAX(auth_user_id::text) IS NULL THEN '❌ FAIL - No auth_user_id'
        WHEN MAX(bonus_count) = 0 THEN '⚠️  WARNING - No demo bonuses'
        ELSE '✅ PASS'
    END as status
FROM demo_check;

-- 6. Overall readiness check
WITH readiness AS (
    SELECT 
        (SELECT COUNT(*) FROM tutors WHERE auth_user_id IS NULL) as unlinked_count,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'tutor_bonuses' AND column_name = 'metadata') as has_metadata,
        (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'tutor_bonuses') as has_policies,
        (SELECT rowsecurity FROM pg_tables WHERE tablename = 'tutor_bonuses' AND schemaname = 'public') as rls_enabled
)
SELECT 
    'Overall Readiness' as check_type,
    CASE 
        WHEN unlinked_count = 0 AND has_metadata > 0 AND has_policies > 0 AND rls_enabled = true 
        THEN 'All checks passed!'
        ELSE 'Some issues remain'
    END as result,
    CASE 
        WHEN unlinked_count = 0 AND has_metadata > 0 AND has_policies > 0 AND rls_enabled = true 
        THEN '✅ READY - Achievements page should work'
        ELSE '❌ NOT READY - Fix issues above'
    END as status
FROM readiness; 