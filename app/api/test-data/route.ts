import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-browser'

export async function GET(request: Request) {
  try {
    const supabase = createClient()
    
    // Test fetching tutors
    const { data: tutors, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .limit(5)
    
    // Test fetching students
    const { data: students, error: studentError } = await supabase
      .from('students')
      .select('*')
      .limit(5)
    
    // Test fetching sessions
    const { data: sessions, error: sessionError } = await supabase
      .from('sessions')
      .select('*')
      .limit(5)
    
    return NextResponse.json({
      success: true,
      data: {
        tutors: {
          count: tutors?.length || 0,
          error: tutorError?.message || null,
          sample: tutors?.[0] || null
        },
        students: {
          count: students?.length || 0,
          error: studentError?.message || null,
          sample: students?.[0] || null
        },
        sessions: {
          count: sessions?.length || 0,
          error: sessionError?.message || null,
          sample: sessions?.[0] || null
        }
      }
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
} 