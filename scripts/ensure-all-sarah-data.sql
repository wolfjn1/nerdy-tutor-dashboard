-- Comprehensive script to ensure Sarah Chen has ALL required gamification data
-- Run this script to populate all missing data

DO $$
DECLARE
    sarah_tutor_id UUID;
    sarah_auth_id UUID;
BEGIN
    -- Get Sarah's IDs
    SELECT t.id, t.auth_user_id 
    INTO sarah_tutor_id, sarah_auth_id
    FROM tutors t
    WHERE t.email = 'sarah_chen@hotmail.com';
    
    IF sarah_tutor_id IS NULL THEN
        RAISE EXCEPTION 'Sarah Chen tutor record not found!';
    END IF;
    
    RAISE NOTICE 'Found Sarah Chen - Tutor ID: %, Auth ID: %', sarah_tutor_id, sarah_auth_id;

    -- 1. Ensure gamification_points exist
    IF NOT EXISTS (SELECT 1 FROM gamification_points WHERE tutor_id = sarah_tutor_id) THEN
        INSERT INTO gamification_points (tutor_id, points, reason, created_at) VALUES
            (sarah_tutor_id, 500, 'profile_complete', NOW() - INTERVAL '90 days'),
            (sarah_tutor_id, 250, 'first_session', NOW() - INTERVAL '89 days'),
            (sarah_tutor_id, 100, 'student_retention', NOW() - INTERVAL '80 days'),
            (sarah_tutor_id, 50, 'five_star_review', NOW() - INTERVAL '75 days'),
            (sarah_tutor_id, 200, 'session_milestone', NOW() - INTERVAL '60 days'),
            (sarah_tutor_id, 100, 'student_retention', NOW() - INTERVAL '45 days'),
            (sarah_tutor_id, 50, 'five_star_review', NOW() - INTERVAL '30 days'),
            (sarah_tutor_id, 300, 'tier_upgrade', NOW() - INTERVAL '25 days'),
            (sarah_tutor_id, 100, 'student_retention', NOW() - INTERVAL '15 days'),
            (sarah_tutor_id, 50, 'five_star_review', NOW() - INTERVAL '7 days');
        RAISE NOTICE 'Added gamification points for Sarah Chen';
    ELSE
        RAISE NOTICE 'Gamification points already exist for Sarah Chen';
    END IF;

    -- 2. Ensure tutor_badges exist
    IF NOT EXISTS (SELECT 1 FROM tutor_badges WHERE tutor_id = sarah_tutor_id) THEN
        INSERT INTO tutor_badges (tutor_id, badge_type, earned_at) VALUES
            (sarah_tutor_id, 'first_session', NOW() - INTERVAL '89 days'),
            (sarah_tutor_id, 'session_master', NOW() - INTERVAL '60 days'),
            (sarah_tutor_id, 'retention_expert', NOW() - INTERVAL '45 days'),
            (sarah_tutor_id, 'five_star_hero', NOW() - INTERVAL '30 days'),
            (sarah_tutor_id, 'elite_tutor', NOW() - INTERVAL '25 days');
        RAISE NOTICE 'Added badges for Sarah Chen';
    ELSE
        RAISE NOTICE 'Badges already exist for Sarah Chen';
    END IF;

    -- 3. Ensure tutor_tiers record exists with proper data
    -- First check if updated_at column exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'tutor_tiers' 
        AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE tutor_tiers ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW();
        RAISE NOTICE 'Added updated_at column to tutor_tiers';
    END IF;

    -- Delete any existing tier record to start fresh
    DELETE FROM tutor_tiers WHERE tutor_id = sarah_tutor_id;
    
    -- Insert fresh tier record
    INSERT INTO tutor_tiers (
        tutor_id, 
        current_tier, 
        total_sessions, 
        average_rating, 
        retention_rate,
        tier_started_at,
        last_evaluated_at,
        updated_at
    ) VALUES (
        sarah_tutor_id,
        'gold',
        342,
        4.8,
        85.5,
        NOW() - INTERVAL '25 days',
        NOW() - INTERVAL '1 day',
        NOW()
    );
    RAISE NOTICE 'Added/Updated tier record for Sarah Chen';

    -- 4. Verify the data
    RAISE NOTICE '=== VERIFICATION ===';
    RAISE NOTICE 'Points: % total', (SELECT SUM(points) FROM gamification_points WHERE tutor_id = sarah_tutor_id);
    RAISE NOTICE 'Badges: % earned', (SELECT COUNT(*) FROM tutor_badges WHERE tutor_id = sarah_tutor_id);
    RAISE NOTICE 'Current Tier: %', (SELECT current_tier FROM tutor_tiers WHERE tutor_id = sarah_tutor_id);
    RAISE NOTICE 'Bonuses: % total', (SELECT COUNT(*) FROM tutor_bonuses WHERE tutor_id = sarah_tutor_id);
    
END $$; 