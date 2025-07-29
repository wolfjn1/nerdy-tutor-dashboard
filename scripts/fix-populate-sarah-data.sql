-- Fix and populate Sarah Chen's gamification data
-- Handles the updated_at column issue

DO $$
DECLARE
    sarah_tutor_id UUID;
BEGIN
    -- Get Sarah's tutor ID
    SELECT id INTO sarah_tutor_id
    FROM tutors
    WHERE email = 'sarah_chen@hotmail.com';
    
    IF sarah_tutor_id IS NULL THEN
        RAISE NOTICE 'Sarah Chen not found in tutors table';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found Sarah Chen with tutor ID: %', sarah_tutor_id;
    
    -- First, check if tutor_tiers has updated_at column
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tutor_tiers' 
        AND column_name = 'updated_at'
    ) THEN
        -- Add the updated_at column if it doesn't exist
        ALTER TABLE tutor_tiers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to tutor_tiers';
    END IF;
    
    -- 1. Add gamification points
    IF NOT EXISTS (SELECT 1 FROM gamification_points WHERE tutor_id = sarah_tutor_id) THEN
        INSERT INTO gamification_points (tutor_id, points, reason, reference_type, created_at)
        VALUES 
            (sarah_tutor_id, 100, 'student_milestone_10_sessions', 'achievement', NOW() - INTERVAL '60 days'),
            (sarah_tutor_id, 75, 'session_completed', 'session', NOW() - INTERVAL '45 days'),
            (sarah_tutor_id, 50, 'positive_feedback', 'review', NOW() - INTERVAL '30 days'),
            (sarah_tutor_id, 100, 'student_retention_3_months', 'retention', NOW() - INTERVAL '20 days'),
            (sarah_tutor_id, 75, 'session_completed', 'session', NOW() - INTERVAL '10 days'),
            (sarah_tutor_id, 50, 'student_referral', 'referral', NOW() - INTERVAL '5 days'),
            (sarah_tutor_id, 25, 'first_session_new_student', 'session', NOW() - INTERVAL '2 days'),
            (sarah_tutor_id, 75, 'session_completed', 'session', NOW() - INTERVAL '1 day');
            
        RAISE NOTICE 'Added gamification points for Sarah';
    END IF;
    
    -- 2. Add badges
    IF NOT EXISTS (SELECT 1 FROM tutor_badges WHERE tutor_id = sarah_tutor_id) THEN
        INSERT INTO tutor_badges (tutor_id, badge_type, earned_at, metadata)
        VALUES 
            (sarah_tutor_id, 'session_milestone_50', NOW() - INTERVAL '90 days', 
             '{"sessions_completed": 50}'::jsonb),
            (sarah_tutor_id, 'five_star_tutor', NOW() - INTERVAL '60 days', 
             '{"average_rating": 4.8, "review_count": 25}'::jsonb),
            (sarah_tutor_id, 'quick_starter', NOW() - INTERVAL '120 days', 
             '{"sessions_in_first_month": 12}'::jsonb),
            (sarah_tutor_id, 'retention_star', NOW() - INTERVAL '30 days', 
             '{"students_retained_3_months": 15}'::jsonb);
             
        RAISE NOTICE 'Added badges for Sarah';
    END IF;
    
    -- 3. Update tier data
    -- First check if record exists
    IF EXISTS (SELECT 1 FROM tutor_tiers WHERE tutor_id = sarah_tutor_id) THEN
        -- Use a direct update without triggering the updated_at trigger
        UPDATE tutor_tiers
        SET 
            total_sessions = 342,
            average_rating = 4.8,
            retention_rate = 85.5,
            current_tier = 'gold',
            last_evaluated_at = NOW()
        WHERE tutor_id = sarah_tutor_id;
    ELSE
        -- Create new record
        INSERT INTO tutor_tiers (
            tutor_id, 
            current_tier, 
            total_sessions, 
            average_rating, 
            retention_rate,
            tier_started_at,
            last_evaluated_at
        ) VALUES (
            sarah_tutor_id,
            'gold',
            342,
            4.8,
            85.5,
            NOW() - INTERVAL '90 days',
            NOW()
        );
    END IF;
    
    RAISE NOTICE 'Updated tier data for Sarah';
    
END $$;

-- Verify the data
SELECT 
    'Points' as data_type,
    COUNT(*) as count,
    SUM(points) as total
FROM gamification_points
WHERE tutor_id = (SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com')

UNION ALL

SELECT 
    'Badges' as data_type,
    COUNT(*) as count,
    NULL as total
FROM tutor_badges
WHERE tutor_id = (SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com')

UNION ALL

SELECT 
    'Tier' as data_type,
    CASE 
        WHEN current_tier IS NOT NULL THEN 1 
        ELSE 0 
    END as count,
    NULL as total
FROM tutor_tiers
WHERE tutor_id = (SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com'); 