-- Script to bypass onboarding for testing purposes
-- Run this in Supabase SQL Editor to mark onboarding as complete for a specific user

-- Option 1: Mark onboarding complete for a specific email
DO $$
DECLARE
    v_tutor_id UUID;
    v_auth_user_id UUID;
BEGIN
    -- Replace with your test email
    SELECT au.id INTO v_auth_user_id
    FROM auth.users au
    WHERE au.email = 'your-test-email@example.com';
    
    IF v_auth_user_id IS NOT NULL THEN
        -- Get or create tutor record
        SELECT id INTO v_tutor_id
        FROM tutors
        WHERE auth_user_id = v_auth_user_id;
        
        IF v_tutor_id IS NOT NULL THEN
            -- Insert all 5 onboarding steps as completed
            INSERT INTO tutor_onboarding (tutor_id, step_completed, completed_at, metadata)
            VALUES 
                (v_tutor_id, 'welcome', NOW() - INTERVAL '5 minutes', '{"step_title": "Welcome", "step_order": 1}'::jsonb),
                (v_tutor_id, 'profile_setup', NOW() - INTERVAL '4 minutes', '{"step_title": "Profile Setup", "step_order": 2}'::jsonb),
                (v_tutor_id, 'best_practices', NOW() - INTERVAL '3 minutes', '{"step_title": "Best Practices", "step_order": 3}'::jsonb),
                (v_tutor_id, 'ai_tools_intro', NOW() - INTERVAL '2 minutes', '{"step_title": "AI Tools Introduction", "step_order": 4}'::jsonb),
                (v_tutor_id, 'first_student_guide', NOW() - INTERVAL '1 minute', '{"step_title": "First Student Guide", "step_order": 5}'::jsonb)
            ON CONFLICT (tutor_id, step_completed) DO NOTHING;
            
            RAISE NOTICE 'Onboarding marked as complete for tutor ID: %', v_tutor_id;
        ELSE
            RAISE NOTICE 'No tutor record found for user. Tutor record will be created on next onboarding attempt.';
        END IF;
    ELSE
        RAISE NOTICE 'No user found with that email';
    END IF;
END $$;

-- Option 2: Clear all onboarding data for a specific email (to test onboarding flow)
/*
DELETE FROM tutor_onboarding
WHERE tutor_id IN (
    SELECT t.id 
    FROM tutors t
    JOIN auth.users au ON au.id = t.auth_user_id
    WHERE au.email = 'your-test-email@example.com'
);
*/

-- Option 3: Check onboarding status for a user
/*
SELECT 
    au.email,
    t.id as tutor_id,
    t.first_name,
    t.last_name,
    COUNT(to_table.id) as completed_steps,
    ARRAY_AGG(to_table.step_completed ORDER BY to_table.completed_at) as steps_completed
FROM auth.users au
LEFT JOIN tutors t ON t.auth_user_id = au.id
LEFT JOIN tutor_onboarding to_table ON to_table.tutor_id = t.id
WHERE au.email = 'your-test-email@example.com'
GROUP BY au.email, t.id, t.first_name, t.last_name;
*/ 