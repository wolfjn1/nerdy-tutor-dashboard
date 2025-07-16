-- Check RLS status for all tables
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('tutors', 'students', 'sessions', 'conversations', 'messages')
ORDER BY tablename;

-- Check existing policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- If you need to temporarily disable RLS to test (BE CAREFUL - only for development):
-- ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE students DISABLE ROW LEVEL SECURITY;
-- ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;

-- Better solution: Create proper policies for authenticated users
-- These allow users to read their own data

-- Drop existing policies if needed (uncomment as necessary)
-- DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
-- DROP POLICY IF EXISTS "Tutors can view own students" ON students;
-- DROP POLICY IF EXISTS "Tutors can view own sessions" ON sessions;

-- Create read policies
CREATE POLICY "Users can view own tutor profile" ON tutors
  FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Tutors can view own students" ON students
  FOR SELECT
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can view own sessions" ON sessions
  FOR SELECT
  USING (
    tutor_id IN (
      SELECT id FROM tutors WHERE auth_user_id = auth.uid()
    )
  );

-- Create insert/update policies as needed
CREATE POLICY "Tutors can create students" ON students
  FOR INSERT
  WITH CHECK (
    tutor_id IN (
      SELECT id FROM tutors WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Tutors can create sessions" ON sessions
  FOR INSERT
  WITH CHECK (
    tutor_id IN (
      SELECT id FROM tutors WHERE auth_user_id = auth.uid()
    )
  ); 