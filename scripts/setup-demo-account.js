const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Need service role key to create users
)

async function setupDemoAccount() {
  console.log('Setting up demo account...')
  
  try {
    // First, check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail('sarah_chen@hotmail.com')
    
    if (existingUser) {
      console.log('Demo user already exists, updating password...')
      // Update the password
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existingUser.id,
        { password: 'demo123' }
      )
      
      if (updateError) {
        console.error('Error updating password:', updateError)
        return
      }
      
      console.log('Password updated successfully!')
    } else {
      console.log('Creating new demo user...')
      // Create the user
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: 'sarah_chen@hotmail.com',
        password: 'demo123',
        email_confirm: true,
        user_metadata: {
          full_name: 'Sarah Chen'
        }
      })
      
      if (createError) {
        console.error('Error creating user:', createError)
        return
      }
      
      console.log('Demo user created successfully!')
      console.log('User ID:', newUser.user.id)
    }
    
    // Check if Sarah Chen's tutor profile exists
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .eq('email', 'sarah_chen@hotmail.com')
      .single()
    
    if (tutorError && tutorError.code === 'PGRST116') {
      console.log('No tutor profile found for Sarah Chen')
      console.log('Please ensure the tutor profile exists in the database')
    } else if (tutor) {
      console.log('Tutor profile found:', tutor.id)
      console.log('Auth user should be linked to this tutor')
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

setupDemoAccount() 