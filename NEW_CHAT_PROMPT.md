# Prompt for New Chat: Fix Netlify Authentication Issue

I need help fixing an authentication issue with my Next.js application deployed on Netlify. The app works perfectly locally but fails on Netlify.

## The Problem
1. **Login hangs**: When logging in with demo credentials (sarah_chen@hotmail.com / demo123), the button shows "Signing in..." forever
2. **Dashboard shows wrong data**: Even if login succeeds, it shows "John Doe" instead of Sarah Chen's data
3. **Console error**: `ReferenceError: document is not defined at lib/supabase-browser.ts:11`

## Critical Discovery
A static HTML test page (https://nerdy-tutor-dashboard.netlify.app/test-auth-static.html) proves authentication WORKS on Netlify:
- ✅ Direct fetch API to Supabase auth: SUCCESS
- ✅ Supabase SDK from CDN: SUCCESS
- ✅ Returns valid tokens for sarah_chen@hotmail.com

This proves the issue is NOT:
- Network/firewall blocking
- Wrong credentials
- Supabase configuration
- Database issues

## The Real Issue
Netlify is using a CACHED version of `lib/supabase-browser.ts`:
- Current file has 5 lines
- Error references line 11 (which doesn't exist)
- The cached version has custom cookie code causing SSR errors

## Current State
```typescript
// lib/supabase-browser.ts (current - 5 lines)
import { createClient } from './supabase-browser-v2'
export { createClient }
export default createClient

// lib/supabase-browser-v2.ts (new file to bypass cache)
import { createBrowserClient } from '@supabase/ssr'
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    throw new Error('[Supabase] Missing environment variables')
  }
  console.log('[Supabase] Creating browser client v2')
  return createBrowserClient(url, key)
}
```

## What I Need
1. Force Netlify to use the new files (clear cache?)
2. Or find an alternative approach that bypasses the client-side auth entirely
3. Make sarah_chen@hotmail.com login work and show correct dashboard data

## Resources
- GitHub: https://github.com/wolfjn1/nerdy-tutor-dashboard
- Live site: https://nerdy-tutor-dashboard.netlify.app
- Working test: https://nerdy-tutor-dashboard.netlify.app/test-auth-static.html
- Full history: See AUTHENTICATION_ISSUE_SUMMARY.md in the repo

The static test PROVES auth works - we just need to fix the Next.js/Netlify integration! 