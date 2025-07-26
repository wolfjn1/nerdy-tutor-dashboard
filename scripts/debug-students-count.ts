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

async function debugStudentCounts() {
  // Get Sarah's tutor record
  const { data: tutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', 'ae70c119-d3e5-470e-8807-16f1b28aba45')
    .single()
    
  if (!tutor) {
    console.error('Sarah not found')
    return
  }
  
  console.log('Debugging Student Counts for Sarah Chen\n')
  console.log('Tutor ID:', tutor.id)
  console.log('---')
  
  // Method 1: Direct count
  const { count: totalCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', tutor.id)
    
  console.log('Method 1 - Direct count:', totalCount)
  
  // Method 2: Get all students and count manually
  const { data: allStudents } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  console.log('Method 2 - Fetched students:', allStudents?.length || 0)
  
  if (allStudents) {
    const activeCount = allStudents.filter(s => s.is_active === true).length
    const inactiveCount = allStudents.filter(s => s.is_active === false).length
    const nullActiveCount = allStudents.filter(s => s.is_active === null).length
    
    console.log('  Active (is_active = true):', activeCount)
    console.log('  Inactive (is_active = false):', inactiveCount)
    console.log('  Null (is_active = null):', nullActiveCount)
    
    // List students with null is_active
    if (nullActiveCount > 0) {
      console.log('\nStudents with null is_active:')
      allStudents
        .filter(s => s.is_active === null)
        .forEach(s => {
          console.log(`  - ${s.first_name} ${s.last_name} (is_active: ${s.is_active})`)
        })
    }
    
    // Check for any other tutor_ids
    console.log('\n--- Checking all tutor_ids ---')
    const tutorIds = new Set(allStudents.map(s => s.tutor_id))
    console.log('Unique tutor_ids found:', Array.from(tutorIds))
  }
  
  // Method 3: Check if we're missing any students due to permissions
  console.log('\n--- Checking with service role key ---')
  const { data: allStudentsAdmin, count: adminCount } = await supabase
    .from('students')
    .select('*', { count: 'exact' })
    .eq('tutor_id', tutor.id)
    
  console.log('Admin query count:', adminCount)
  console.log('Admin fetched students:', allStudentsAdmin?.length || 0)
}

debugStudentCounts().then(() => process.exit(0))
