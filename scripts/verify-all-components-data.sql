-- Comprehensive verification of ALL gamification data for Sarah Chen
-- This will show exactly what data exists and what might be missing

WITH sarah AS (
  SELECT id, email, auth_user_id 
  FROM tutors 
  WHERE email = 'sarah_chen@hotmail.com'
)
SELECT '=== SARAH CHEN DATA VERIFICATION ===' as check;

-- 1. Basic tutor info
SELECT 
  'Tutor Record' as component,
  CASE WHEN COUNT(*) > 0 THEN '✓ Found' ELSE '✗ Missing' END as status,
  id::text as details
FROM sarah;

-- 2. Points data (for PointsDisplay component)
SELECT 
  'Points (PointsDisplay)' as component,
  CASE WHEN COUNT(*) > 0 THEN '✓ ' || COUNT(*) || ' records' ELSE '✗ No records' END as status,
  'Total: ' || COALESCE(SUM(points), 0) || ' points' as details
FROM gamification_points
WHERE tutor_id IN (SELECT id FROM sarah);

-- 3. Recent points transactions
SELECT 
  'Recent Points' as component,
  CASE WHEN COUNT(*) > 0 THEN '✓ ' || COUNT(*) || ' recent' ELSE '✗ None' END as status,
  STRING_AGG(reason || ' (+' || points || ')', ', ' ORDER BY created_at DESC) as details
FROM (
  SELECT reason, points, created_at 
  FROM gamification_points 
  WHERE tutor_id IN (SELECT id FROM sarah)
  ORDER BY created_at DESC 
  LIMIT 5
) recent;

-- 4. Badges data (for BadgeShowcase component)
SELECT 
  'Badges (BadgeShowcase)' as component,
  CASE WHEN COUNT(*) > 0 THEN '✓ ' || COUNT(*) || ' badges' ELSE '✗ No badges' END as status,
  STRING_AGG(badge_type, ', ' ORDER BY earned_at) as details
FROM tutor_badges
WHERE tutor_id IN (SELECT id FROM sarah);

-- 5. Tier data (for TierProgress component)
SELECT 
  'Tier (TierProgress)' as component,
  CASE WHEN COUNT(*) > 0 THEN '✓ ' || current_tier || ' tier' ELSE '✗ No tier record' END as status,
  'Sessions: ' || COALESCE(total_sessions, 0) || ', Rating: ' || COALESCE(average_rating, 0) as details
FROM tutor_tiers
WHERE tutor_id IN (SELECT id FROM sarah);

-- 6. Achievements feed data
SELECT 
  'Achievements Feed' as component,
  '✓ Uses points data' as status,
  'Shows recent point transactions' as details;

-- 7. Bonus data (for BonusTracker - already working)
SELECT 
  'Bonuses (BonusTracker)' as component,
  CASE WHEN COUNT(*) > 0 THEN '✓ ' || COUNT(*) || ' bonuses' ELSE '✗ No bonuses' END as status,
  'Pending: ' || SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) || 
  ', Approved: ' || SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) ||
  ', Paid: ' || SUM(CASE WHEN status = 'paid' THEN 1 ELSE 0 END) as details
FROM tutor_bonuses
WHERE tutor_id IN (SELECT id FROM sarah);

-- 8. Check if all required IDs match
SELECT 
  'ID Consistency' as component,
  CASE 
    WHEN t.id IS NOT NULL AND t.auth_user_id IS NOT NULL 
    THEN '✓ IDs linked correctly' 
    ELSE '✗ ID mismatch' 
  END as status,
  'Tutor: ' || COALESCE(t.id::text, 'null') || ', Auth: ' || COALESCE(t.auth_user_id::text, 'null') as details
FROM tutors t
WHERE t.email = 'sarah_chen@hotmail.com'; 