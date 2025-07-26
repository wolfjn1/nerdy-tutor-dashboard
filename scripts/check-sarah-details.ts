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

async function checkSarahDetails() {
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
  
  console.log('Sarah Chen\'s Data Analysis\n')
  
  // Get all students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  const activeStudents = students?.filter(s => s.is_active) || []
  const inactiveStudents = students?.filter(s => !s.is_active) || []
  
  console.log('Students:')
  console.log(`  Total: ${students?.length || 0}`)
  console.log(`  Active: ${activeStudents.length} ✅`)
  console.log(`  Inactive: ${inactiveStudents.length}`)
  
  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: todaysSessions } = await supabase
    .from('sessions')
    .select('*, students:student_id(first_name, last_name)')
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    
  console.log(`\nToday's Sessions: ${todaysSessions?.length || 0}`)
  if (todaysSessions && todaysSessions.length > 0) {
    todaysSessions.forEach(s => {
      const time = new Date(s.scheduled_at).toLocaleTimeString()
      console.log(`  - ${s.students?.first_name} ${s.students?.last_name} at ${time} (${s.status})`)
    })
  }
  
  // Get upcoming sessions (next 7 days)
  const nextWeek = new Date(today)
  nextWeek.setDate(nextWeek.getDate() + 7)
  
  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', new Date().toISOString())
    .lte('scheduled_at', nextWeek.toISOString())
    .order('scheduled_at', { ascending: true })
    
  console.log(`\nUpcoming Sessions (next 7 days): ${upcomingSessions?.length || 0}`)
}

checkSarahDetails().then(() => process.exit(0))
