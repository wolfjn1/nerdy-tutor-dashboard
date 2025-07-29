# Troubleshooting 403 Errors on Netlify Deployment

## Issue
The achievements page returns 403 (Forbidden) errors when deployed on Netlify, even after database fixes were applied.

## Common Causes

### 1. Different Supabase Instance
The most common cause is that your Netlify deployment is using different Supabase environment variables than your local development.

**Check:**
- Go to Netlify Dashboard → Site Settings → Environment Variables
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Compare with your local `.env.local` file

**Fix:**
If they're different, you need to run the SQL fixes on the production Supabase instance:
1. Go to the Supabase dashboard for the PRODUCTION project
2. Run all the SQL scripts in the production database

### 2. User Authentication Mismatch
The logged-in user might not have a properly linked tutor record.

**Debug Steps:**
1. Find out which email you're logged in with
2. Run the debug script with your email:
   ```sql
   -- In scripts/debug-403-error.sql
   -- Replace 'YOUR_EMAIL_HERE' with your actual email
   -- Run each query separately
   ```

### 3. Browser Cache Issues
Old authentication tokens might be cached.

**Fix:**
1. Clear all cookies for the Netlify domain
2. Clear browser cache
3. Try in an incognito/private window
4. Log out and log back in

### 4. RLS Policy Issues
The Row Level Security policies might not be working correctly in production.

**Common Error: "permission denied for table users"**
If you see this error, your RLS policies are trying to access `auth.users` which is not allowed. Fix with:
```sql
-- Run scripts/fix-rls-policy-users-error.sql
```

**Verify RLS is working:**
```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tutors', 'tutor_bonuses');

-- Check if policies exist
SELECT * FROM pg_policies 
WHERE tablename IN ('tutors', 'tutor_bonuses');
```

## Step-by-Step Resolution

### Step 1: Identify Your Environment
1. Check Netlify environment variables
2. Confirm which Supabase project is being used

### Step 2: Debug Current User
Run this in the PRODUCTION Supabase SQL editor:
```sql
-- Replace with your email
WITH check_user AS (
    SELECT 'your-email@example.com' as email
)
SELECT 
    'User Status' as check,
    au.id as auth_id,
    t.id as tutor_id,
    t.auth_user_id,
    CASE 
        WHEN au.id IS NULL THEN 'No auth user'
        WHEN t.id IS NULL THEN 'No tutor record'
        WHEN t.auth_user_id IS NULL THEN 'Tutor not linked'
        WHEN t.auth_user_id = au.id THEN 'OK'
        ELSE 'Mismatch'
    END as status
FROM check_user cu
LEFT JOIN auth.users au ON au.email = cu.email
LEFT JOIN tutors t ON t.email = cu.email;
```

### Step 3: Apply Fixes to Production
If the production database is missing the fixes:
1. Run `scripts/fix-achievements-403-error.sql` in production
2. Run `scripts/delete-orphaned-tutors.sql` if needed
3. Verify with `scripts/simple-verification.sql`

### Step 4: Create/Link User if Needed
If your user isn't properly linked:
```sql
-- Get the auth user ID
SELECT id, email FROM auth.users WHERE email = 'your-email@example.com';

-- If tutor exists but not linked, update it
UPDATE tutors 
SET auth_user_id = 'AUTH_USER_ID_FROM_ABOVE'
WHERE email = 'your-email@example.com';

-- If no tutor record, create one
INSERT INTO tutors (
    auth_user_id,
    email,
    first_name,
    last_name,
    subjects,
    hourly_rate,
    availability,
    rating,
    total_earnings
) VALUES (
    'AUTH_USER_ID_FROM_ABOVE',
    'your-email@example.com',
    'Your',
    'Name',
    '{}',
    50,
    '{}',
    0,
    0
);
```

### Step 5: Test the Fix
1. Clear browser cache and cookies
2. Log out completely
3. Log back in
4. Try accessing the achievements page

## Quick Checklist
- [ ] Verified Netlify is using correct Supabase instance
- [ ] Confirmed user exists in auth.users table
- [ ] Confirmed tutor record exists and is linked
- [ ] Applied all SQL fixes to production database
- [ ] Cleared browser cache and cookies
- [ ] Logged out and back in

## If Still Not Working
1. Check browser console for specific error messages
2. Check Netlify function logs for server-side errors
3. Verify the API endpoint URL is correct
4. Test with a different user account
5. Try deploying a fresh build on Netlify

## Prevention
To prevent this in the future:
1. Always test on the same Supabase instance as production
2. Use the automatic user-tutor linking trigger
3. Document which Supabase project is for production
4. Set up proper CI/CD to run migrations automatically 