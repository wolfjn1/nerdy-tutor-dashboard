-- QUICK FIX: Temporarily disable RLS on tutors table
-- WARNING: This is for debugging only! Re-enable RLS in production!

ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;

-- Verify it worked
SELECT 
  tablename,
  rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'tutors';

-- To re-enable RLS later:
-- ALTER TABLE tutors ENABLE ROW LEVEL SECURITY; 