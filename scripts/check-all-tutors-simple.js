const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function checkTutors() {
  console.log('Fetching all tutors...\n')
  
  const { data: tutors, error } = await supabase
    .from('tutors')
    .select('id, email, first_name, last_name, auth_user_id')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  if (!tutors || tutors.length === 0) {
    console.log('No tutors found in the database')
    return
  }
  
  console.log(`Found ${tutors.length} tutor(s):\n`)
  
  tutors.forEach((tutor, index) => {
    console.log(`${index + 1}. ${tutor.first_name} ${tutor.last_name}`)
    console.log(`   Email: ${tutor.email}`)
    console.log(`   ID: ${tutor.id}`)
    console.log(`   Auth User ID: ${tutor.auth_user_id || 'NOT LINKED'}`)
    console.log('')
  })
}

checkTutors() 