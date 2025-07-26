import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Only log for non-asset requests to reduce noise
  const isAssetRequest = req.nextUrl.pathname.includes('.')
  if (!isAssetRequest) {
    console.log('[Middleware] Processing request to:', req.nextUrl.pathname)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const value = req.cookies.get(name)?.value
          // Remove verbose cookie logging to reduce console noise
          return value
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
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
  
  if (!isAssetRequest) {
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
    '/test-xp', 
    '/test-cookies', 
    '/force-refresh', 
    '/logout',
    '/test-login',
    '/test-login-detailed',
    '/test-login-timeout',
    '/test-storage',
    '/test-init',
    '/fix-session',
    '/test-auth',
    '/simple-dashboard',
    '/server-dashboard',
    '/test-basic-login',
    '/test-direct-auth',
    '/test-auth-comparison'
  ]
  const isPublicRoute = publicRoutes.some(route => req.nextUrl.pathname.startsWith(route))

  // If user is not authenticated and trying to access protected route
  if (!session && !isPublicRoute && req.nextUrl.pathname !== '/') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirect', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages (but not test pages)
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPages.some(route => req.nextUrl.pathname === route)
  
  if (session && isAuthPage) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and accessing root, redirect to dashboard
  if (session && req.nextUrl.pathname === '/') {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/dashboard'
    return NextResponse.redirect(redirectUrl)
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