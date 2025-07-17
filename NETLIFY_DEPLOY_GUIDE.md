# Deploy to Netlify - Quick Guide

## Step 1: Deploy via Netlify UI

1. **Go to**: https://app.netlify.com/start
2. **Click**: "Import an existing project"
3. **Choose**: GitHub
4. **Select**: Your repository (wolfjn1/nerdy-tutor-dashboard)
5. **Build Settings** (should auto-detect from netlify.toml):
   - Build command: `npm run build`
   - Publish directory: `.next`
6. **Click**: "Deploy site"

## Step 2: Add Environment Variables

After initial deployment:

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable** → **Add a single variable**
3. Add these one by one:

```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://kyldpxoxayemjhxmehkc.supabase.co

Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bGRweG94YXllbWpoeG1laGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDU1MTEsImV4cCI6MjA2NzgyMTUxMX0.59NvfeFGyNSjmuqtjSKgExEKmWDvRF_dWfEvXOuIfc4
```

4. **Trigger a redeploy**: Deploys → Trigger deploy → Clear cache and deploy site

## Step 3: Test Your Deployment

Visit these URLs:
- `your-site.netlify.app/dashboard-static` - Should work immediately
- `your-site.netlify.app/api/env-check` - Check environment variables
- `your-site.netlify.app/vercel-test` - Run connectivity tests
- `your-site.netlify.app/login` - Try the full app

## Alternative: Deploy via CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Deploy
netlify deploy --prod

# Add environment variables
netlify env:set NEXT_PUBLIC_SUPABASE_URL "https://kyldpxoxayemjhxmehkc.supabase.co"
netlify env:set NEXT_PUBLIC_SUPABASE_ANON_KEY "your-key-here"
```

## Why Netlify Might Work Better

1. Different network infrastructure than Vercel
2. Different handling of Next.js SSR
3. Better error messages for debugging
4. No Edge Runtime complications

## If Netlify Also Fails

Then the issue is likely:
1. Supabase project is paused/inactive
2. Supabase URL configuration needs updating
3. CORS/network security on Supabase side

Check Supabase dashboard: https://supabase.com/dashboard/project/kyldpxoxayemjhxmehkc 