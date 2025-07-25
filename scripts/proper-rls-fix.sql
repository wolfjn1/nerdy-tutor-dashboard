-- First, let's check what policies currently exist
SELECT 
  polname as policy_name,
  polcmd as command,
  polpermissive as permissive,
  polroles as roles,
  polqual as using_expression,
  polwithcheck as with_check_expression
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tutors';

-- Drop any overly restrictive policies
DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Users can update own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Enable read access for all users" ON tutors;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON tutors;
DROP POLICY IF EXISTS "Enable update for users based on auth_user_id" ON tutors;

-- Create proper policies for a tutoring platform

-- 1. Allow all authenticated users to view all tutors (for browsing/discovery)
CREATE POLICY "Authenticated users can view all tutors" 
ON tutors FOR SELECT 
TO authenticated
USING (true);

-- 2. Allow users to update only their own tutor profile
CREATE POLICY "Users can update own tutor profile" 
ON tutors FOR UPDATE 
TO authenticated
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- 3. Allow authenticated users to insert their own tutor profile
CREATE POLICY "Users can create own tutor profile" 
ON tutors FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = auth_user_id);

-- 4. Allow users to delete only their own tutor profile
CREATE POLICY "Users can delete own tutor profile" 
ON tutors FOR DELETE 
TO authenticated
USING (auth.uid() = auth_user_id);

-- Verify the policies are created
SELECT 
  polname as policy_name,
  polcmd as command
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tutors'
ORDER BY polname; 