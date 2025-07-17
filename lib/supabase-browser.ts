import { createBrowserClient } from '@supabase/ssr'

// Create a singleton instance
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // In the browser, Next.js replaces process.env at build time
  // These values are injected during the build process
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Only create a new instance if one doesn't exist
  if (!supabaseInstance) {
    try {
      supabaseInstance = createBrowserClient(supabaseUrl, supabaseKey)
    } catch (error) {
      console.error('[Supabase] Error creating client:', error)
      throw error
    }
  }
  
  return supabaseInstance
} 