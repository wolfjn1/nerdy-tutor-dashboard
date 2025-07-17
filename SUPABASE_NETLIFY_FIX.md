# Fix Supabase Authentication on Netlify

## The Problem
Your app is deployed but Supabase is blocking authentication from your Netlify domain.

## Quick Fix (2 minutes):

### 1. Add Netlify URL to Supabase

1. **Go to your Supabase Dashboard**: 
   https://supabase.com/dashboard/project/kyldpxoxayemjhxmehkc/auth/url-configuration

2. **Update Site URL**:
   - Change from `http://localhost:3000` to your Netlify URL
   - Example: `https://nerdy-tutor-dashboard.netlify.app`

3. **Add to Redirect URLs** (add ALL of these):
   ```
   https://nerdy-tutor-dashboard.netlify.app/**
   https://nerdy-tutor-dashboard.netlify.app
   https://nerdy-tutor-dashboard.netlify.app/dashboard
   https://nerdy-tutor-dashboard.netlify.app/login
   https://*.netlify.app/**
   http://localhost:3000/**
   http://localhost:3001/**
   http://localhost:3002/**
   ```

4. **Save Changes**

### 2. Clear Your Browser Data

1. Clear cookies for your Netlify app
2. Try in an incognito/private window
3. Login again with demo account

### 3. Test Authentication

1. Go to: `https://your-app.netlify.app/test-auth`
2. Click "Test Login"
3. Should show successful authentication

## Why This Happens

- Supabase blocks authentication from domains not in its allow list
- This is a security feature
- Each deployment platform needs to be explicitly allowed

## If Still Having Issues

Check these URLs on your deployed app:
- `/api/env-check` - Verify environment variables are set
- `/debug-auth` - See detailed auth status
- `/clear-session` - Clear any stuck sessions

## Alternative: Update Redirect URL in Code

If the redirect still doesn't work, we can update the login redirect URL in the code to use a full URL instead of relative path. 