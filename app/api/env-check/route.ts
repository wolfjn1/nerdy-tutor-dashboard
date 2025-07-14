import { NextResponse } from 'next/server'

export async function GET() {
  const envStatus = {
    NODE_ENV: process.env.NODE_ENV || 'not set',
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    urlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    // Show first few chars to verify format (safe for URL)
    urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) || 'not set',
    keyPrefix: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 10) || 'not set',
  }
  
  return NextResponse.json(envStatus)
} 