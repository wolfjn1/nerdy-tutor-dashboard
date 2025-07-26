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

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkSarahData() {
  console.log('Checking data for Sarah Chen...\n')
  
  // Find Sarah's tutor record
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .select('*')
    .eq('email', 'sarah_chen@hotmail.com')
    .single()
    
  if (tutorError || !tutor) {
    console.error('Could not find Sarah Chen tutor record:', tutorError)
    return
  }
  
  console.log('✓ Found Sarah Chen:')
  console.log(`  ID: ${tutor.id}`)
  console.log(`  Name: ${tutor.first_name} ${tutor.last_name}`)
  console.log(`  Email: ${tutor.email}`)
  console.log(`  Level: ${tutor.level || 1}`)
  console.log(`  Title: ${tutor.title || 'Expert'}`)
  console.log('')
  
  // Check students
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  if (studentsError) {
    console.error('Error fetching students:', studentsError)
  } else {
    console.log(`✓ Students: ${students?.length || 0} total`)
    const activeStudents = students?.filter(s => s.is_active).length || 0
    console.log(`  Active: ${activeStudents}`)
    console.log(`  Inactive: ${(students?.length || 0) - activeStudents}`)
  }
  
  // Check sessions
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  if (sessionsError) {
    console.error('Error fetching sessions:', sessionsError)
  } else {
    console.log(`\n✓ Sessions: ${sessions?.length || 0} total`)
    
    // Count by status
    const statusCounts = sessions?.reduce((acc, session) => {
      acc[session.status] = (acc[session.status] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}
    
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count}`)
    })
    
    // Check upcoming sessions
    const upcoming = sessions?.filter(s => 
      new Date(s.scheduled_at) > new Date() && s.status === 'scheduled'
    ).length || 0
    
    console.log(`  Upcoming: ${upcoming}`)
    
    // Check today's sessions
    const today = new Date().toDateString()
    const todaysSessions = sessions?.filter(s => 
      new Date(s.scheduled_at).toDateString() === today
    ).length || 0
    
    console.log(`  Today: ${todaysSessions}`)
  }
  
  console.log('\n✓ Dashboard should show:')
  console.log(`  - Active Students: ${students?.filter(s => s.is_active).length || 0}`)
  console.log(`  - Sessions Today: ${sessions?.filter(s => new Date(s.scheduled_at).toDateString() === new Date().toDateString()).length || 0}`)
  console.log(`  - Upcoming Sessions: ${sessions?.filter(s => new Date(s.scheduled_at) > new Date()).length || 0}`)
}

checkSarahData().catch(console.error) 