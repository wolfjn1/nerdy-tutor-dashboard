# Quick Vercel Fix Steps

Since everything works locally but fails on Vercel, the issue is almost certainly missing environment variables on Vercel.

## Option 1: Fix Current Deployment (Recommended)

1. **Go to your Vercel project**: https://vercel.com/dashboard
2. **Click on your project** (nerdy-tutor-dashboard)
3. **Go to Settings → Environment Variables**
4. **Add these two variables** (copy/paste exactly):

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://kyldpxoxayemjhxmehkc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bGRweG94YXllbWpoeG1laGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDU1MTEsImV4cCI6MjA2NzgyMTUxMX0.59NvfeFGyNSjmuqtjSKgExEKmWDvRF_dWfEvXOuIfc4
   ```

5. **Important**: Select all environments (Production, Preview, Development)
6. **Go to Deployments tab**
7. **Click the 3 dots on latest deployment → Redeploy**
8. **Choose "Use existing Build Cache: No"**

## Option 2: Fresh Deployment

If Option 1 doesn't work:

1. **Delete the Vercel project**:
   - Settings → General → Delete Project
   
2. **Create new deployment**:
   - Go to https://vercel.com/new
   - Import your repository
   - **BEFORE clicking Deploy**, add the environment variables
   - Then click Deploy

## After Deployment

Test these URLs:
- `your-app.vercel.app/api/env-check` - Should show both variables as true
- `your-app.vercel.app/test-auth` - Should connect successfully

## Common Issues

- **Still getting errors?** Check Function Logs in Vercel dashboard
- **Build failing?** Check Build Logs for specific errors
- **Still showing "Loading..."?** Clear browser cache and cookies

The app builds successfully locally, so this is definitely an environment/configuration issue on Vercel, not a code issue. 