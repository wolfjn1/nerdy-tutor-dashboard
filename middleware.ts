import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[Middleware] Missing Supabase environment variables')
    // Allow the request to continue but log the error
    return res
  }
  
  // Only log for non-asset requests to reduce noise
  const isAssetRequest = req.nextUrl.pathname.includes('.')
  if (!isAssetRequest && process.env.NODE_ENV === 'development') {
    console.log('[Middleware] Processing request to:', req.nextUrl.pathname)
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const value = req.cookies.get(name)?.value
            return value
          },
          set(name: string, value: string, options: CookieOptions) {
            // Set cookie on both request and response
            req.cookies.set({
              name,
              value,
              ...options,
            })
            res.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: CookieOptions) {
            // Remove cookie from both request and response
            req.cookies.set({
              name,
              value: '',
              ...options,
            })
            res.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    // Note: We use getSession() here instead of getUser() because:
    // 1. Middleware needs to be fast and shouldn't make external API calls
    // 2. getUser() makes a network request to Supabase Auth server
    // 3. For middleware auth checks, getSession() is sufficient
    // The warning about getSession() is more relevant for data fetching where authenticity is critical
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (!isAssetRequest && process.env.NODE_ENV === 'development') {
      console.log('[Middleware] Session check:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        pathname: req.nextUrl.pathname,
        error 
      })
    }

    // List of public routes that don't require authentication
    const publicRoutes = [
      '/login', 
      '/register', 
      '/forgot-password', 
      '/reset-password', 
      '/env-check', 
      '/api/env-check', 
      '/test-auth',
      '/test-xp', 
      '/status', 
      '/api/check-env', 
      '/api/debug-auth',
      '/test',
      '/test-supabase',
      '/api/test-supabase',
      '/env-test',
      '/force-logout',
      '/clear-session',
      '/no-auth-test',
      '/simple-supabase-test',
      '/clear-all',
      '/auth-test',
      '/auth-status',
      '/final-test',
      '/api/test-auth',
      '/api/force-logout',
      '/simple-test',
      '/no-auth-dashboard',
      '/debug-auth',
      '/dashboard-static',
      '/vercel-test'
    ]
    const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))
    
    // Allow bypass for debugging
    const bypassAuth = req.nextUrl.searchParams.get('bypass') === 'true'

    // If user is not authenticated and trying to access protected route
    if (!session && !isPublicRoute && req.nextUrl.pathname !== '/' && !bypassAuth) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/login'
      redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is authenticated and trying to access auth pages
    if (session && isPublicRoute && !bypassAuth) {
      // Don't redirect if it's an API route or debug route
      const debugRoutes = ['/test', '/test-auth', '/test-supabase', '/status', '/env-test', '/force-logout']
      const isDebugRoute = debugRoutes.some(route => req.nextUrl.pathname.startsWith(route))
      if (!isDebugRoute && !req.nextUrl.pathname.startsWith('/api')) {
        const redirectUrl = req.nextUrl.clone()
        redirectUrl.pathname = '/dashboard'
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If user is authenticated and accessing root, redirect to dashboard
    if (session && req.nextUrl.pathname === '/' && !bypassAuth) {
      const redirectUrl = req.nextUrl.clone()
      redirectUrl.pathname = '/dashboard'
      return NextResponse.redirect(redirectUrl)
    }
  } catch (error) {
    console.error('[Middleware] Error:', error)
    // Continue without auth check if there's an error
  }

  return res
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
} 