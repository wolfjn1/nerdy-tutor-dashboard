import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        flowType: 'pkce',
        persistSession: true,
        detectSessionInUrl: true,
        storage: {
          getItem: (key: string) => {
            if (typeof window === 'undefined') {
              return null
            }
            // Force cookie reading
            const cookies = document.cookie.split('; ')
            const cookie = cookies.find(c => c.startsWith(`${key}=`))
            if (cookie) {
              return decodeURIComponent(cookie.split('=')[1])
            }
            // Fallback to localStorage for backward compatibility
            return window.localStorage.getItem(key)
          },
          setItem: (key: string, value: string) => {
            if (typeof window === 'undefined') {
              return
            }
            // Set both cookie and localStorage
            const isSecure = window.location.protocol === 'https:'
            const sameSite = isSecure ? 'None' : 'Lax'
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=${sameSite}${isSecure ? '; Secure' : ''}`
            window.localStorage.setItem(key, value)
          },
          removeItem: (key: string) => {
            if (typeof window === 'undefined') {
              return
            }
            // Remove both
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
            window.localStorage.removeItem(key)
          }
        }
      }
    }
  )
} 