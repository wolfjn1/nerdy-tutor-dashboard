-- During authentication, the app needs to check if a tutor exists
-- before the user is fully authenticated. This policy allows that.

-- Allow anon users to read tutor data (needed for auth flow)
CREATE POLICY "Allow anon to read tutors for auth flow" 
ON tutors 
FOR SELECT 
TO anon
USING (true);

-- Verify all policies
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tutors'
ORDER BY policyname;

-- Test that it works
SELECT COUNT(*) as should_be_5 FROM tutors; 