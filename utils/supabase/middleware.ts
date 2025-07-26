import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // This will refresh the session if expired - required for Server Components
  const { data: { user } } = await supabase.auth.getUser()

  // Custom logic for auth redirects
  const publicRoutes = [
    '/login', 
    '/register', 
    '/forgot-password', 
    '/reset-password',
    '/test-cookie-config',
    // Add other public routes as needed
  ]
  
  const isPublicRoute = publicRoutes.some(route => request.nextUrl.pathname.startsWith(route))
  const isRootPath = request.nextUrl.pathname === '/'

  // Redirect to login if accessing protected route without auth
  if (!user && !isPublicRoute && !isRootPath) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Redirect to dashboard if authenticated user accesses auth pages
  const authPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isAuthPage = authPages.some(route => request.nextUrl.pathname === route)
  
  if (user && (isAuthPage || isRootPath)) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
} 