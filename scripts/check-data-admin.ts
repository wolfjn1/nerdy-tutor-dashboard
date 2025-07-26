import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Using key type:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Service Role' : 'Anon')

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkData() {
  console.log('\nChecking actual data in tables...\n')
  
  // Get tutors count
  const { count: tutorCount, data: tutors } = await supabase
    .from('tutors')
    .select('*', { count: 'exact' })
    .limit(5)
    
  console.log('Tutors count:', tutorCount)
  if (tutors && tutors.length > 0) {
    console.log('Sample tutors:')
    tutors.forEach(t => {
      console.log(`  - ${t.first_name} ${t.last_name} (${t.email})`)
    })
  }
  
  // Get students count
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    
  console.log('\nStudents count:', studentCount)
  
  // Get sessions count
  const { count: sessionCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    
  console.log('Sessions count:', sessionCount)
  
  // Check if Sarah exists
  console.log('\nChecking for Sarah Chen...')
  const { data: sarah } = await supabase
    .from('tutors')
    .select('*')
    .or('email.eq.sarah_chen@hotmail.com,auth_user_id.eq.ae70c119-d3e5-470e-8807-16f1b28aba45')
    
  if (sarah && sarah.length > 0) {
    console.log('Found Sarah:', sarah)
  } else {
    console.log('Sarah Chen not found in tutors table')
  }
}

checkData().then(() => process.exit(0))
