-- Populate missing gamification data for Sarah Chen
-- This will ensure she has points, badges, and tier data to display

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
    
    -- 1. Add some gamification points if none exist
    IF NOT EXISTS (SELECT 1 FROM gamification_points WHERE tutor_id = sarah_tutor_id) THEN
        INSERT INTO gamification_points (tutor_id, points, reason, reference_type, created_at)
        VALUES 
            -- Historical points
            (sarah_tutor_id, 100, 'student_milestone_10_sessions', 'achievement', NOW() - INTERVAL '60 days'),
            (sarah_tutor_id, 75, 'session_completed', 'session', NOW() - INTERVAL '45 days'),
            (sarah_tutor_id, 50, 'positive_feedback', 'review', NOW() - INTERVAL '30 days'),
            (sarah_tutor_id, 100, 'student_retention_3_months', 'retention', NOW() - INTERVAL '20 days'),
            (sarah_tutor_id, 75, 'session_completed', 'session', NOW() - INTERVAL '10 days'),
            (sarah_tutor_id, 50, 'student_referral', 'referral', NOW() - INTERVAL '5 days'),
            (sarah_tutor_id, 25, 'first_session_new_student', 'session', NOW() - INTERVAL '2 days'),
            (sarah_tutor_id, 75, 'session_completed', 'session', NOW() - INTERVAL '1 day');
            
        RAISE NOTICE 'Added gamification points for Sarah';
    ELSE
        RAISE NOTICE 'Sarah already has gamification points';
    END IF;
    
    -- 2. Add some badges if none exist
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
    ELSE
        RAISE NOTICE 'Sarah already has badges';
    END IF;
    
    -- 3. Update tier data if needed
    UPDATE tutor_tiers
    SET 
        total_sessions = 342,
        average_rating = 4.8,
        retention_rate = 85.5,
        current_tier = 'gold'
    WHERE tutor_id = sarah_tutor_id;
    
    RAISE NOTICE 'Updated tier data for Sarah';
    
    -- 4. Add some achievement data if the table exists
    IF EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_name = 'tutor_achievements'
    ) THEN
        -- Check if Sarah has any achievements
        IF NOT EXISTS (SELECT 1 FROM tutor_achievements WHERE tutor_id = sarah_tutor_id) THEN
            -- Get some achievement IDs (assuming they exist)
            INSERT INTO tutor_achievements (tutor_id, achievement_id, earned_at)
            SELECT 
                sarah_tutor_id,
                id,
                NOW() - (INTERVAL '1 day' * (ROW_NUMBER() OVER (ORDER BY created_at) * 10))
            FROM achievements
            WHERE type IN ('first_session', 'five_sessions', 'ten_sessions', 'perfect_attendance')
            LIMIT 4
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Added achievements for Sarah';
        END IF;
    END IF;
    
END $$;

-- Verify the data
SELECT 
    'Points Summary' as data_type,
    COUNT(*) as count,
    SUM(points) as total
FROM gamification_points
WHERE tutor_id = (SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com');

SELECT 
    'Badges Summary' as data_type,
    COUNT(*) as count,
    STRING_AGG(badge_type, ', ') as badges
FROM tutor_badges
WHERE tutor_id = (SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com');

SELECT 
    'Bonus Summary' as data_type,
    COUNT(*) as count,
    SUM(amount) as total_amount,
    STRING_AGG(status, ', ') as statuses
FROM tutor_bonuses
WHERE tutor_id = (SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com'); 