import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkAuthUserIds() {
  console.log('Checking auth_user_id mappings...\n')
  
  // Get all auth users
  const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
  
  if (usersError) {
    console.error('Error fetching auth users:', usersError)
    return
  }
  
  console.log(`Found ${users.length} auth users\n`)
  
  // Check each user
  for (const authUser of users) {
    console.log(`\nAuth User: ${authUser.email}`)
    console.log(`  ID: ${authUser.id}`)
    
    // Find corresponding tutor
    const { data: tutorByAuthId, error: error1 } = await supabase
      .from('tutors')
      .select('*')
      .eq('auth_user_id', authUser.id)
      .single()
      
    const { data: tutorByEmail, error: error2 } = await supabase
      .from('tutors')
      .select('*')
      .eq('email', authUser.email)
      .single()
      
    if (tutorByAuthId) {
      console.log(`  ✓ Found tutor by auth_user_id: ${tutorByAuthId.first_name} ${tutorByAuthId.last_name}`)
    } else if (tutorByEmail) {
      console.log(`  ⚠️  Found tutor by email but not auth_user_id!`)
      console.log(`     Tutor ID: ${tutorByEmail.id}`)
      console.log(`     Tutor auth_user_id: ${tutorByEmail.auth_user_id || 'NULL'}`)
      console.log(`     Should be: ${authUser.id}`)
      
      // Ask to fix
      if (process.argv.includes('--fix')) {
        const { error: updateError } = await supabase
          .from('tutors')
          .update({ auth_user_id: authUser.id })
          .eq('id', tutorByEmail.id)
          
        if (updateError) {
          console.log(`     ❌ Failed to update: ${updateError.message}`)
        } else {
          console.log(`     ✅ Updated auth_user_id to ${authUser.id}`)
        }
      } else {
        console.log(`     → Run with --fix to update`)
      }
    } else {
      console.log(`  ❌ No tutor found for this auth user`)
    }
  }
  
  console.log('\n\nChecking for orphaned tutors...\n')
  
  // Check for tutors without valid auth users
  const { data: allTutors } = await supabase
    .from('tutors')
    .select('*')
    
  for (const tutor of allTutors || []) {
    const authUser = users.find(u => u.id === tutor.auth_user_id)
    if (!authUser) {
      console.log(`⚠️  Tutor ${tutor.first_name} ${tutor.last_name} (${tutor.email}) has invalid auth_user_id: ${tutor.auth_user_id}`)
      
      // Try to find by email
      const authUserByEmail = users.find(u => u.email === tutor.email)
      if (authUserByEmail) {
        console.log(`   Found matching auth user by email: ${authUserByEmail.id}`)
        
        if (process.argv.includes('--fix')) {
          const { error: updateError } = await supabase
            .from('tutors')
            .update({ auth_user_id: authUserByEmail.id })
            .eq('id', tutor.id)
            
          if (updateError) {
            console.log(`   ❌ Failed to update: ${updateError.message}`)
          } else {
            console.log(`   ✅ Updated auth_user_id to ${authUserByEmail.id}`)
          }
        }
      }
    }
  }
  
  console.log('\n\nDone!')
}

checkAuthUserIds().catch(console.error) 