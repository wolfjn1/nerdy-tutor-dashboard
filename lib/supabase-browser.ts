import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('[Supabase Client] Creating client with URL:', supabaseUrl?.substring(0, 30) + '...')
  console.log('[Supabase Client] Has Anon Key:', !!supabaseKey)
  
  if (!supabaseUrl || !supabaseKey) {
    const error = new Error(
      `Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`
    )
    console.error('[Supabase Client] Error:', error)
    throw error
  }
  
  // Only create a new instance if one doesn't exist
  if (!supabaseInstance) {
    try {
      supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey)
      console.log('[Supabase Client] Client created successfully')
    } catch (error) {
      console.error('[Supabase Client] Failed to create client:', error)
      throw error
    }
  }
  
  return supabaseInstance
} 