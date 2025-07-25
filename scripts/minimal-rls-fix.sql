-- Minimal RLS fix for authentication flow
-- This allows the app to query tutor data during login

-- First, check current policies
SELECT policyname FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'tutors';

-- Option 1: Allow authenticated users to see all tutors
-- This is the most common pattern for a tutoring platform
CREATE POLICY "Allow authenticated users to read tutors" 
ON tutors FOR SELECT 
TO authenticated
USING (true);

-- Option 2: If you need anonymous access during auth flow
-- (e.g., to check if a user exists before they're fully authenticated)
-- Uncomment this if Option 1 doesn't work:
/*
CREATE POLICY "Allow anonymous to read basic tutor info" 
ON tutors FOR SELECT 
TO anon
USING (true);
*/

-- Option 3: More restrictive - users can only see their own profile
-- plus a few public fields of other tutors
-- This requires a more complex setup:
/*
CREATE POLICY "Users see own profile and limited info of others" 
ON tutors FOR SELECT 
TO authenticated
USING (
  auth.uid() = auth_user_id 
  OR 
  true -- This allows seeing other tutors too, modify as needed
);
*/

-- After running one of these options, test with:
SELECT COUNT(*) as visible_tutors FROM tutors; 