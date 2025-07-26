import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        storage: {
          getItem: (key: string) => {
            if (typeof document === 'undefined') return null
            const cookies = document.cookie.split('; ')
            const cookie = cookies.find(c => c.startsWith(`${key}=`))
            const value = cookie ? decodeURIComponent(cookie.split('=')[1]) : null
            console.log(`[Storage] Getting ${key}:`, value ? 'found' : 'not found')
            return value
          },
          setItem: (key: string, value: string) => {
            if (typeof document === 'undefined') return
            console.log(`[Storage] Setting ${key} as cookie`)
            const isSecure = window.location.protocol === 'https:'
            document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
          },
          removeItem: (key: string) => {
            if (typeof document === 'undefined') return
            console.log(`[Storage] Removing ${key}`)
            document.cookie = `${key}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
          }
        }
      },
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') {
            return ''
          }
          const cookie = document.cookie
            .split('; ')
            .find((row) => row.startsWith(`${name}=`))
          return cookie ? decodeURIComponent(cookie.split('=')[1]) : ''
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') {
            return
          }
          let cookieString = `${name}=${encodeURIComponent(value)}; path=/; SameSite=Lax`
          
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