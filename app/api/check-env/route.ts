import { NextResponse } from 'next/server'

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnonKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  
  // Extract project ref from URL
  const projectRef = supabaseUrl ? supabaseUrl.split('//')[1].split('.')[0] : 'not-found'
  
  return NextResponse.json({
    environment: process.env.NODE_ENV,
    supabase: {
      url: supabaseUrl || 'NOT SET',
      projectRef,
      hasAnonKey,
      hasServiceKey,
      urlLength: supabaseUrl?.length || 0,
    },
    allPublicEnv: Object.keys(process.env)
      .filter(key => key.startsWith('NEXT_PUBLIC_'))
      .reduce((acc, key) => {
        acc[key] = process.env[key] ? 'SET' : 'NOT SET'
        return acc
      }, {} as Record<string, string>)
  })
} 