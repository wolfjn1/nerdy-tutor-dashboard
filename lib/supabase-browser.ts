// Re-export from v2 to fix cache issues
import { createClient } from './supabase-browser-v2'

export { createClient }
export default createClient 