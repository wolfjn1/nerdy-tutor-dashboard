-- Check if RLS is enabled on tutors table
SELECT 
  tablename,
  rowsecurity
FROM 
  pg_tables
WHERE 
  schemaname = 'public' 
  AND tablename = 'tutors';

-- Check existing policies
SELECT 
  pol.polname as policy_name,
  pol.polcmd as command,
  pol.polroles as roles,
  pol.polqual as using_expression,
  pol.polwithcheck as with_check_expression
FROM 
  pg_policies pol
WHERE 
  pol.schemaname = 'public' 
  AND pol.tablename = 'tutors';

-- If needed, create a policy to allow authenticated users to read their own tutor record
-- First, drop any existing problematic policies (be careful with this in production!)
DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Users can update own tutor profile" ON tutors;

-- Create new policies
CREATE POLICY "Users can view own tutor profile" 
ON tutors FOR SELECT 
USING (
  auth.uid() = auth_user_id 
  OR auth.jwt() ->> 'email' = email
);

CREATE POLICY "Users can update own tutor profile" 
ON tutors FOR UPDATE 
USING (
  auth.uid() = auth_user_id 
  OR auth.jwt() ->> 'email' = email
);

-- Verify Sarah Chen's record
SELECT 
  id, 
  email, 
  first_name, 
  last_name, 
  auth_user_id,
  CASE 
    WHEN auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45' THEN 'MATCHES' 
    ELSE 'DOES NOT MATCH' 
  END as auth_status
FROM tutors 
WHERE email = 'sarah_chen@hotmail.com'; 