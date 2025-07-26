import { NextResponse } from 'next/server'

export const runtime = 'edge'

export async function GET() {
  try {
    // Just check if environment variables exist
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!hasUrl || !hasKey) {
      return NextResponse.json({
        success: false,
        error: 'Missing environment variables',
        hasUrl,
        hasKey
      })
    }
    
    // Try a simple health check
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const healthUrl = `${supabaseUrl}/rest/v1/`
    
    try {
      const response = await fetch(healthUrl, {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        }
      })
      
      return NextResponse.json({
        success: true,
        connection: {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        },
        environment: {
          url: supabaseUrl,
          projectRef: supabaseUrl.split('//')[1].split('.')[0]
        }
      })
    } catch (fetchError) {
      return NextResponse.json({
        success: false,
        error: 'Failed to connect to Supabase',
        details: String(fetchError)
      })
    }
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Unexpected error',
      details: String(error)
    })
  }
} 