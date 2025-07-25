import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()
    
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          }
        }
      }
    )

    // Step 1: Sign in
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return NextResponse.json({
        success: false,
        step: 'auth',
        error: authError.message
      })
    }

    // Step 2: Get session
    const { data: { session } } = await supabase.auth.getSession()

    // Step 3: Try to fetch tutors
    const { data: tutors, error: tutorError } = await supabase
      .from('tutors')
      .select('id, email, first_name, last_name, auth_user_id')
      .limit(5)

    // Step 4: Try to fetch specific tutor
    const { data: specificTutor, error: specificError } = await supabase
      .from('tutors')
      .select('*')
      .eq('email', email)
      .single()

    return NextResponse.json({
      success: true,
      auth: {
        userId: authData.user?.id,
        email: authData.user?.email
      },
      session: {
        hasSession: !!session,
        userId: session?.user?.id
      },
      tutorQuery: {
        count: tutors?.length || 0,
        error: tutorError?.message,
        data: tutors
      },
      specificTutor: {
        found: !!specificTutor,
        error: specificError?.message,
        hasAuthUserId: specificTutor?.auth_user_id === authData.user?.id
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
  }
} 