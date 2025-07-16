import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-browser'

export async function GET() {
  try {
    const supabase = createClient()
    
    // Test database connection
    const { data, error } = await supabase
      .from('tutors')
      .select('count')
      .limit(1)
    
    return NextResponse.json({
      status: 'ok',
      environment: {
        hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        nodeEnv: process.env.NODE_ENV,
      },
      database: {
        connected: !error,
        error: error?.message || null,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    return NextResponse.json({
      status: 'error',
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 })
  }
} 