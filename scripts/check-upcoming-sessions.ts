import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local'), quiet: true })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function checkSessions() {
  // Get today's date
  const today = new Date()
  console.log(`Today's date: ${today.toISOString().split('T')[0]}`)
  console.log('')
  
  // Check upcoming sessions
  const { data: upcoming } = await supabase
    .from('sessions')
    .select('scheduled_at, subject, status, students:student_id(first_name, last_name)')
    .eq('tutor_id', 'd87df13b-5487-4b04-89c8-4b18bf89250a')
    .gte('scheduled_at', today.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)
    
  console.log('Upcoming sessions for Sarah:')
  upcoming?.forEach(s => {
    const date = new Date(s.scheduled_at)
    const student = s.students as any
    console.log(`  ${date.toISOString().split('T')[0]} ${date.toTimeString().slice(0,5)} - ${student?.first_name} ${student?.last_name} - ${s.subject} (${s.status})`)
  })
  
  // Check today's sessions specifically
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: todaySessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', 'd87df13b-5487-4b04-89c8-4b18bf89250a')
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    
  console.log(`\nToday's sessions: ${todaySessions?.length || 0}`)
}

checkSessions().then(() => process.exit(0)) 