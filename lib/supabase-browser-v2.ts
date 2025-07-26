import { createBrowserClient } from '@supabase/ssr'

// Version 2 - New file to force cache bust
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    throw new Error('[Supabase] Missing environment variables')
  }
  
  // Log to help debug
  console.log('[Supabase] Creating browser client v2')
  
  return createBrowserClient(url, key)
} 