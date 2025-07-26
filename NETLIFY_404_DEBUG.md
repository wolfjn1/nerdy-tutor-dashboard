# Netlify 404 Debug Guide

## Test URLs After Deployment

Try these URLs on your Netlify deployment:

### 1. Static Files (Should Always Work)
- `/test.html` - Raw HTML file
- `/deploy-info.json` - JSON file with deployment info

### 2. Simple API Route
- `/api/test` - Simplest possible API route

### 3. Debug Routes
- `/api/debug-env` - Environment debug info
- `/api/check-data` - Database connection test

### 4. Simple Page
- `/test-simple` - Basic Next.js page

## If Everything Returns 404

This indicates a fundamental build/deployment issue:

### 1. Check Build Logs
In Netlify Dashboard → Deploys → Click latest deploy → "Deploy log"
Look for:
- Build errors
- Missing dependencies
- "Page not found" warnings

### 2. Check Deploy Settings
In Netlify Dashboard → Site settings → Build & deploy:
- **Build command**: Should be `npm run build`
- **Publish directory**: Should be `.next` (not `out` or `build`)
- **Functions directory**: Should be auto-detected

### 3. Verify Next.js Version
```json
// package.json should have:
"next": "^14.0.0" // or higher for App Router support
```

### 4. Check if Using Edge Functions
The error might be due to Edge Function configuration. Try:
1. Remove `NEXT_USE_NETLIFY_EDGE = "true"` from netlify.toml
2. Redeploy

## Common Causes of 404s on Netlify

1. **Wrong publish directory** - Next.js uses `.next`, not `out`
2. **Missing @netlify/plugin-nextjs** - Required for Next.js apps
3. **Build not completing** - Check logs for errors
4. **Middleware blocking routes** - Our fix should help
5. **App Router not supported** - Older Netlify plugin versions

## Emergency Fix

If nothing works, try this minimal netlify.toml:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

Then clear cache and deploy.

## What Changed

1. ✅ Simplified netlify.toml configuration
2. ✅ Added middleware skip for API routes
3. ✅ Created test endpoints at multiple paths
4. ✅ Updated next.config.js

## Next Steps

1. Check if `/test.html` works (proves static serving works)
2. Check if `/api/test` works (proves API routes work)
3. Check build logs for any errors
4. Verify environment variables are set in Netlify 