import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET() {
  try {
    const cookieStore = cookies()
    
    // Create client with anon key
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
    
    // Also create a service role client if available
    let serviceData = null
    if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseService = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        }
      )
      
      // Query with service role (bypasses RLS)
      const { data: serviceTutors, error: serviceError } = await supabaseService
        .from('tutors')
        .select('id, email, first_name, last_name, auth_user_id')
        .limit(5)
      
      serviceData = {
        tutorCount: serviceTutors?.length || 0,
        error: serviceError?.message,
        tutors: serviceTutors
      }
    }
    
    // Query with anon key (respects RLS)
    const { data: anonTutors, error: anonError } = await supabase
      .from('tutors')
      .select('id, email, first_name, last_name, auth_user_id')
      .limit(5)
    
    // Get auth session
    const { data: { session } } = await supabase.auth.getSession()
    
    // Try direct SQL query to check table exists
    const { data: tableCheck, error: tableError } = await supabase
      .from('tutors')
      .select('count', { count: 'exact', head: true })
    
    return NextResponse.json({
      success: true,
      environment: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      auth: {
        hasSession: !!session,
        userId: session?.user?.id,
        email: session?.user?.email
      },
      queries: {
        withAnonKey: {
          count: anonTutors?.length || 0,
          error: anonError?.message,
          data: anonTutors
        },
        withServiceRole: serviceData,
        tableExists: {
          error: tableError?.message,
          count: tableCheck
        }
      }
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
} 