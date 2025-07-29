-- Verify Sarah Chen's gamification data is accessible
-- This will check all tables and ensure data exists

-- Get Sarah's IDs
WITH sarah_ids AS (
    SELECT 
        t.id as tutor_id,
        t.auth_user_id,
        t.email
    FROM tutors t
    WHERE t.email = 'sarah_chen@hotmail.com'
)

-- Check all gamification tables
SELECT 'Auth & Tutor Link' as check_type,
    CASE 
        WHEN auth_user_id IS NOT NULL THEN 'PASS ✓'
        ELSE 'FAIL ✗'
    END as status,
    'Tutor ID: ' || tutor_id || ', Auth ID: ' || auth_user_id as details
FROM sarah_ids

UNION ALL

-- Check points
SELECT 'Gamification Points' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS ✓ (' || COUNT(*) || ' records)'
        ELSE 'FAIL ✗ (No records)'
    END as status,
    'Total Points: ' || COALESCE(SUM(points), 0) as details
FROM gamification_points gp
JOIN sarah_ids s ON gp.tutor_id = s.tutor_id

UNION ALL

-- Check badges
SELECT 'Badges' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS ✓ (' || COUNT(*) || ' badges)'
        ELSE 'FAIL ✗ (No badges)'
    END as status,
    STRING_AGG(badge_type, ', ') as details
FROM tutor_badges tb
JOIN sarah_ids s ON tb.tutor_id = s.tutor_id

UNION ALL

-- Check tier
SELECT 'Tier Status' as check_type,
    CASE 
        WHEN current_tier IS NOT NULL THEN 'PASS ✓ (' || current_tier || ' tier)'
        ELSE 'FAIL ✗ (No tier data)'
    END as status,
    'Sessions: ' || COALESCE(total_sessions, 0) || ', Rating: ' || COALESCE(average_rating, 0) as details
FROM tutor_tiers tt
JOIN sarah_ids s ON tt.tutor_id = s.tutor_id

UNION ALL

-- Check bonuses
SELECT 'Bonuses' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN 'PASS ✓ (' || COUNT(*) || ' bonuses)'
        ELSE 'FAIL ✗ (No bonuses)'
    END as status,
    'Total Amount: $' || COALESCE(SUM(amount), 0) as details
FROM tutor_bonuses tb
JOIN sarah_ids s ON tb.tutor_id = s.tutor_id;

-- Also check RLS policies are working
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual LIKE '%auth.uid()%' THEN 'Uses auth.uid() ✓'
        ELSE 'Check policy'
    END as auth_check
FROM pg_policies
WHERE tablename IN ('gamification_points', 'tutor_badges', 'tutor_tiers')
ORDER BY tablename; 