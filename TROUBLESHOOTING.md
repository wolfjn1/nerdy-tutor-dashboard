# Dashboard Troubleshooting Guide

## Current Issues
1. Sidebar shows "12" instead of "16" students
2. Dashboard shows "1" session instead of "4"
3. React hydration errors on refresh
4. New pages returning 404

## Step-by-Step Fix

### 1. Restart Next.js Development Server (REQUIRED)
```bash
# Stop the server with Ctrl+C, then restart:
npm run dev
```

### 2. Clear All Caches
- Browser: `Cmd+Shift+R` (Mac) or `Ctrl+Shift+F5` (Windows)
- Next.js: Delete `.next` folder
```bash
rm -rf .next
npm run dev
```

### 3. Check the Data
After restarting, visit: `/api/check-data`
This will show JSON with:
- Your authenticated user info
- Student count
- Today's sessions

### 4. Look for Debug Info
- **On Dashboard**: Yellow box showing debug data
- **In Console**: Look for "Dashboard Client Data" log
- **In Terminal**: Check for "Dashboard data debug" server log

### 5. If Still Not Working
Run this command to verify file changes:
```bash
grep -n "badge.*16" components/layout/Sidebar.tsx
```
Should show: `badge: '16'`

### 6. Nuclear Option
If nothing works:
1. Stop the dev server
2. Delete `.next` folder
3. Delete `node_modules/.cache`
4. Clear browser data completely
5. Restart dev server

## Expected Results After Fix
- Sidebar: Shows "16" students
- Dashboard: Shows "4" sessions today (or actual count)
- Debug box: Shows actual data counts
- Console: Shows detailed session data

## API Endpoints for Testing
- `/api/check-data` - JSON response with all counts
- `/api/test-auth-data` - More detailed auth info

## Known Issues
- Date formatting causes hydration errors (partially fixed)
- Hardcoded values in multiple places
- Caching can be aggressive in development 