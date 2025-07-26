import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Get all cookies
    const allCookies = cookieStore.getAll()
    const supabaseCookies = allCookies.filter(c => c.name.includes('sb-'))
    
    // Create server client
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
    
    // Check session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    // Get user (more secure)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    // Try to query tutors
    let tutorData = null
    let tutorError = null
    
    if (user) {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()
      
      tutorData = data
      tutorError = error
    }
    
    return NextResponse.json({
      cookies: {
        all: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
        supabase: supabaseCookies.map(c => ({ name: c.name, hasValue: !!c.value }))
      },
      session: {
        exists: !!session,
        user: session?.user?.email,
        error: sessionError?.message
      },
      user: {
        exists: !!user,
        email: user?.email,
        id: user?.id,
        error: userError?.message
      },
      tutor: {
        found: !!tutorData,
        data: tutorData ? {
          name: `${tutorData.first_name} ${tutorData.last_name}`,
          email: tutorData.email
        } : null,
        error: tutorError?.message
      }
    })
  } catch (error) {
    console.error('[API] SSR Auth check error:', error)
    return NextResponse.json({ error: 'Failed to check auth' }, { status: 500 })
  }
} 