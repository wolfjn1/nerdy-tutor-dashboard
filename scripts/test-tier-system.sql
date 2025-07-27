-- Test script for verifying tier system functionality
-- Run this in Supabase SQL editor to test tier calculations

-- Create test tutor data for different tier levels
DO $$
DECLARE
  test_tutor_id UUID := gen_random_uuid();
BEGIN
  -- Insert test tutor profile
  INSERT INTO profiles (id, email, role, first_name, last_name)
  VALUES 
    (test_tutor_id, 'tier-test@tutor.com', 'tutor', 'Test', 'Tier');

  -- Insert completed sessions for testing
  -- This will create 55 completed sessions
  INSERT INTO tutoring_sessions (tutor_id, student_id, status, created_at)
  SELECT 
    test_tutor_id,
    gen_random_uuid(),
    'completed',
    NOW() - (i || ' days')::INTERVAL
  FROM generate_series(1, 55) AS i;

  -- Insert some reviews with average rating ~4.6
  INSERT INTO session_reviews (tutor_id, session_id, rating, created_at)
  SELECT 
    test_tutor_id,
    s.id,
    CASE 
      WHEN random() < 0.6 THEN 5  -- 60% chance of 5 stars
      ELSE 4                      -- 40% chance of 4 stars
    END,
    s.created_at
  FROM tutoring_sessions s
  WHERE s.tutor_id = test_tutor_id
  LIMIT 20;

  -- Create initial tier record
  INSERT INTO tutor_tiers (tutor_id, current_tier, tier_started_at)
  VALUES (test_tutor_id, 'standard', NOW());

  RAISE NOTICE 'Test tutor created with ID: %', test_tutor_id;
  RAISE NOTICE 'Created 55 sessions and 20 reviews';
  RAISE NOTICE 'This tutor should qualify for Silver tier';
END $$;

-- Query to check tier eligibility
WITH tutor_stats AS (
  SELECT 
    t.tutor_id,
    COUNT(DISTINCT s.id) AS completed_sessions,
    COALESCE(AVG(r.rating), 0) AS average_rating,
    -- Simplified retention calculation for testing
    CASE 
      WHEN COUNT(DISTINCT s.student_id) > 0 THEN 
        (COUNT(DISTINCT CASE 
          WHEN s.created_at < NOW() - INTERVAL '3 months' 
          THEN s.student_id 
        END)::FLOAT / COUNT(DISTINCT s.student_id) * 100)
      ELSE 0 
    END AS retention_rate
  FROM profiles t
  LEFT JOIN tutoring_sessions s ON s.tutor_id = t.id AND s.status = 'completed'
  LEFT JOIN session_reviews r ON r.tutor_id = t.id
  WHERE t.email = 'tier-test@tutor.com'
  GROUP BY t.id
)
SELECT 
  *,
  CASE
    WHEN completed_sessions >= 300 AND average_rating >= 4.8 AND retention_rate >= 90 THEN 'elite'
    WHEN completed_sessions >= 150 AND average_rating >= 4.7 AND retention_rate >= 85 THEN 'gold'
    WHEN completed_sessions >= 50 AND average_rating >= 4.5 AND retention_rate >= 80 THEN 'silver'
    ELSE 'standard'
  END AS eligible_tier
FROM tutor_stats;

-- Clean up test data (uncomment to run)
-- DELETE FROM profiles WHERE email = 'tier-test@tutor.com'; 