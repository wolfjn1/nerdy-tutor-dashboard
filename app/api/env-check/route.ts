import { NextResponse } from 'next/server'

export async function GET() {
  return Response.json({
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    supabaseUrlLength: process.env.NEXT_PUBLIC_SUPABASE_URL?.length || 0,
    supabaseKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
    nodeEnv: process.env.NODE_ENV,
    vercelEnv: process.env.VERCEL_ENV,
    timestamp: new Date().toISOString(),
  })
} 