-- Enable RLS on all tables
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Enable read access for all users" ON tutors;
DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tutors;
DROP POLICY IF EXISTS "Tutors can view their students" ON students;
DROP POLICY IF EXISTS "Tutors can manage their students" ON students;
DROP POLICY IF EXISTS "Tutors can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Tutors can manage their sessions" ON sessions;

-- Create policies for tutors table
CREATE POLICY "Users can view own tutor profile" 
ON tutors FOR SELECT 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Tutors can update own profile" 
ON tutors FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Create policies for students table
CREATE POLICY "Tutors can view their students" 
ON students FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage their students" 
ON students FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- Create policies for sessions table
CREATE POLICY "Tutors can view their sessions" 
ON sessions FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage their sessions" 
ON sessions FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- Create policies for invoices table (if needed)
CREATE POLICY "Tutors can view their invoices" 
ON invoices FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- Create policies for homework table (if needed)
CREATE POLICY "Tutors can view their homework" 
ON homework FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- Test queries to verify the policies are working
-- First check if you can see your own tutor record
SELECT COUNT(*) as my_tutor_record FROM tutors WHERE auth_user_id = auth.uid();

-- Then check if you can see your students
SELECT COUNT(*) as my_students FROM students WHERE tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid());

-- And your sessions
SELECT COUNT(*) as my_sessions FROM sessions WHERE tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()); 