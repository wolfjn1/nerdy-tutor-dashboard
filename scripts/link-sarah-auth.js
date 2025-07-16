const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function linkSarahAuth() {
  console.log('Checking Sarah Chen tutor profile...')
  
  try {
    // First, find Sarah Chen's tutor profile
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .eq('email', 'sarah_chen@hotmail.com')
      .single()
    
    if (tutorError) {
      console.error('Error finding tutor:', tutorError)
      return
    }
    
    if (!tutor) {
      console.log('No tutor profile found for sarah_chen@hotmail.com')
      return
    }
    
    console.log('Found tutor profile:', {
      id: tutor.id,
      name: `${tutor.first_name} ${tutor.last_name}`,
      email: tutor.email,
      auth_user_id: tutor.auth_user_id
    })
    
    if (tutor.auth_user_id) {
      console.log('Tutor already has auth_user_id:', tutor.auth_user_id)
      console.log('\nTo test login:')
      console.log('1. Clear your browser cookies/session')
      console.log('2. Go to the login page')
      console.log('3. Use email: sarah_chen@hotmail.com')
      console.log('4. Use password: (whatever password was set in Supabase Auth)')
    } else {
      console.log('\nTutor profile needs to be linked to an auth account.')
      console.log('Steps to fix:')
      console.log('1. Go to Supabase Dashboard > Authentication > Users')
      console.log('2. Create a user with email: sarah_chen@hotmail.com')
      console.log('3. Set password to: demo123')
      console.log('4. Note the user ID')
      console.log('5. Run this SQL in Supabase:')
      console.log(`UPDATE tutors SET auth_user_id = 'USER_ID_HERE' WHERE email = 'sarah_chen@hotmail.com';`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

linkSarahAuth() 