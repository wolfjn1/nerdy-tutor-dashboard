# Deploy to Render in 2 Minutes

Since Netlify is having issues, let's use Render - it's simpler and more reliable for Next.js.

## Quick Steps:

1. **Go to**: https://render.com

2. **Sign up/Login** with GitHub

3. **Click**: "New +" → "Web Service"

4. **Connect** your GitHub repository

5. **Configure**:
   - Name: `nerdy-tutor-dashboard`
   - Environment: `Node`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

6. **Add Environment Variables**:
   Click "Environment" tab and add:
   ```
   NEXT_PUBLIC_SUPABASE_URL = https://kyldpxoxayemjhxmehkc.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt5bGRweG94YXllbWpoeG1laGtjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIyNDU1MTEsImV4cCI6MjA2NzgyMTUxMX0.59NvfeFGyNSjmuqtjSKgExEKmWDvRF_dWfEvXOuIfc4
   ```

7. **Click**: "Create Web Service"

## That's it! 🎉

Render will:
- Auto-detect Next.js
- Build your app
- Deploy it globally
- Give you a URL like: `nerdy-tutor-dashboard.onrender.com`

## After Deployment:
Test these URLs:
- `/dashboard-static` - Should work immediately
- `/api/env-check` - Check environment variables
- `/login` - Try the full app

## Why Render is Better for This:
- No function size limits
- Better Next.js support
- Clearer error messages
- Simpler deployment process 