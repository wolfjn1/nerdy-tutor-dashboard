import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Ensure cookies work properly on Netlify
        get(name: string) {
          const value = document.cookie
            .split('; ')
            .find(row => row.startsWith(name + '='))
            ?.split('=')[1]
          console.log(`[Supabase] Getting cookie ${name}:`, value ? 'found' : 'not found')
          return value
        },
        set(name: string, value: string, options?: any) {
          console.log(`[Supabase] Setting cookie ${name}`)
          document.cookie = `${name}=${value}; path=/; ${options?.maxAge ? `max-age=${options.maxAge};` : ''}`
        },
        remove(name: string, options?: any) {
          console.log(`[Supabase] Removing cookie ${name}`)
          document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`
        }
      }
    }
  )
} 