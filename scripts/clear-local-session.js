const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function clearSession() {
  console.log('Clearing local session...')
  
  try {
    // Sign out the current user
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Error signing out:', error)
    } else {
      console.log('✅ Session cleared successfully!')
      console.log('\nYou can now:')
      console.log('1. Go to http://localhost:3002/login')
      console.log('2. Use the demo account or create a new account')
    }
  } catch (error) {
    console.error('Error:', error)
  }
}

clearSession() 