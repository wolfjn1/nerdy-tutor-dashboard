import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDashboardData() {
  console.log('Checking Sarah\'s dashboard data...\n')
  
  // Get Sarah's tutor record
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .select('*')
    .eq('email', 'sarah_chen@hotmail.com')
    .single()
    
  if (tutorError || !tutor) {
    console.error('Error fetching tutor:', tutorError)
    return
  }
  
  console.log('Tutor found:', tutor.first_name, tutor.last_name)
  console.log('Tutor ID:', tutor.id)
  console.log('---')
  
  // Get all students
  const { data: allStudents, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  if (studentsError) {
    console.error('Error fetching students:', studentsError)
    return
  }
  
  const activeStudents = allStudents?.filter(s => s.is_active) || []
  const inactiveStudents = allStudents?.filter(s => !s.is_active) || []
  
  console.log('Total students:', allStudents?.length || 0)
  console.log('Active students:', activeStudents.length)
  console.log('Inactive students:', inactiveStudents.length)
  console.log('---')
  
  // List inactive students
  if (inactiveStudents.length > 0) {
    console.log('Inactive students:')
    inactiveStudents.forEach(s => {
      console.log(`  - ${s.first_name} ${s.last_name} (is_active: ${s.is_active})`)
    })
    console.log('---')
  }
  
  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: todaysSessions, error: todaysError } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    
  if (todaysError) {
    console.error('Error fetching today\'s sessions:', todaysError)
    return
  }
  
  console.log('Today\'s sessions:', todaysSessions?.length || 0)
  if (todaysSessions && todaysSessions.length > 0) {
    todaysSessions.forEach(s => {
      console.log(`  - ${s.students?.first_name} ${s.students?.last_name} at ${new Date(s.scheduled_at).toLocaleTimeString()}`)
    })
  }
  console.log('---')
  
  // Get all upcoming sessions
  const { data: upcomingSessions, error: upcomingError } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)
    
  if (upcomingError) {
    console.error('Error fetching upcoming sessions:', upcomingError)
    return
  }
  
  console.log('All upcoming sessions:', upcomingSessions?.length || 0)
  if (upcomingSessions && upcomingSessions.length > 0) {
    upcomingSessions.forEach(s => {
      console.log(`  - ${s.students?.first_name} ${s.students?.last_name} on ${new Date(s.scheduled_at).toLocaleDateString()} at ${new Date(s.scheduled_at).toLocaleTimeString()}`)
    })
  }
}

checkDashboardData().then(() => process.exit(0))
