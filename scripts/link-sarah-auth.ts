import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function linkSarahAuth() {
  console.log('Linking Sarah Chen to auth account...\n')
  
  // Find the Sarah Chen tutor
  const { data: sarah, error: findError } = await supabase
    .from('tutors')
    .select('*')
    .eq('email', 'sarah_chen9@yahoo.com')
    .single()
    
  if (findError || !sarah) {
    console.error('Error finding Sarah:', findError)
    return
  }
  
  console.log('Found Sarah Chen:', sarah.id)
  console.log('Current email:', sarah.email)
  console.log('Current auth_user_id:', sarah.auth_user_id)
  
  // Update Sarah to use the correct auth credentials
  const { error: updateError } = await supabase
    .from('tutors')
    .update({
      email: 'sarah_chen@hotmail.com',
      auth_user_id: 'ae70c119-d3e5-470e-8807-16f1b28aba45'
    })
    .eq('id', sarah.id)
    
  if (updateError) {
    console.error('Error updating Sarah:', updateError)
    return
  }
  
  console.log('\n✅ Successfully linked Sarah Chen to your auth account!')
  console.log('   Email updated: sarah_chen9@yahoo.com → sarah_chen@hotmail.com')
  console.log('   Auth ID linked: ae70c119-d3e5-470e-8807-16f1b28aba45')
  
  // Verify the update
  const { data: updated } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', 'ae70c119-d3e5-470e-8807-16f1b28aba45')
    .single()
    
  if (updated) {
    console.log('\n✅ Verification successful!')
    console.log(`   Tutor: ${updated.first_name} ${updated.last_name}`)
    console.log(`   Email: ${updated.email}`)
    console.log(`   ID: ${updated.id}`)
    
    // Count her students and sessions
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_id', updated.id)
      
    const { count: sessionCount } = await supabase
      .from('sessions')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_id', updated.id)
      
    console.log(`\n📊 Sarah's data:`)
    console.log(`   Students: ${studentCount}`)
    console.log(`   Sessions: ${sessionCount}`)
  }
}

linkSarahAuth().then(() => process.exit(0))
