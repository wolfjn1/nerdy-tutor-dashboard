-- Check current RLS status
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'tutors';

-- Check existing policies
SELECT 
  polname as policy_name,
  polcmd as command,
  polqual as using_expression,
  polwithcheck as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tutors';

-- Drop any existing policies that might be blocking
DROP POLICY IF EXISTS "Enable read access for all users" ON tutors;
DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;

-- Create new policy that allows authenticated users to read all tutors
-- (This is for demo purposes - in production you'd want stricter policies)
CREATE POLICY "Enable read access for authenticated users" 
ON tutors FOR SELECT 
USING (true);  -- This allows all reads - adjust as needed

-- Create policy for updates (only own profile)
CREATE POLICY "Users can update own tutor profile" 
ON tutors FOR UPDATE 
USING (auth.uid() = auth_user_id);

-- Verify the fix
SELECT COUNT(*) as tutor_count FROM tutors; 