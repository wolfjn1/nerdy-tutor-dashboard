# Vercel Redeployment Plan

Since the app works perfectly locally but hangs on Vercel, we need a different approach.

## Option 1: Complete Fresh Start (Recommended)

1. **Delete the current Vercel project completely**
2. **Create a new Vercel project from scratch**
3. **Deploy in stages:**
   - First: Deploy with NO Supabase (static pages only)
   - Second: Add environment variables
   - Third: Test Supabase connectivity
   - Fourth: Add authentication

### Steps:

1. **Go to Vercel Dashboard**
   - Settings → General → Delete Project

2. **Create New Project**
   ```bash
   # Install Vercel CLI if not installed
   npm i -g vercel
   
   # Deploy without linking to GitHub first
   vercel
   ```

3. **When prompted:**
   - Set up and deploy: Yes
   - Which scope: Your personal account
   - Link to existing project: No
   - Project name: nerdy-tutor-dashboard-v2
   - Directory: ./
   - Override settings: No

4. **After initial deployment works, add env vars:**
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

## Option 2: Test Minimal Version First

Before redeploying, test these URLs on current deployment:

1. `/dashboard-static` - Completely static, no Supabase
2. `/vercel-test` - Network connectivity tests
3. `/api/env-check` - Environment variable check

## Option 3: Deploy Different Branch

1. Create a new branch with minimal code:
   ```bash
   git checkout -b vercel-minimal
   ```

2. Remove all Supabase dependencies temporarily
3. Deploy this branch to Vercel
4. Gradually add features back

## Likely Issues:

1. **Supabase SDK incompatibility with Vercel Edge Runtime**
   - Solution: Use Node.js runtime instead of Edge

2. **Network timeout/firewall on Vercel's side**
   - Solution: Contact Vercel support with project details

3. **Build-time vs Runtime environment variables**
   - Solution: Ensure variables are available at build time

4. **Region mismatch between Vercel and Supabase**
   - Solution: Deploy Vercel to same region as Supabase (US East)

## Emergency Workaround:

If nothing else works, create a simple proxy API:

```typescript
// app/api/supabase-proxy/[...path]/route.ts
export async function GET(request: Request) {
  // Proxy requests to Supabase with proper error handling
}
```

This would bypass any SDK issues and give us direct control over the requests. 