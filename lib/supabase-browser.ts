import { createBrowserClient } from '@supabase/ssr'

// Browser client with proper cookie handling for Netlify
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('[Supabase] Missing environment variables')
  }
  
  console.log('[Supabase] Creating browser client with Netlify-compatible cookie config')
  
  return createBrowserClient(url, key, {
    cookies: {
      get(name: string) {
        if (typeof document === 'undefined') return null
        const value = document.cookie
          .split('; ')
          .find(row => row.startsWith(name + '='))
          ?.split('=')[1]
        return decodeURIComponent(value || '')
      },
      set(name: string, value: string, options?: any) {
        if (typeof document === 'undefined') return
        const cookieOptions = {
          path: '/',
          secure: true,
          sameSite: 'lax',
          maxAge: 60 * 60 * 24 * 365, // 1 year
          ...options
        }
        
        const cookieString = `${name}=${encodeURIComponent(value)}; path=${cookieOptions.path}; max-age=${cookieOptions.maxAge}; SameSite=${cookieOptions.sameSite}${cookieOptions.secure ? '; Secure' : ''}`
        document.cookie = cookieString
      },
      remove(name: string, options?: any) {
        if (typeof document === 'undefined') return
        document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
      }
    }
  })
} 