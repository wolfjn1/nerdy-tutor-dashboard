-- Test script for bonus system
-- Run this in Supabase SQL editor to create test bonus data

-- Create test bonuses for an existing tutor
DO $$
DECLARE
  test_tutor_id UUID;
BEGIN
  -- Get a tutor ID (you can replace with a specific tutor ID)
  SELECT id INTO test_tutor_id 
  FROM profiles 
  WHERE role = 'tutor' 
  LIMIT 1;

  IF test_tutor_id IS NULL THEN
    RAISE NOTICE 'No tutor found. Please create a tutor first.';
    RETURN;
  END IF;

  -- Clear existing test bonuses (optional)
  -- DELETE FROM tutor_bonuses WHERE tutor_id = test_tutor_id;

  -- Insert various types of bonuses
  INSERT INTO tutor_bonuses (tutor_id, bonus_type, amount, status, reference_id, reference_type, metadata, created_at)
  VALUES 
    -- Pending bonuses
    (test_tutor_id, 'student_retention', 30, 'pending', gen_random_uuid()::text, 'student', 
     '{"studentName": "Alice Johnson", "monthsRetained": 6, "bonusMonths": 3}'::jsonb, 
     NOW() - INTERVAL '2 days'),
    
    (test_tutor_id, 'session_milestone', 25, 'pending', gen_random_uuid()::text, 'session', 
     '{"milestone": 15, "totalSessions": 15}'::jsonb, 
     NOW() - INTERVAL '1 day'),
    
    -- Approved bonuses
    (test_tutor_id, 'five_star_review', 5, 'approved', gen_random_uuid()::text, 'review', 
     '{"rating": 5, "reviewerName": "Parent"}'::jsonb, 
     NOW() - INTERVAL '5 days'),
    
    (test_tutor_id, 'student_retention', 20, 'approved', gen_random_uuid()::text, 'student', 
     '{"studentName": "Bob Smith", "monthsRetained": 5, "bonusMonths": 2}'::jsonb, 
     NOW() - INTERVAL '10 days'),
    
    -- Paid bonuses
    (test_tutor_id, 'session_milestone', 75, 'paid', gen_random_uuid()::text, 'session', 
     '{"milestone": 10, "totalSessions": 10, "newMilestones": [5, 10]}'::jsonb, 
     NOW() - INTERVAL '20 days'),
    
    (test_tutor_id, 'student_referral', 50, 'paid', gen_random_uuid()::text, 'student', 
     '{"referredStudentName": "Charlie Davis", "sessionsCompleted": 7}'::jsonb, 
     NOW() - INTERVAL '25 days'),
    
    -- This month's paid bonus
    (test_tutor_id, 'five_star_review', 5, 'paid', gen_random_uuid()::text, 'review', 
     '{"rating": 5}'::jsonb, 
     NOW() - INTERVAL '3 days');

  -- Update approved_at and paid_at timestamps
  UPDATE tutor_bonuses 
  SET approved_at = created_at + INTERVAL '1 day' 
  WHERE tutor_id = test_tutor_id AND status IN ('approved', 'paid');

  UPDATE tutor_bonuses 
  SET paid_at = created_at + INTERVAL '2 days',
      payment_reference = 'PAYOUT-' || to_char(NOW(), 'YYYYMMDD')
  WHERE tutor_id = test_tutor_id AND status = 'paid';

  RAISE NOTICE 'Test bonuses created for tutor: %', test_tutor_id;
  RAISE NOTICE 'Pending bonuses: 2 ($55 total)';
  RAISE NOTICE 'Approved bonuses: 2 ($25 total)';
  RAISE NOTICE 'Paid bonuses: 3 ($130 total)';
END $$;

-- Query to verify bonuses were created
SELECT 
  bonus_type,
  amount,
  status,
  created_at,
  metadata
FROM tutor_bonuses
WHERE tutor_id IN (SELECT id FROM profiles WHERE role = 'tutor' LIMIT 1)
ORDER BY created_at DESC;

-- Summary by status
SELECT 
  status,
  COUNT(*) as count,
  SUM(amount) as total_amount
FROM tutor_bonuses
WHERE tutor_id IN (SELECT id FROM profiles WHERE role = 'tutor' LIMIT 1)
GROUP BY status;

-- This month's paid bonuses
SELECT 
  SUM(amount) as paid_this_month
FROM tutor_bonuses
WHERE tutor_id IN (SELECT id FROM profiles WHERE role = 'tutor' LIMIT 1)
  AND status = 'paid'
  AND paid_at >= date_trunc('month', CURRENT_DATE); 