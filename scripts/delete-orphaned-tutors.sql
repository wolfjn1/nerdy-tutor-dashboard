-- Delete orphaned test tutor records
-- These are tutors with no matching auth users

-- Show what we're about to delete
SELECT 
    'WILL DELETE' as action,
    COUNT(*) as count,
    STRING_AGG(t.email, ', ') as emails
FROM tutors t
WHERE t.auth_user_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = t.email
);

-- Delete related records first (to avoid foreign key violations)
DO $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete from all related tables
    DELETE FROM students WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );
    
    DELETE FROM sessions WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );
    
    DELETE FROM tutor_bonuses WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );

    DELETE FROM tutor_tiers WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );

    DELETE FROM gamification_points WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );

    DELETE FROM tutor_badges WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );
    
    DELETE FROM tutor_onboarding WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );
    
    DELETE FROM ai_tool_usage WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );
    
    DELETE FROM nudge_deliveries WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );
    
    DELETE FROM student_outcomes WHERE tutor_id IN (
        SELECT id FROM tutors t
        WHERE t.auth_user_id IS NULL
        AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email)
    );

    -- Finally, delete the orphaned tutors themselves
    DELETE FROM tutors t
    WHERE t.auth_user_id IS NULL
    AND NOT EXISTS (SELECT 1 FROM auth.users au WHERE au.email = t.email);
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RAISE NOTICE 'Deleted % orphaned tutor records', deleted_count;
END $$;

-- Verify the cleanup
SELECT 
    'After Cleanup' as status,
    COUNT(*) FILTER (WHERE auth_user_id IS NOT NULL) as linked_tutors,
    COUNT(*) FILTER (WHERE auth_user_id IS NULL) as unlinked_tutors,
    COUNT(*) as total_tutors
FROM tutors;

-- Final check - should show 0 unlinked tutors
SELECT 
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SUCCESS - All orphaned tutors deleted'
        ELSE '❌ FAILED - ' || COUNT(*) || ' orphaned tutors remain'
    END as result
FROM tutors t
WHERE t.auth_user_id IS NULL; 