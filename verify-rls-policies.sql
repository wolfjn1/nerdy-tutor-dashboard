-- First, let's check if RLS is enabled on the tables
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED ✅' ELSE 'DISABLED ❌' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('tutors', 'students', 'sessions', 'invoices', 'homework')
ORDER BY tablename;

-- Check what policies exist
SELECT 
  tablename,
  policyname,
  cmd,
  qual as using_clause
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('tutors', 'students', 'sessions')
ORDER BY tablename, policyname;

-- Test with Sarah's auth_user_id directly (bypassing auth.uid())
-- This simulates what would happen when Sarah is logged in
SET LOCAL request.jwt.claims = '{"sub": "ae70c119-d3e5-470e-8807-16f1b28aba45"}';

-- Now test the queries as if you were Sarah
SELECT COUNT(*) as sarah_tutor_record FROM tutors WHERE auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45';

-- Check Sarah's students
SELECT COUNT(*) as sarah_students 
FROM students 
WHERE tutor_id IN (
  SELECT id FROM tutors WHERE auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45'
);

-- Check Sarah's sessions
SELECT COUNT(*) as sarah_sessions 
FROM sessions 
WHERE tutor_id IN (
  SELECT id FROM tutors WHERE auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45'
);

-- Alternative: Test without RLS (as service role)
-- This shows what data exists regardless of policies
SELECT 
  'Total tutors' as metric,
  COUNT(*) as count
FROM tutors
UNION ALL
SELECT 
  'Sarah tutor records' as metric,
  COUNT(*) as count
FROM tutors 
WHERE auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45'
UNION ALL
SELECT 
  'Total students' as metric,
  COUNT(*) as count
FROM students
UNION ALL
SELECT 
  'Sarah students' as metric,
  COUNT(*) as count
FROM students 
WHERE tutor_id = 'd87df13b-5487-4b04-89c8-4b18bf89250a'
UNION ALL
SELECT 
  'Total sessions' as metric,
  COUNT(*) as count
FROM sessions
UNION ALL
SELECT 
  'Sarah sessions' as metric,
  COUNT(*) as count
FROM sessions 
WHERE tutor_id = 'd87df13b-5487-4b04-89c8-4b18bf89250a'; 