-- Ensure demo user (sarah_chen@hotmail.com) has a proper tutor record
-- This fixes the 403 error when fetching bonuses

-- First, get the auth user ID for sarah_chen@hotmail.com
DO $$
DECLARE
    demo_auth_id UUID;
    demo_tutor_id UUID;
BEGIN
    -- Get the auth user ID
    SELECT id INTO demo_auth_id 
    FROM auth.users 
    WHERE email = 'sarah_chen@hotmail.com'
    LIMIT 1;
    
    IF demo_auth_id IS NOT NULL THEN
        -- Check if tutor record already exists
        SELECT id INTO demo_tutor_id
        FROM tutors
        WHERE auth_user_id = demo_auth_id;
        
        IF demo_tutor_id IS NULL THEN
            -- Create tutor record if it doesn't exist
            INSERT INTO tutors (
                auth_user_id,
                email,
                first_name,
                last_name,
                title,
                specialties,
                rating,
                total_sessions,
                total_earnings,
                status,
                location,
                level,
                total_xp,
                streak,
                rank,
                subjects,
                hourly_rate,
                availability,
                is_verified,
                badges
            ) VALUES (
                demo_auth_id,
                'sarah_chen@hotmail.com',
                'Sarah',
                'Chen',
                'Expert Math & Science Tutor',
                ARRAY['Math', 'Science', 'Physics'],
                4.8,
                342,
                17100,
                'available',
                'San Francisco, CA',
                8,
                3420,
                15,
                'Gold',
                ARRAY['Math', 'Science', 'Physics', 'Chemistry'],
                50,
                '{"monday": ["9:00-12:00", "14:00-18:00"], "tuesday": ["9:00-12:00", "14:00-18:00"], "wednesday": ["9:00-12:00", "14:00-18:00"], "thursday": ["9:00-12:00", "14:00-18:00"], "friday": ["9:00-12:00", "14:00-17:00"]}'::jsonb,
                true,
                ARRAY['top_rated', 'veteran', 'stem_expert']
            );
            
            RAISE NOTICE 'Created tutor record for demo user sarah_chen@hotmail.com';
        ELSE
            -- Update existing record to ensure auth_user_id is set
            UPDATE tutors 
            SET auth_user_id = demo_auth_id
            WHERE id = demo_tutor_id
            AND auth_user_id IS NULL;
            
            RAISE NOTICE 'Tutor record already exists for demo user';
        END IF;
        
        -- Also ensure the demo user has some initial gamification data
        -- Create initial tier record if it doesn't exist
        INSERT INTO tutor_tiers (
            tutor_id, 
            current_tier, 
            total_sessions, 
            average_rating, 
            retention_rate
        )
        SELECT 
            demo_tutor_id,
            'standard',
            0,
            0,
            0
        WHERE NOT EXISTS (
            SELECT 1 FROM tutor_tiers WHERE tutor_id = demo_tutor_id
        );
        
    ELSE
        RAISE NOTICE 'Demo user sarah_chen@hotmail.com not found in auth.users';
    END IF;
END $$; 