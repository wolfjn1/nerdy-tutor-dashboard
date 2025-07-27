# Debugging Authentication Issues in Production

## Problem Summary
You're experiencing authentication failures on the onboarding page in production (Netlify):
- 500 error during auth initialization
- 401 errors when calling API endpoints
- "You must be logged in to complete onboarding steps" message

## Common Causes & Solutions

### 1. Environment Variables
**Most likely cause**: Supabase environment variables not set correctly in Netlify

**Check these in Netlify Dashboard → Site Settings → Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Important**: These MUST match your Supabase project settings exactly.

### 2. Cookie/Session Issues
The auth session might not be persisting due to:
- Domain mismatch between your app and Supabase
- Secure cookie settings in production
- SameSite cookie restrictions

**Solution**: Check your Supabase Auth settings:
1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Ensure "Site URL" matches your production URL: `https://nerdy-tutor-dashboard.netlify.app`
3. Add your Netlify domain to "Redirect URLs"

### 3. Middleware Configuration
Your middleware is skipping API routes, which means they need to handle auth independently.

**Current middleware.ts:**
```typescript
// Skip middleware for API routes to ensure they work
if (request.nextUrl.pathname.startsWith('/api/')) {
  return NextResponse.next()
}
```

This is correct, but ensure your API routes are properly using the server-side Supabase client.

### 4. Debugging Steps

#### Step 1: Verify Environment Variables
In your Netlify dashboard, check that all required environment variables are set:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Any other Supabase-related variables

#### Step 2: Test Authentication Flow
1. Clear all cookies for your domain
2. Navigate to `/login`
3. Try logging in
4. Check browser DevTools → Application → Cookies for:
   - `sb-access-token`
   - `sb-refresh-token`

#### Step 3: Check Supabase Logs
Go to Supabase Dashboard → Logs → Auth to see authentication attempts and errors.

#### Step 4: Add Debug Logging
Temporarily add logging to help diagnose:

```typescript
// In app/api/onboarding/complete-step/route.ts
export async function POST(request: NextRequest) {
  console.log('[API] Complete step called')
  
  try {
    const supabase = await createClient()
    console.log('[API] Supabase client created')
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[API] Auth check:', { user: user?.id, error: authError })
    
    // ... rest of the code
```

### 5. Quick Fixes to Try

#### Fix 1: Update Supabase Client Creation
Ensure your `/utils/supabase/server.ts` is creating the client correctly for the server environment:

```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export const createClient = () => {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie errors in production
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle cookie errors in production
          }
        },
      },
    }
  )
}
```

#### Fix 2: Add CORS Headers (if needed)
If you're experiencing CORS issues, add headers to your API routes:

```typescript
// In your API route
const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// For OPTIONS requests (preflight)
if (request.method === 'OPTIONS') {
  return new Response(null, { status: 200, headers })
}

// Add headers to your response
return NextResponse.json(data, { status: 200, headers })
```

### 6. Temporary Workaround
While debugging, you can add a bypass for testing:

```typescript
// In app/onboarding/page.tsx (REMOVE IN PRODUCTION)
export default async function OnboardingPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // Temporary: Log the error for debugging
  if (userError) {
    console.error('[Onboarding Page] Auth error:', userError)
  }
  
  if (userError || !user) {
    // For debugging: show error details
    return (
      <div className="min-h-screen p-8">
        <Card className="max-w-2xl mx-auto p-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">
            Unable to authenticate. Please check your login status.
          </p>
          <details className="mb-4">
            <summary className="cursor-pointer text-sm text-muted-foreground">
              Debug Info
            </summary>
            <pre className="mt-2 text-xs bg-muted p-2 rounded">
              {JSON.stringify({ error: userError?.message || 'No user found' }, null, 2)}
            </pre>
          </details>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </Card>
      </div>
    )
  }
  
  // ... rest of the component
}
```

### 7. Deployment Checklist
Before deploying fixes:
- [ ] Environment variables set in Netlify
- [ ] Supabase URL configuration updated
- [ ] Build command: `npm run build` or `yarn build`
- [ ] Node version specified in Netlify (if needed)
- [ ] Clear Netlify cache and redeploy

### 8. Contact Support
If issues persist:
1. Check Supabase Status: https://status.supabase.com
2. Netlify Support for deployment issues
3. Supabase Support for auth issues

## Next Steps
1. Start with checking environment variables
2. Verify Supabase auth settings
3. Add debug logging
4. Test the authentication flow step by step 