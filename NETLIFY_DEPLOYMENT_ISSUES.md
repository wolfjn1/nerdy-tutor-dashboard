# Netlify Deployment Issues - Root Cause Analysis

## The Pattern
**Everything works locally but fails on Netlify** - This has happened with:
1. Authentication (previously)
2. Data display (currently showing outdated/cached data)

## Common Root Causes

### 1. 🔴 Environment Variables (Most Likely)
**Check in Netlify Dashboard** (Site Settings → Environment Variables):
- `NEXT_PUBLIC_SUPABASE_URL` - Must match your Supabase project
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Must match your Supabase project
- `SUPABASE_SERVICE_ROLE_KEY` - Required for server-side operations

**Common Issues:**
- Missing variables
- Wrong values (copied from different project)
- Not prefixed with `NEXT_PUBLIC_` for client-side vars
- Using development keys in production

### 2. 🟡 Build Cache (Very Common)
Netlify aggressively caches builds. Your changes might not be deployed.

**Fix:**
1. Go to Netlify Dashboard
2. Deploys → Trigger Deploy → Clear cache and deploy site
3. Or add a cache-busting build command:
   ```toml
   [build]
     command = "rm -rf .next node_modules/.cache && npm ci && npm run build"
   ```

### 3. 🟡 Build vs Runtime Environment
- **Build time**: When Next.js generates static pages
- **Runtime**: When API routes execute

**Issues:**
- Environment variables not available at build time
- Static generation using stale data
- Time zone differences (local vs UTC)

### 4. 🟡 Supabase RLS & Authentication Context
- Netlify's servers connect from different IPs
- Authentication tokens might not persist correctly
- RLS policies might behave differently

## Immediate Actions

### 1. Verify Environment Variables
```bash
# In Netlify dashboard, ensure these are set:
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key
```

### 2. Force Fresh Deploy
1. Change something trivial (add a comment)
2. Commit and push
3. In Netlify: "Clear cache and deploy site"

### 3. Add Debug Endpoint
Create `/api/debug-env` to check environment on Netlify:
```typescript
export async function GET() {
  return Response.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    nodeEnv: process.env.NODE_ENV,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: new Date().toISOString()
  })
}
```

### 4. Check Build Logs
In Netlify dashboard → Deploys → Click on a deploy → View build logs
Look for:
- Environment variable warnings
- Build errors
- Which pages are statically generated

## The Data Mismatch Issue

Your dashboard shows:
- **Sidebar**: 12 students (hardcoded, old value)
- **Stats**: 15 active students (correct from database)
- **Sessions**: 1 today (possibly cached or timezone issue)

This suggests:
1. Some components use hardcoded values (sidebar)
2. Some components fetch real data (stats)
3. Date calculations might differ (timezone)

## Long-term Solution

1. **Remove ALL hardcoded values**
2. **Use dynamic data fetching everywhere**
3. **Add cache headers to API routes**:
   ```typescript
   return new Response(json, {
     headers: {
       'Cache-Control': 'no-store, max-age=0'
     }
   })
   ```
4. **Use UTC dates consistently**
5. **Add deployment timestamp** to verify fresh deploys

## Quick Test

After deploy, check these URLs on Netlify:
- `/api/check-data` - Should show current data
- `/api/debug-env` - Should show env vars are present
- View page source - Check if data is in HTML (SSR) or loaded later (CSR) 