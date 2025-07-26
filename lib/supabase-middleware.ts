import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export function createMiddlewareClient(request: NextRequest) {
  // Create a response we can modify
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
          // Set the cookie on the request
          request.cookies.set({
            name,
            value,
            ...options,
          })
          // Update the response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Set the cookie on the response
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          // Remove the cookie from the request
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          // Update the response
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          // Remove the cookie from the response
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  return { supabase, response }
} 