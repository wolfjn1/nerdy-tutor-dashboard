import { createBrowserClient } from '@supabase/ssr'

// Simple client creation with no customization
export function createSimpleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) {
    console.error('[Supabase] Missing environment variables')
    throw new Error('Missing Supabase environment variables')
  }
  
  console.log('[Supabase] Creating simple client for:', url.split('.')[0])
  
  return createBrowserClient(url, key)
} 