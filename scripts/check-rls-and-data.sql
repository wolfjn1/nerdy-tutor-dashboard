-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tutors', 'students', 'sessions');

-- Check row counts as superuser (bypasses RLS)
SELECT 
  'tutors' as table_name, 
  COUNT(*) as row_count 
FROM tutors
UNION ALL
SELECT 
  'students' as table_name, 
  COUNT(*) as row_count 
FROM students
UNION ALL
SELECT 
  'sessions' as table_name, 
  COUNT(*) as row_count 
FROM sessions;

-- Check policies on tutors table
SELECT pol.polname, pol.polcmd, pol.polpermissive
FROM pg_policy pol
JOIN pg_class cls ON pol.polrelid = cls.oid
WHERE cls.relname = 'tutors';

-- Get first few tutors (bypassing RLS)
SELECT id, first_name, last_name, email, auth_user_id 
FROM tutors 
LIMIT 5;
