import { createClient } from '@supabase/supabase-js'

// Initialize Supabase Admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function addAuthToTutors() {
  console.log('🔐 Adding authentication to test tutors...')
  
  try {
    // Fetch all tutors
    const { data: tutors, error: fetchError } = await supabase
      .from('tutors')
      .select('id, email, first_name, last_name')
      .order('created_at', { ascending: true })
    
    if (fetchError) throw fetchError
    
    if (!tutors || tutors.length === 0) {
      console.log('No tutors found. Please run the seed script first.')
      return
    }
    
    console.log(`Found ${tutors.length} tutors to add authentication for.`)
    
    // Default password for all test users
    const defaultPassword = 'demo123'
    
    for (const tutor of tutors) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: tutor.email,
          password: defaultPassword,
          email_confirm: true, // Auto-confirm email
          user_metadata: {
            first_name: tutor.first_name,
            last_name: tutor.last_name
          }
        })
        
        if (authError) {
          if (authError.message.includes('already registered')) {
            console.log(`⚠️  Auth already exists for ${tutor.email}`)
            
            // Get the existing auth user
            const { data: { users }, error: listError } = await supabase.auth.admin.listUsers()
            if (listError) throw listError
            
            const existingUser = users.find(u => u.email === tutor.email)
            if (existingUser) {
              // Update the tutor with the auth_user_id
              const { error: updateError } = await supabase
                .from('tutors')
                .update({ auth_user_id: existingUser.id })
                .eq('id', tutor.id)
              
              if (updateError) throw updateError
              console.log(`✅ Linked existing auth for ${tutor.email}`)
            }
          } else {
            throw authError
          }
        } else if (authData.user) {
          // Update the tutor with the auth_user_id
          const { error: updateError } = await supabase
            .from('tutors')
            .update({ auth_user_id: authData.user.id })
            .eq('id', tutor.id)
          
          if (updateError) throw updateError
          
          console.log(`✅ Created auth for ${tutor.email} (password: ${defaultPassword})`)
        }
      } catch (error) {
        console.error(`❌ Error processing ${tutor.email}:`, error)
      }
    }
    
    console.log('\n🎉 Authentication setup complete!')
    console.log('\n📝 Test Accounts:')
    console.log('─────────────────────────────────────────────')
    console.log('Email                          | Password')
    console.log('─────────────────────────────────────────────')
    tutors.slice(0, 5).forEach(tutor => {
      console.log(`${tutor.email.padEnd(30)} | ${defaultPassword}`)
    })
    console.log('─────────────────────────────────────────────')
    console.log(`\nAll ${tutors.length} tutors use password: ${defaultPassword}`)
    
  } catch (error) {
    console.error('❌ Error adding authentication:', error)
    process.exit(1)
  }
}

// Run the script
addAuthToTutors() 