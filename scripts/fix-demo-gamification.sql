-- Fix gamification data for demo user to use correct tutor ID
-- This ensures badges and points are properly linked

DO $$
DECLARE
    demo_auth_id UUID;
    demo_tutor_id UUID;
BEGIN
    -- Get the auth user ID for demo user
    SELECT id INTO demo_auth_id 
    FROM auth.users 
    WHERE email = 'sarah_chen@hotmail.com'
    LIMIT 1;
    
    IF demo_auth_id IS NOT NULL THEN
        -- Get the tutor ID (from tutors table)
        SELECT id INTO demo_tutor_id
        FROM tutors
        WHERE auth_user_id = demo_auth_id
        LIMIT 1;
        
        IF demo_tutor_id IS NOT NULL THEN
            -- Create some initial gamification points
            INSERT INTO gamification_points (tutor_id, points, reason, reference_type, created_at)
            VALUES 
                (demo_tutor_id, 100, 'onboarding_complete', 'onboarding', NOW() - INTERVAL '7 days'),
                (demo_tutor_id, 50, 'session_completion', 'session', NOW() - INTERVAL '5 days'),
                (demo_tutor_id, 75, 'positive_review', 'review', NOW() - INTERVAL '3 days'),
                (demo_tutor_id, 50, 'session_completion', 'session', NOW() - INTERVAL '2 days'),
                (demo_tutor_id, 25, 'student_message', 'communication', NOW() - INTERVAL '1 day')
            ON CONFLICT DO NOTHING;
            
            -- Create some badges for the demo user
            INSERT INTO tutor_badges (tutor_id, badge_type, earned_at, metadata)
            VALUES 
                (demo_tutor_id, 'onboarding_complete', NOW() - INTERVAL '7 days', '{"description": "Welcome to the platform!"}'),
                (demo_tutor_id, 'quick_starter', NOW() - INTERVAL '5 days', '{"sessions": 10}'),
                (demo_tutor_id, 'five_star_tutor', NOW() - INTERVAL '3 days', '{"rating": 4.8}')
            ON CONFLICT (tutor_id, badge_type) DO NOTHING;
            
            -- Ensure tier record exists with correct tutor_id
            INSERT INTO tutor_tiers (
                tutor_id, 
                current_tier, 
                total_sessions, 
                average_rating, 
                retention_rate,
                tier_started_at,
                last_evaluated_at
            )
            VALUES (
                demo_tutor_id,
                'silver', -- Give demo user silver tier
                125,      -- Enough sessions for silver
                4.8,      -- Good rating
                75.0,     -- Good retention
                NOW() - INTERVAL '30 days',
                NOW()
            )
            ON CONFLICT (tutor_id) 
            DO UPDATE SET 
                current_tier = EXCLUDED.current_tier,
                total_sessions = EXCLUDED.total_sessions,
                average_rating = EXCLUDED.average_rating,
                retention_rate = EXCLUDED.retention_rate;
            
            -- Add some demo bonuses
            INSERT INTO tutor_bonuses (
                tutor_id, 
                bonus_type, 
                amount, 
                status,
                reference_type,
                created_at
            )
            VALUES 
                (demo_tutor_id, 'session_milestone', 25.00, 'paid', 'session', NOW() - INTERVAL '14 days'),
                (demo_tutor_id, 'five_star_review', 5.00, 'paid', 'review', NOW() - INTERVAL '10 days'),
                (demo_tutor_id, 'student_retention', 10.00, 'approved', 'student', NOW() - INTERVAL '5 days'),
                (demo_tutor_id, 'session_milestone', 25.00, 'pending', 'session', NOW() - INTERVAL '1 day')
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Successfully set up gamification data for demo tutor ID: %', demo_tutor_id;
        ELSE
            RAISE NOTICE 'No tutor record found for demo user';
        END IF;
    ELSE
        RAISE NOTICE 'Demo user not found in auth.users';
    END IF;
END $$; 