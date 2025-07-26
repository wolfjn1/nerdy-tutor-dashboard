-- IMPORTANT: Run these commands in order

-- 1. First, check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tutors', 'students', 'sessions');

-- 2. Enable RLS on all tables (if not already enabled)
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can view their students" ON students;
DROP POLICY IF EXISTS "Tutors can manage their students" ON students;
DROP POLICY IF EXISTS "Tutors can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Tutors can manage their sessions" ON sessions;

-- 4. Create policy for tutors table - users can only see their own profile
CREATE POLICY "Users can view own tutor profile" 
ON tutors FOR SELECT 
USING (auth.uid() = auth_user_id);

-- 5. Create policy for tutors table - users can update their own profile
CREATE POLICY "Tutors can update own profile" 
ON tutors FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- 6. Create policy for students table - tutors can see their own students
CREATE POLICY "Tutors can view their students" 
ON students FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 7. Create policy for students table - tutors can manage their own students
CREATE POLICY "Tutors can manage their students" 
ON students FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 8. Create policy for sessions table - tutors can see their own sessions
CREATE POLICY "Tutors can view their sessions" 
ON sessions FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 9. Create policy for sessions table - tutors can manage their own sessions
CREATE POLICY "Tutors can manage their sessions" 
ON sessions FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 10. Verify the policies were created
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tutors', 'students', 'sessions')
ORDER BY tablename, policyname;

-- 11. Test with Sarah's account (this will show 0 in SQL editor but should work in app)
-- When Sarah is logged in, auth.uid() will return 'ae70c119-d3e5-470e-8807-16f1b28aba45'
SELECT 'Policies created successfully!' as status;