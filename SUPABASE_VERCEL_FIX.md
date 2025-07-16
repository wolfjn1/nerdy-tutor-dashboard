# Fix Supabase Authentication on Vercel

The environment variables are set correctly (confirmed by `/api/env-check`), but authentication is failing because Supabase needs to allow your Vercel domain.

## Steps to Fix:

### 1. Add Vercel URL to Supabase

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/kyldpxoxayemjhxmehkc
2. **Navigate to**: Authentication → URL Configuration
3. **Add your Vercel URLs to**:
   - **Site URL**: `https://nerdy-tutor-dashboard.vercel.app`
   - **Redirect URLs**: Add all of these:
     ```
     https://nerdy-tutor-dashboard.vercel.app/**
     https://nerdy-tutor-dashboard.vercel.app
     https://nerdy-tutor-dashboard.vercel.app/dashboard
     https://nerdy-tutor-dashboard.vercel.app/login
     https://*.vercel.app/**
     ```

### 2. Update CORS Settings (if needed)

In Supabase Dashboard:
1. Go to Settings → API
2. Add your Vercel domain to CORS allowed origins

### 3. Clear Browser Data

After updating Supabase settings:
1. Clear all cookies for your Vercel app
2. Clear browser cache
3. Try in an incognito/private window

### 4. Test Authentication

1. Go to: https://nerdy-tutor-dashboard.vercel.app/test-auth (not /api/test-auth)
2. Click "Test Login" to verify authentication works
3. Once that works, try the main login

## Why This Happens

- Supabase blocks authentication from domains not in its allow list
- This is a security feature to prevent unauthorized domains from using your auth
- Local development works because `localhost` is allowed by default

## Alternative Quick Test

Add `?bypass=true` to skip auth temporarily:
- https://nerdy-tutor-dashboard.vercel.app/dashboard?bypass=true

This will let you see if the app works once auth is bypassed. 