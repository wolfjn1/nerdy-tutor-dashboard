import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createClient()
    
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get user (more reliable)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Try to fetch tutor if we have a user
    let tutor = null
    let tutorError = null
    if (user) {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()
      
      tutor = data
      tutorError = error
    }
    
    return NextResponse.json({
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL,
        timestamp: new Date().toISOString()
      },
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError
      },
      user: {
        exists: !!user,
        userId: user?.id,
        email: user?.email,
        error: userError
      },
      tutor: {
        exists: !!tutor,
        tutorId: tutor?.id,
        name: tutor?.name,
        error: tutorError
      },
      cookies: {
        hasCookies: cookieStore.getAll().length > 0,
        cookieCount: cookieStore.getAll().length
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to debug auth',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 