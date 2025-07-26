import { NextResponse } from 'next/server'

export async function GET() {
  // Get build timestamp from env or use current time
  const buildTime = process.env.BUILD_TIMESTAMP || 'Not set'
  
  return NextResponse.json({
    environment: {
      nodeEnv: process.env.NODE_ENV,
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      vercelEnv: process.env.VERCEL_ENV || 'not-vercel',
      netlify: !!process.env.NETLIFY,
      isNetlify: process.env.NETLIFY === 'true',
    },
    deployment: {
      buildTime,
      currentTime: new Date().toISOString(),
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
    debug: {
      // Show partial values for debugging (first/last 4 chars)
      supabaseUrlPreview: process.env.NEXT_PUBLIC_SUPABASE_URL 
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(0, 8)}...${process.env.NEXT_PUBLIC_SUPABASE_URL.slice(-4)}`
        : 'Not set',
      hasAllRequiredEnvVars: !!(
        process.env.NEXT_PUBLIC_SUPABASE_URL &&
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        process.env.SUPABASE_SERVICE_ROLE_KEY
      )
    }
  }, {
    headers: {
      'Cache-Control': 'no-store, max-age=0, must-revalidate',
    }
  })
} 