-- URGENT: Fix RLS to allow Sarah Chen to login

-- Step 1: Check current RLS status
SELECT tablename, rowsecurity::text as rls_enabled 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'tutors';

-- Step 2: Temporarily disable RLS to test
ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;

-- Step 3: Test if Sarah's record exists and is correct
SELECT 
  id, 
  email, 
  first_name || ' ' || last_name as name,
  auth_user_id,
  CASE 
    WHEN auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45' THEN '✅ CORRECT AUTH ID' 
    ELSE '❌ WRONG AUTH ID: ' || COALESCE(auth_user_id, 'NULL')
  END as status
FROM tutors 
WHERE email = 'sarah_chen@hotmail.com';

-- Step 4: After confirming it works, you can set up proper RLS policies
-- ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
-- Then add proper policies as shown in check-and-fix-rls.sql 