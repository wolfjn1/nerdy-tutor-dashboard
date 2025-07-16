import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Check for required environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    const error = new Error(
      `Missing Supabase environment variables. URL: ${!!supabaseUrl}, Key: ${!!supabaseKey}`
    )
    throw error
  }
  
  // Only create a new instance if one doesn't exist
  if (!supabaseInstance) {
    try {
      supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey)
    } catch (error) {
      throw error
    }
  }
  
  return supabaseInstance
} 