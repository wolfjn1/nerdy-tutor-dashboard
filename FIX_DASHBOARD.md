# Fix Dashboard Loading Issues

## The Problem
The dashboard shows "Loading..." because:
1. The tutor profile you created earlier might not have been saved
2. There are no students or sessions yet
3. Possible RLS (Row Level Security) issues

## Quick Fix (2 steps)

### Step 1: Run SQL in Supabase
1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **SQL Editor**
3. Copy and run the SQL from `scripts/fix-tutor.sql`

This will:
- Check if your tutor profile exists
- Create it if missing
- Return the tutor record

### Step 2: Refresh Your App
After running the SQL:
1. Hard refresh your browser (`Cmd+Shift+R` on Mac, `Ctrl+Shift+R` on Windows)
2. The dashboard should show:
   - ✅ 0 Sessions Today
   - ✅ $0 Today's Earnings
   - ✅ 0 Active Students
   - ✅ 0% Success Rate

## Still Having Issues?

### Option A: Disable RLS Temporarily
```sql
ALTER TABLE tutors DISABLE ROW LEVEL SECURITY;
ALTER TABLE students DISABLE ROW LEVEL SECURITY;
ALTER TABLE sessions DISABLE ROW LEVEL SECURITY;
```

### Option B: Set Up Proper RLS Policies
Run the SQL in `scripts/check-rls.sql` to create proper security policies.

### Option C: Check Console
1. Open browser DevTools (F12)
2. Look for `[Dashboard]` logs
3. Check if `tutor` object has an `id` property

## Next Steps
Once the dashboard loads:
1. Create students: Students → Add Student
2. Schedule sessions: Sessions → New Session
3. Test messaging: Click Message on any student

The dashboard will populate with real data as you use the app! 