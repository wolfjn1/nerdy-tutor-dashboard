# Vercel Deployment Guide for Tutor Profile Dashboard

## Pre-Deployment Checklist

### 1. Environment Variables on Vercel

Make sure you have set these environment variables in your Vercel project settings:

```
NEXT_PUBLIC_SUPABASE_URL=https://kyldpxoxayemjhxmehkc.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bGRweG94YXllbWpoeG1laGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDU1MTEsImV4cCI6MjA2NzgyMTUxMX0.59NvfeFGyNSjmuqtjSKgExEKmWDvRF_dWfEvXOuIfc4
```

**Important**: Do NOT include the SUPABASE_SERVICE_ROLE_KEY in Vercel (it's only for server-side/backend use).

### 2. Add Environment Variables to Vercel

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Click on "Environment Variables" in the left sidebar
4. Add each variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase URL (paste the full value)
   - Environment: Select all (Production, Preview, Development)
   
5. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Redeploy After Adding Environment Variables

After adding environment variables, you MUST redeploy:

1. Go to the "Deployments" tab
2. Find your latest deployment
3. Click the three dots menu
4. Select "Redeploy"
5. Choose "Use existing Build Cache: No" to ensure a fresh build

### 4. Check Build Logs

If deployment fails, check the build logs:
1. Go to the deployment that failed
2. Click on "Build Logs"
3. Look for errors related to:
   - Missing environment variables
   - Module not found errors
   - Build command failures

### 5. Common Issues and Solutions

#### Issue: "Module not found" errors
**Solution**: Make sure all dependencies are in `package.json` (not devDependencies if needed at runtime)

#### Issue: "Environment variable not found"
**Solution**: Ensure variables are prefixed with `NEXT_PUBLIC_` for client-side access

#### Issue: Build timeout
**Solution**: Increase build timeout in Project Settings > General > Build & Development Settings

#### Issue: 500 errors on deployed site
**Solution**: Check Function logs in Vercel dashboard for runtime errors

### 6. If Nothing Works - Clean Deployment

If you still have issues, try a clean deployment:

1. **In Vercel Dashboard:**
   - Go to Settings > Git
   - Disconnect the Git repository
   - Delete the project (Settings > General > Delete Project)

2. **Create Fresh Deployment:**
   - Go to https://vercel.com/new
   - Import your Git repository again
   - Add environment variables BEFORE deploying
   - Deploy

### 7. Verify Deployment

After successful deployment:
1. Visit your-app.vercel.app/test-auth
2. Click "Check Environment" - should show both vars as "✓ Set"
3. Click "Test Connection" - should connect successfully
4. Try logging in with demo account

### 8. Debug Production Issues

Create this test page to debug on Vercel:

```typescript
// app/api/env-check/route.ts
export async function GET() {
  return Response.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
  })
}
```

Then visit: your-app.vercel.app/api/env-check

## Quick Fix Script

Run this locally before deploying:

```bash
# Check for common issues
npm run build

# If build succeeds locally but fails on Vercel, 
# it's likely an environment variable issue
```

## Contact Support

If you've tried everything above and still have issues:
1. Check Vercel Status: https://www.vercel-status.com/
2. Contact Vercel Support with:
   - Your deployment URL
   - Build logs
   - Environment check results 