import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function linkAuthToTutor() {
  console.log('🔗 Linking auth user to tutor record...\n')
  
  // The auth user ID from your logs
  const authUserId = 'ae70c119-d3e5-470e-8807-16f1b28aba45'
  const tutorEmail = 'sarah.chen28@gmail.com'
  
  try {
    // First, check if the tutor exists
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .eq('email', tutorEmail)
      .single()
    
    if (tutorError) {
      console.error('❌ Error finding tutor:', tutorError)
      return
    }
    
    if (!tutor) {
      console.error('❌ No tutor found with email:', tutorEmail)
      return
    }
    
    console.log('✅ Found tutor:', {
      id: tutor.id,
      name: `${tutor.first_name} ${tutor.last_name}`,
      email: tutor.email,
      current_auth_user_id: tutor.auth_user_id
    })
    
    // Update the tutor record with the correct auth_user_id
    const { error: updateError } = await supabase
      .from('tutors')
      .update({ auth_user_id: authUserId })
      .eq('id', tutor.id)
    
    if (updateError) {
      console.error('❌ Error updating tutor:', updateError)
      return
    }
    
    console.log(`\n✅ Successfully linked auth user ${authUserId} to tutor ${tutor.id}`)
    
    // Verify the students exist
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('id, first_name, last_name')
      .eq('tutor_id', tutor.id)
      .limit(5)
    
    if (studentsError) {
      console.error('❌ Error fetching students:', studentsError)
    } else {
      console.log(`\n📚 This tutor has ${students?.length || 0} students:`)
      students?.forEach(s => console.log(`   - ${s.first_name} ${s.last_name}`))
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error)
  }
}

linkAuthToTutor()
