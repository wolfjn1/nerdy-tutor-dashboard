-- First, check if RLS is enabled on the tutors table
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'tutors';

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Users can update their own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Service role can do anything" ON tutors;

-- Enable RLS on tutors table
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can view their own tutor profile
CREATE POLICY "Users can view their own tutor profile"
ON tutors
FOR SELECT
TO authenticated
USING (auth_user_id = auth.uid());

-- Create policy: Users can update their own tutor profile
CREATE POLICY "Users can update their own tutor profile"
ON tutors
FOR UPDATE
TO authenticated
USING (auth_user_id = auth.uid())
WITH CHECK (auth_user_id = auth.uid());

-- Create policy: Service role can do anything (for admin operations)
CREATE POLICY "Service role can do anything"
ON tutors
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Verify the policies were created
SELECT 
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'tutors'; 