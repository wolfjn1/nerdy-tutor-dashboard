import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        userError: userError?.message 
      }, { status: 401 })
    }
    
    // Fetch tutor profile
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    // Fetch students
    const { data: students, error: studentsError } = await supabase
      .from('students')
      .select('*')
      .eq('tutor_id', tutor?.id || '')
      
    // Get today's sessions
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data: todaysSessions, error: sessionsError } = await supabase
      .from('sessions')
      .select(`
        *,
        students:student_id (
          first_name,
          last_name
        )
      `)
      .eq('tutor_id', tutor?.id || '')
      .gte('scheduled_at', today.toISOString())
      .lt('scheduled_at', tomorrow.toISOString())
      .order('scheduled_at', { ascending: true })
      
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email
      },
      tutor: {
        found: !!tutor,
        data: tutor,
        error: tutorError?.message
      },
      students: {
        count: students?.length || 0,
        active: students?.filter(s => s.is_active).length || 0,
        data: students,
        error: studentsError?.message
      },
      todaysSessions: {
        count: todaysSessions?.length || 0,
        data: todaysSessions,
        error: sessionsError?.message
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 