import { createBrowserClient } from '@supabase/ssr'

// Clean implementation - no custom cookie handling
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('[Supabase] Missing environment variables')
  }
  
  // Log to help debug
  console.log('[Supabase] Creating browser client - clean implementation')
  
  return createBrowserClient(url, key)
} 