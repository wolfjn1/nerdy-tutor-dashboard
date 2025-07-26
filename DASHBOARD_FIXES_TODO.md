# Dashboard Fixes TODO

## Critical Issue: RLS Policies Missing
**Status**: 🔴 Blocking all data access  
**Solution**: Run `apply-rls-policies.sql` in Supabase SQL Editor

The main issue preventing the dashboard from showing data is that Row Level Security is enabled but no policies exist. This blocks ALL data access for authenticated users.

### To Fix:
1. Go to Supabase SQL Editor
2. Copy the contents of `apply-rls-policies.sql`
3. Execute all commands
4. Verify policies were created with the last SELECT statement

## React Hydration Errors
**Status**: 🟡 Causing console errors  
**Location**: `app/(dashboard)/dashboard/dashboard-client.tsx` line 104

### The Problem:
```tsx
{new Date(session.scheduled_at).toLocaleString()} • {session.subject}
```

`toLocaleString()` produces different outputs on server vs client, causing hydration mismatches.

### Quick Fix:
Replace with a consistent date formatter:
```tsx
{new Date(session.scheduled_at).toISOString().replace('T', ' ').slice(0, 16)} • {session.subject}
```

### Better Fix:
Create a date formatting utility that's consistent between server and client:
```tsx
// lib/utils/formatters.ts
export function formatDateTime(date: string | Date) {
  const d = new Date(date)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}
```

## Testing Pages 404
**Status**: ✅ Fixed  
**Solution**: Files have been touched to trigger Next.js route recognition

The pages exist but Next.js needed to be notified:
- `/test-rls` - Tests RLS policy functionality
- `/debug-dashboard` - Shows detailed query results

## Data Verification
**Status**: ✅ Data exists in database
- Sarah has 16 students
- Multiple sessions scheduled
- Service role can access all data

## Order of Operations

1. **First**: Apply RLS policies (critical)
2. **Second**: Fix hydration error (improves UX)
3. **Then**: Test using `/test-rls` page
4. **Finally**: Check main dashboard at `/dashboard`

## Alternative Quick Test
If you need to test immediately without applying policies:
1. Run `temp-disable-rls.sql` to disable RLS
2. Test that dashboard works
3. **Important**: Re-enable RLS with proper policies afterward

## Expected Results After Fix
- Dashboard shows 16 students for Sarah
- Today's sessions display correctly
- No console errors
- All test pages load without 404s 