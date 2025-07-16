import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    // Try to create a basic Supabase client
    let clientCreated = false
    let clientError = null
    
    if (hasUrl && hasKey) {
      try {
        const { createClient } = await import('@supabase/supabase-js')
        const client = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        )
        clientCreated = true
        
        // Try a simple query
        const { error } = await client.from('tutors').select('count').limit(1)
        if (error) {
          clientError = error.message
        }
      } catch (e) {
        clientError = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        hasUrl,
        hasKey,
        nodeEnv: process.env.NODE_ENV,
        vercel: !!process.env.VERCEL
      },
      supabase: {
        clientCreated,
        error: clientError
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 