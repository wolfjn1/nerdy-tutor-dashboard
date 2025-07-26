import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // Use default cookie handling from @supabase/ssr
  // It properly handles browser vs server environments
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 