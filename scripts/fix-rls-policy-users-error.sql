-- Fix RLS policy error: "permission denied for table users"
-- The issue is that RLS policies cannot access auth.users table directly

-- Step 1: Drop the problematic policy
DROP POLICY IF EXISTS "Tutors can view own bonuses" ON tutor_bonuses;

-- Step 2: Create a simpler policy that doesn't reference auth.users
CREATE POLICY "Tutors can view own bonuses" 
    ON tutor_bonuses FOR SELECT 
    USING (
        tutor_id IN (
            SELECT id FROM tutors 
            WHERE auth_user_id = auth.uid()
        )
    );

-- Step 3: Also fix other tables if they have the same issue
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

-- Step 4: Verify the fix
SELECT 
    'RLS Policy Check' as check,
    tablename,
    policyname,
    cmd,
    qual
FROM pg_policies
WHERE tablename IN ('tutor_bonuses', 'gamification_points', 'tutor_badges', 'tutor_tiers')
ORDER BY tablename, policyname; 