import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') {
            return ''
          }
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? cookie.split('=')[1] : ''
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') {
            return
          }
          let cookieString = `${name}=${value}; path=/; SameSite=Lax`
          
          if (options?.maxAge) {
            cookieString += `; max-age=${options.maxAge}`
          }
          
          // Ensure secure flag on HTTPS
          if (window.location.protocol === 'https:') {
            cookieString += '; Secure'
          }
          
          document.cookie = cookieString
        },
        remove(name: string) {
          if (typeof document === 'undefined') {
            return
          }
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        },
      },
    }
  )
} 