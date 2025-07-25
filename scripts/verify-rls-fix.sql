-- Check if the new policy exists
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tutors'
  AND policyname = 'Authenticated users can view all tutors';

-- If the above returns nothing, the fix wasn't applied
-- Let's check all current policies again
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename = 'tutors'
ORDER BY policyname; 