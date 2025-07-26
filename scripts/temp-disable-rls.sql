-- TEMPORARY: Disable RLS to test if dashboard works
-- WARNING: Only use this for testing! Re-enable RLS after fixing policies

-- Disable RLS on all tables
ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE homework DISABLE ROW LEVEL SECURITY;

-- Verify RLS is disabled
SELECT 
  tablename,
  CASE WHEN rowsecurity THEN 'ENABLED ⚠️' ELSE 'DISABLED ✅' END as rls_status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tutors', 'students', 'sessions', 'invoices', 'homework')
ORDER BY tablename;

-- Test query
SELECT COUNT(*) as total_students FROM students;
SELECT COUNT(*) as total_sessions FROM sessions; 