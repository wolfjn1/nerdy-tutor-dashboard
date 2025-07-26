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

async function debugTodaysSessions() {
  // Get today's date range exactly as the dashboard does
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  console.log('Date range for "today":')
  console.log(`  From: ${today.toISOString()}`)
  console.log(`  To:   ${tomorrow.toISOString()}`)
  console.log('')
  
  // Query exactly as dashboard does
  const { data: todaySessionsData, error } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', 'd87df13b-5487-4b04-89c8-4b18bf89250a')
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true })
    
  if (error) {
    console.error('Error:', error)
    return
  }
    
  console.log(`Today's sessions count: ${todaySessionsData?.length || 0}`)
  
  if (todaySessionsData && todaySessionsData.length > 0) {
    console.log('\nSessions:')
    todaySessionsData.forEach(s => {
      const student = s.students as any
      console.log(`  ${new Date(s.scheduled_at).toTimeString().slice(0,5)} - ${student?.first_name} ${student?.last_name} - ${s.subject} (${s.status})`)
    })
  }
  
  // Also check what the dashboard calculation would show
  const todaysSessions = todaySessionsData?.length || 0
  const todaysEarnings = todaysSessions * 50
  
  console.log(`\nDashboard would show:`)
  console.log(`  Sessions Today: ${todaysSessions}`)
  console.log(`  Today's Earnings: $${todaysEarnings}`)
}

debugTodaysSessions().then(() => process.exit(0)) 