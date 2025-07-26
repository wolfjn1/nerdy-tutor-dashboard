import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          if (typeof document === 'undefined') {
            return undefined
          }
          
          const cookies = document.cookie.split('; ')
          const cookie = cookies.find(c => c.startsWith(`${name}=`))
          
          if (cookie) {
            return decodeURIComponent(cookie.split('=')[1])
          }
          
          return undefined
        },
        set(name: string, value: string, options?: any) {
          if (typeof document === 'undefined') {
            return
          }
          
          let cookieStr = `${name}=${encodeURIComponent(value)}`
          
          if (options?.maxAge) {
            cookieStr += `; Max-Age=${options.maxAge}`
          }
          if (options?.path) {
            cookieStr += `; Path=${options.path}`
          }
          if (options?.domain) {
            cookieStr += `; Domain=${options.domain}`
          }
          if (options?.sameSite) {
            cookieStr += `; SameSite=${options.sameSite}`
          }
          if (options?.secure) {
            cookieStr += `; Secure`
          }
          
          document.cookie = cookieStr
        },
        remove(name: string, options?: any) {
          if (typeof document === 'undefined') {
            return
          }
          
          let cookieStr = `${name}=; Max-Age=0`
          
          if (options?.path) {
            cookieStr += `; Path=${options.path}`
          }
          if (options?.domain) {
            cookieStr += `; Domain=${options.domain}`
          }
          
          document.cookie = cookieStr
        }
      }
    }
  )
} 