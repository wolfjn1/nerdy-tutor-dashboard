import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Test 1: Environment variables
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    
    // Test 2: Try to create a client and make a simple request
    let connectionTest = { success: false, error: null as any }
    
    if (hasUrl && hasKey) {
      try {
        const response = await fetch(`${url}/rest/v1/`, {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`
          }
        })
        
        connectionTest = {
          success: response.ok,
          status: response.status,
          statusText: response.statusText,
          error: !response.ok ? `${response.status} ${response.statusText}` : null
        }
      } catch (e) {
        connectionTest.error = e instanceof Error ? e.message : 'Unknown error'
      }
    }
    
    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        hasUrl,
        hasKey,
        url: url ? url.substring(0, 40) + '...' : 'NOT SET',
        isVercel: !!process.env.VERCEL
      },
      connection: connectionTest,
      help: {
        ifFailing: [
          'Check Supabase URL is correct',
          'Check Anon Key is correct',
          'Check if Supabase project is paused',
          'Check CORS settings in Supabase'
        ]
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
} 