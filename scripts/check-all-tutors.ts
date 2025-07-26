import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkAllTutors() {
  console.log('Checking all tutors in database...\n')
  
  // Get all tutors
  const { data: tutors, error } = await supabase
    .from('tutors')
    .select('*')
    
  if (error) {
    console.error('Error fetching tutors:', error)
    return
  }
  
  console.log('Total tutors found:', tutors?.length || 0)
  
  if (tutors && tutors.length > 0) {
    tutors.forEach(tutor => {
      console.log(`\nTutor: ${tutor.first_name} ${tutor.last_name}`)
      console.log(`  Email: ${tutor.email}`)
      console.log(`  ID: ${tutor.id}`)
      console.log(`  Auth User ID: ${tutor.auth_user_id}`)
    })
  }
  
  // Also check if we can get Sarah via auth
  console.log('\n--- Checking via auth user ID ---')
  const { data: authTutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', 'ae70c119-d3e5-470e-8807-16f1b28aba45')
    .single()
    
  if (authTutor) {
    console.log('Found tutor by auth ID:', authTutor.first_name, authTutor.last_name)
  } else {
    console.log('No tutor found with auth ID: ae70c119-d3e5-470e-8807-16f1b28aba45')
  }
}

checkAllTutors().then(() => process.exit(0))
