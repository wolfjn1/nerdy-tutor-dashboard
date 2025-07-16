import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    // Create a fresh Supabase client
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.status,
        details: error
      })
    }
    
    // If successful, try to fetch tutor
    let tutorData: any = null
    let tutorError: any = null
    
    if (data.user) {
      const { data: tutor, error: tError } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', data.user.id)
        .single()
      
      tutorData = tutor
      tutorError = tError
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email
      },
      session: {
        hasSession: !!data.session,
        expiresAt: data.session?.expires_at
      },
      tutor: {
        found: !!tutorData,
        data: tutorData,
        error: tutorError
      }
    })
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 