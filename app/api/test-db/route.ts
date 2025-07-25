import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )
    
    // Test 1: Can we connect to Supabase?
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Test 2: Can we query the tutors table?
    const { data: tutors, error: tutorError } = await supabase
      .from('tutors')
      .select('id, email, first_name, last_name, auth_user_id')
      .limit(5)
    
    // Test 3: Check Sarah Chen specifically
    const { data: sarah, error: sarahError } = await supabase
      .from('tutors')
      .select('*')
      .eq('email', 'sarah_chen@hotmail.com')
      .single()
    
    return NextResponse.json({
      success: true,
      tests: {
        session: {
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          error: sessionError?.message
        },
        tutorQuery: {
          count: tutors?.length || 0,
          error: tutorError?.message,
          data: tutors
        },
        sarahChen: {
          found: !!sarah,
          authUserId: sarah?.auth_user_id,
          error: sarahError?.message,
          matches: sarah?.auth_user_id === 'ae70c119-d3e5-470e-8807-16f1b28aba45'
        }
      },
      environment: {
        hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 