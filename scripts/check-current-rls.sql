-- Check if RLS is enabled on tutors table
SELECT 
  tablename,
  rowsecurity::text as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'tutors';

-- Check all existing policies on tutors table
SELECT 
  policyname as policy_name,
  cmd as command,
  permissive as type,
  roles::text as roles,
  qual::text as using_clause,
  with_check::text as with_check_clause
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tutors'
ORDER BY policyname;

-- Test what happens with different auth contexts
-- This shows why queries are failing

-- 1. Check if anonymous users can see any tutors
SELECT 
  'Anonymous user query' as test,
  COUNT(*) as visible_tutors
FROM tutors;

-- 2. Check what the current user can see (if logged in)
SELECT 
  'Current user query' as test,
  auth.uid() as current_user_id,
  COUNT(*) as visible_tutors
FROM tutors
WHERE auth.uid() IS NOT NULL;

-- 3. Check if there are any tutors with matching auth_user_id
SELECT 
  'Tutors with matching auth_user_id' as test,
  COUNT(*) as matching_tutors
FROM tutors
WHERE auth_user_id = auth.uid(); 