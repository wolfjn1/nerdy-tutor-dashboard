-- Fix for 403 errors on achievements page
-- This script ensures proper database schema and RLS policies for the tutors and bonus tables

-- Step 1: Ensure auth_user_id column exists in tutors table
ALTER TABLE tutors ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Step 2: Create index on auth_user_id for performance
CREATE INDEX IF NOT EXISTS idx_tutors_auth_user_id ON tutors(auth_user_id);

-- Step 3: Add metadata column to tutor_bonuses if it doesn't exist (do this early!)
ALTER TABLE tutor_bonuses ADD COLUMN IF NOT EXISTS metadata JSONB;

-- Step 4: Link existing tutors to auth users based on email
UPDATE tutors t
SET auth_user_id = au.id
FROM auth.users au
WHERE t.email = au.email
AND t.auth_user_id IS NULL;

-- Step 5: Drop and recreate RLS policies for tutor_bonuses with proper auth handling
DROP POLICY IF EXISTS "Tutors can view own bonuses" ON tutor_bonuses;

CREATE POLICY "Tutors can view own bonuses" 
    ON tutor_bonuses FOR SELECT 
    USING (
        tutor_id IN (
            SELECT id FROM tutors 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Step 6: Drop and recreate RLS policies for tutors table
DROP POLICY IF EXISTS "Tutors can view own profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;

CREATE POLICY "Tutors can view own profile" 
    ON tutors FOR SELECT 
    USING (
        auth_user_id = auth.uid()
    );

CREATE POLICY "Tutors can update own profile" 
    ON tutors FOR UPDATE 
    USING (
        auth_user_id = auth.uid()
    );

-- Step 7: Enable RLS on tutors table if not already enabled
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Step 8: Create a function to automatically link auth users to tutors on sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    -- Check if a tutor record already exists with this email
    IF NOT EXISTS (SELECT 1 FROM public.tutors WHERE email = new.email) THEN
        INSERT INTO public.tutors (
            auth_user_id,
            email,
            first_name,
            last_name,
            subjects,
            hourly_rate,
            availability,
            rating,
            total_earnings
        ) VALUES (
            new.id,
            new.email,
            COALESCE(new.raw_user_meta_data->>'first_name', 'New'),
            COALESCE(new.raw_user_meta_data->>'last_name', 'Tutor'),
            '{}',
            50,
            '{}',
            0,
            0
        );
    ELSE
        -- Update existing tutor record with auth_user_id
        UPDATE public.tutors 
        SET auth_user_id = new.id 
        WHERE email = new.email 
        AND auth_user_id IS NULL;
    END IF;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 9: Create trigger for new user signups (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 10: Fix the demo user (sarah_chen@hotmail.com)
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
        WHERE email = 'sarah_chen@hotmail.com';
        
        IF demo_tutor_id IS NOT NULL THEN
            -- Update existing record to ensure auth_user_id is set
            UPDATE tutors 
            SET auth_user_id = demo_auth_id
            WHERE id = demo_tutor_id
            AND (auth_user_id IS NULL OR auth_user_id != demo_auth_id);
            
            RAISE NOTICE 'Updated tutor record for demo user sarah_chen@hotmail.com';
        ELSE
            -- Create tutor record if it doesn't exist
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
                demo_auth_id,
                'sarah_chen@hotmail.com',
                'Sarah',
                'Chen',
                ARRAY['Math', 'Science', 'Physics'],
                50,
                '{"monday": ["9:00-12:00", "14:00-18:00"], "tuesday": ["9:00-12:00", "14:00-18:00"], "wednesday": ["9:00-12:00", "14:00-18:00"], "thursday": ["9:00-12:00", "14:00-18:00"], "friday": ["9:00-12:00", "14:00-17:00"]}'::jsonb,
                true,
                ARRAY['top_rated', 'veteran', 'stem_expert'],
                4.8,
                17100
            );
            
            RAISE NOTICE 'Created tutor record for demo user sarah_chen@hotmail.com';
        END IF;
        
        -- Ensure the demo user has initial tier record
        INSERT INTO tutor_tiers (
            tutor_id, 
            current_tier, 
            total_sessions, 
            average_rating, 
            retention_rate
        )
        SELECT 
            demo_tutor_id,
            'gold',
            342,
            4.8,
            85.5
        WHERE NOT EXISTS (
            SELECT 1 FROM tutor_tiers WHERE tutor_id = demo_tutor_id
        );
        
        -- Add some demo bonuses if none exist
        IF NOT EXISTS (SELECT 1 FROM tutor_bonuses WHERE tutor_id = demo_tutor_id) THEN
            INSERT INTO tutor_bonuses (tutor_id, bonus_type, amount, status, metadata, created_at)
            VALUES 
                (demo_tutor_id, 'session_milestone', 75, 'paid', 
                 '{"milestone": 300, "totalSessions": 300}'::jsonb, 
                 NOW() - INTERVAL '30 days'),
                
                (demo_tutor_id, 'student_retention', 40, 'approved', 
                 '{"studentName": "Emma Wilson", "monthsRetained": 7, "bonusMonths": 4}'::jsonb, 
                 NOW() - INTERVAL '7 days'),
                
                (demo_tutor_id, 'five_star_review', 5, 'approved', 
                 '{"rating": 5, "reviewerName": "Parent"}'::jsonb, 
                 NOW() - INTERVAL '3 days'),
                
                (demo_tutor_id, 'session_milestone', 25, 'pending', 
                 '{"milestone": 350, "totalSessions": 342}'::jsonb, 
                 NOW() - INTERVAL '1 day');
        END IF;
        
    ELSE
        RAISE NOTICE 'Demo user sarah_chen@hotmail.com not found in auth.users';
    END IF;
END $$;

-- Step 11: Create similar policies for other gamification tables
DROP POLICY IF EXISTS "Tutors can view own points" ON gamification_points;
CREATE POLICY "Tutors can view own points" 
    ON gamification_points FOR SELECT 
    USING (
        tutor_id IN (
            SELECT id FROM tutors 
            WHERE auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Tutors can view own badges" ON tutor_badges;
CREATE POLICY "Tutors can view own badges" 
    ON tutor_badges FOR SELECT 
    USING (
        tutor_id IN (
            SELECT id FROM tutors 
            WHERE auth_user_id = auth.uid()
        )
    );

DROP POLICY IF EXISTS "Tutors can view own tier" ON tutor_tiers;
CREATE POLICY "Tutors can view own tier" 
    ON tutor_tiers FOR SELECT 
    USING (
        tutor_id IN (
            SELECT id FROM tutors 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Step 12: Grant necessary permissions
GRANT SELECT ON tutors TO authenticated;
GRANT SELECT ON tutor_bonuses TO authenticated;
GRANT SELECT ON gamification_points TO authenticated;
GRANT SELECT ON tutor_badges TO authenticated;
GRANT SELECT ON tutor_tiers TO authenticated;

-- Verify the fix
SELECT 
    'Tutors with auth_user_id set' as check_type,
    COUNT(*) as count
FROM tutors 
WHERE auth_user_id IS NOT NULL
UNION ALL
SELECT 
    'Tutors without auth_user_id' as check_type,
    COUNT(*) as count
FROM tutors 
WHERE auth_user_id IS NULL; 