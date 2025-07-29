-- Ensure sarah_chen@hotmail.com is completely set up
-- Run this in your production Supabase instance

-- Step 1: Check if Sarah exists in auth.users
DO $$
DECLARE
    sarah_auth_id UUID;
    sarah_tutor_id UUID;
BEGIN
    -- Get Sarah's auth ID
    SELECT id INTO sarah_auth_id 
    FROM auth.users 
    WHERE email = 'sarah_chen@hotmail.com';
    
    IF sarah_auth_id IS NULL THEN
        RAISE NOTICE 'ERROR: sarah_chen@hotmail.com does not exist in auth.users';
        RAISE NOTICE 'You need to create an account for her first through the app signup';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Found Sarah in auth.users with ID: %', sarah_auth_id;
    
    -- Check for tutor record
    SELECT id INTO sarah_tutor_id
    FROM tutors
    WHERE email = 'sarah_chen@hotmail.com';
    
    IF sarah_tutor_id IS NULL THEN
        -- Create tutor record
        INSERT INTO tutors (
            auth_user_id,
            email,
            first_name,
            last_name,
            subjects,
            hourly_rate,
            availability,
            is_verified,
            badges,
            rating,
            total_earnings
        ) VALUES (
            sarah_auth_id,
            'sarah_chen@hotmail.com',
            'Sarah',
            'Chen',
            ARRAY['Math', 'Science', 'Physics'],
            50,
            '{"monday": ["9:00-12:00", "14:00-18:00"], "tuesday": ["9:00-12:00", "14:00-18:00"]}'::jsonb,
            true,
            ARRAY['top_rated', 'veteran', 'stem_expert'],
            4.8,
            17100
        ) RETURNING id INTO sarah_tutor_id;
        
        RAISE NOTICE 'Created tutor record for Sarah with ID: %', sarah_tutor_id;
    ELSE
        -- Update to ensure auth_user_id is set
        UPDATE tutors 
        SET auth_user_id = sarah_auth_id
        WHERE id = sarah_tutor_id
        AND (auth_user_id IS NULL OR auth_user_id != sarah_auth_id);
        
        RAISE NOTICE 'Found existing tutor record with ID: %', sarah_tutor_id;
    END IF;
    
    -- Ensure tier record exists
    INSERT INTO tutor_tiers (
        tutor_id, 
        current_tier, 
        total_sessions, 
        average_rating, 
        retention_rate
    )
    SELECT 
        sarah_tutor_id,
        'gold',
        342,
        4.8,
        85.5
    WHERE NOT EXISTS (
        SELECT 1 FROM tutor_tiers WHERE tutor_id = sarah_tutor_id
    );
    
    -- Add demo bonuses if none exist
    IF NOT EXISTS (SELECT 1 FROM tutor_bonuses WHERE tutor_id = sarah_tutor_id) THEN
        -- First check if metadata column exists
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'tutor_bonuses' 
            AND column_name = 'metadata'
        ) THEN
            -- Insert with metadata
            INSERT INTO tutor_bonuses (tutor_id, bonus_type, amount, status, metadata, created_at)
            VALUES 
                (sarah_tutor_id, 'session_milestone', 75, 'paid', 
                 '{"milestone": 300, "totalSessions": 300}'::jsonb, 
                 NOW() - INTERVAL '30 days'),
                
                (sarah_tutor_id, 'student_retention', 40, 'approved', 
                 '{"studentName": "Emma Wilson", "monthsRetained": 7, "bonusMonths": 4}'::jsonb, 
                 NOW() - INTERVAL '7 days'),
                
                (sarah_tutor_id, 'five_star_review', 5, 'approved', 
                 '{"rating": 5, "reviewerName": "Parent"}'::jsonb, 
                 NOW() - INTERVAL '3 days'),
                
                (sarah_tutor_id, 'session_milestone', 25, 'pending', 
                 '{"milestone": 350, "totalSessions": 342}'::jsonb, 
                 NOW() - INTERVAL '1 day');
        ELSE
            -- Insert without metadata
            INSERT INTO tutor_bonuses (tutor_id, bonus_type, amount, status, created_at)
            VALUES 
                (sarah_tutor_id, 'session_milestone', 75, 'paid', NOW() - INTERVAL '30 days'),
                (sarah_tutor_id, 'student_retention', 40, 'approved', NOW() - INTERVAL '7 days'),
                (sarah_tutor_id, 'five_star_review', 5, 'approved', NOW() - INTERVAL '3 days'),
                (sarah_tutor_id, 'session_milestone', 25, 'pending', NOW() - INTERVAL '1 day');
        END IF;
        
        RAISE NOTICE 'Created demo bonuses for Sarah';
    END IF;
    
    RAISE NOTICE 'Sarah Chen setup complete!';
END $$;

-- Verify the setup
SELECT 
    'VERIFICATION' as check_type,
    t.id as tutor_id,
    t.auth_user_id,
    au.id as auth_id,
    t.auth_user_id = au.id as properly_linked,
    tt.current_tier,
    COUNT(DISTINCT tb.id) as bonus_count
FROM tutors t
LEFT JOIN auth.users au ON au.email = t.email
LEFT JOIN tutor_tiers tt ON tt.tutor_id = t.id
LEFT JOIN tutor_bonuses tb ON tb.tutor_id = t.id
WHERE t.email = 'sarah_chen@hotmail.com'
GROUP BY t.id, t.auth_user_id, au.id, tt.current_tier; 