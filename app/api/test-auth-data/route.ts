import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Not authenticated',
        details: userError?.message 
      }, { status: 401 })
    }
    
    // Get tutor profile
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    // Get students with count
    let studentData = null
    let studentCount = 0
    let activeStudentCount = 0
    
    if (tutor) {
      const { data: students, count, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact' })
        .eq('tutor_id', tutor.id)
        
      studentData = students
      studentCount = count || 0
      activeStudentCount = students?.filter(s => s.is_active).length || 0
    }
    
    // Get sessions count
    let sessionCount = 0
    if (tutor) {
      const { count } = await supabase
        .from('sessions')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', tutor.id)
        
      sessionCount = count || 0
    }
    
    return NextResponse.json({
      auth: {
        userId: user.id,
        email: user.email
      },
      tutor: {
        found: !!tutor,
        id: tutor?.id,
        name: tutor ? `${tutor.first_name} ${tutor.last_name}` : null,
        authUserId: tutor?.auth_user_id
      },
      students: {
        total: studentCount,
        active: activeStudentCount,
        inactive: studentCount - activeStudentCount,
        firstFew: studentData?.slice(0, 3).map(s => ({
          id: s.id,
          name: `${s.first_name} ${s.last_name}`,
          isActive: s.is_active
        }))
      },
      sessions: {
        total: sessionCount
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 