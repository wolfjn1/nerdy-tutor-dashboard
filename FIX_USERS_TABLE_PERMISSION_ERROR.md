# Fix: Permission Denied for Table Users

## The Issue
The debug endpoint revealed the exact problem:
```json
"error": {
  "code": "42501",
  "message": "permission denied for table users"
}
```

The RLS policies were trying to access `auth.users` table, which is not allowed in Supabase. The problematic part was:
```sql
OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
```

## The Solution
Remove any references to `auth.users` in RLS policies. The corrected policy:
```sql
CREATE POLICY "Tutors can view own bonuses" 
    ON tutor_bonuses FOR SELECT 
    USING (
        tutor_id IN (
            SELECT id FROM tutors 
            WHERE auth_user_id = auth.uid()
        )
    );
```

## Quick Fix
Run this in your Supabase SQL editor:
```sql
-- Run scripts/fix-rls-policy-users-error.sql
```

This will:
1. Drop the problematic policies
2. Create new policies without auth.users references
3. Fix all affected tables (tutor_bonuses, gamification_points, tutor_badges, tutor_tiers)

## Why This Works
- The `auth.uid()` function returns the current user's ID
- We only need to check if the tutor's auth_user_id matches
- No need to access the restricted auth.users table
- This is more secure and performant

After running the fix, the achievements page should work immediately! 