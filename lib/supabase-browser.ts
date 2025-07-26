import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use default browser client for now to avoid SSR issues
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 