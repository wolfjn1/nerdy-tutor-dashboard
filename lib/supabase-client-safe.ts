import { createBrowserClient } from '@supabase/ssr'

let supabaseClient: ReturnType<typeof createBrowserClient> | null = null

export function createClientSafe() {
  // Only create client in browser environment
  if (typeof window === 'undefined') {
    throw new Error('createClientSafe can only be used in browser environment')
  }
  
  // Singleton pattern to reuse client
  if (!supabaseClient) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!url || !key) {
      throw new Error('Missing Supabase environment variables')
    }
    
    try {
      supabaseClient = createBrowserClient(url, key)
      console.log('[Supabase] Client created successfully')
    } catch (error) {
      console.error('[Supabase] Failed to create client:', error)
      throw error
    }
  }
  
  return supabaseClient
} 