-- Link remaining tutors to auth users

-- First, let's see which tutors don't have auth_user_id
SELECT 
    t.id,
    t.email,
    t.first_name,
    t.last_name,
    au.id as auth_user_id_match
FROM tutors t
LEFT JOIN auth.users au ON au.email = t.email
WHERE t.auth_user_id IS NULL
ORDER BY t.email;

-- Now link them based on email match
UPDATE tutors t
SET auth_user_id = au.id
FROM auth.users au
WHERE t.email = au.email
AND t.auth_user_id IS NULL;

-- Check how many we fixed
SELECT 
    'Before Fix - Tutors without auth_user_id' as status,
    9 as count
UNION ALL
SELECT 
    'After Fix - Tutors without auth_user_id' as status,
    COUNT(*) as count
FROM tutors
WHERE auth_user_id IS NULL;

-- Show any remaining unlinked tutors (these would be tutors whose emails don't match any auth.users)
SELECT 
    'Unlinked Tutors (no matching auth user)' as issue,
    t.id,
    t.email,
    t.first_name,
    t.last_name
FROM tutors t
WHERE t.auth_user_id IS NULL
AND NOT EXISTS (
    SELECT 1 FROM auth.users au WHERE au.email = t.email
);

-- For any remaining unlinked tutors, we might need to create auth users for them
-- or update their email addresses to match existing auth users 