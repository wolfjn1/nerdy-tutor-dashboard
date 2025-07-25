import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Create client
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

    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Try to query tutors without auth context
    const { data: tutorsNoAuth, error: tutorsNoAuthError } = await supabase
      .from('tutors')
      .select('id, email, first_name, last_name')
      .limit(3)
    
    // If we have a session, try to query with auth context
    let tutorsWithAuth = null
    let tutorsWithAuthError = null
    let specificTutor = null
    let specificTutorError = null
    
    if (session) {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .limit(3)
      
      tutorsWithAuth = data
      tutorsWithAuthError = error
      
      // Try to get specific tutor
      const { data: specific, error: specificError } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', session.user.id)
        .single()
        
      specificTutor = specific
      specificTutorError = specificError
    }
    
    // Check cookies
    const allCookies = cookieStore.getAll()
    const supabaseCookies = allCookies.filter(c => c.name.includes('supabase'))
    
    return NextResponse.json({
      session: {
        exists: !!session,
        userId: session?.user?.id,
        email: session?.user?.email,
        error: sessionError?.message
      },
      user: {
        exists: !!user,
        userId: user?.id,
        email: user?.email,
        error: userError?.message
      },
      queries: {
        tutorsNoAuth: {
          count: tutorsNoAuth?.length || 0,
          error: tutorsNoAuthError?.message,
          data: tutorsNoAuth
        },
        tutorsWithAuth: {
          count: tutorsWithAuth?.length || 0,
          error: tutorsWithAuthError?.message,
          hasData: !!tutorsWithAuth
        },
        specificTutor: {
          found: !!specificTutor,
          error: specificTutorError?.message,
          email: specificTutor?.email
        }
      },
      cookies: {
        count: supabaseCookies.length,
        names: supabaseCookies.map(c => c.name)
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 