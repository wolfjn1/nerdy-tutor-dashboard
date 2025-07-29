# Sarah Chen Test User Setup

Since you're testing with `sarah_chen@hotmail.com`, let's make sure she's properly set up.

## Quick Check
Run this in your Supabase SQL editor:

```sql
-- Check Sarah's status
SELECT 
    au.id as auth_id,
    au.email,
    t.id as tutor_id,
    t.auth_user_id,
    CASE 
        WHEN au.id IS NULL THEN '❌ No auth user - needs to sign up'
        WHEN t.id IS NULL THEN '❌ No tutor record'
        WHEN t.auth_user_id IS NULL THEN '❌ Tutor not linked'
        WHEN t.auth_user_id != au.id THEN '❌ Wrong auth_user_id'
        ELSE '✅ Properly set up'
    END as status
FROM auth.users au
FULL OUTER JOIN tutors t ON t.email = au.email
WHERE au.email = 'sarah_chen@hotmail.com' OR t.email = 'sarah_chen@hotmail.com';
```

## If Sarah Doesn't Exist in auth.users
She needs to be created through the app first:
1. Go to your app's signup page
2. Sign up with email: `sarah_chen@hotmail.com`
3. Use any password you want

## If Sarah Exists but Not Linked
Run the complete setup script:
```sql
-- Run scripts/ensure-sarah-chen-complete.sql
```

## Quick Fix (if auth user exists)
```sql
-- Get Sarah's auth ID
SELECT id FROM auth.users WHERE email = 'sarah_chen@hotmail.com';

-- Update her tutor record (replace AUTH_ID with the ID from above)
UPDATE tutors 
SET auth_user_id = 'AUTH_ID'
WHERE email = 'sarah_chen@hotmail.com';
```

## After Fixing
1. Clear ALL browser data for the Netlify site
2. Log out completely
3. Log back in as sarah_chen@hotmail.com
4. Try the achievements page

## Debug URL
Visit: `https://nerdy-tutor-dashboard.netlify.app/api/bonuses/debug`
This will show exactly what the API sees for Sarah. 