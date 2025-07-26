import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' })
  }
  
  // Get tutor
  const { data: tutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  // Get students count
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', tutor?.id || '')
    
  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: todaysSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutor?.id || '')
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    
  return NextResponse.json({
    user: { id: user.id, email: user.email },
    tutor: tutor ? { id: tutor.id, name: `${tutor.first_name} ${tutor.last_name}` } : null,
    students: { total: studentCount },
    todaysSessions: {
      count: todaysSessions?.length || 0,
      dateRange: {
        from: today.toISOString(),
        to: tomorrow.toISOString()
      },
      sessions: todaysSessions?.map(s => ({
        time: new Date(s.scheduled_at).toISOString(),
        subject: s.subject,
        status: s.status
      }))
    }
  })
} 