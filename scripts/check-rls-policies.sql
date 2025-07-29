-- Check RLS policies on tutor_bonuses table

-- 1. Check if RLS is enabled
SELECT 
    'RLS Status' as check_type,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled - Run: ALTER TABLE ' || tablename || ' ENABLE ROW LEVEL SECURITY;'
    END as status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'tutor_bonuses';

-- 2. List all policies on tutor_bonuses
SELECT 
    'Policy Details' as check_type,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'tutor_bonuses'
ORDER BY policyname;

-- 3. Check if the expected policy exists
SELECT 
    'Expected Policy Check' as check_type,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Policy "Tutors can view own bonuses" exists'
        ELSE '❌ Policy "Tutors can view own bonuses" is missing'
    END as status
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'tutor_bonuses'
AND policyname = 'Tutors can view own bonuses';

-- 4. If policy is missing, here's the command to create it
SELECT 
    'Create Policy Command' as action,
    'CREATE POLICY "Tutors can view own bonuses" ON tutor_bonuses FOR SELECT USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));' as sql_command; 