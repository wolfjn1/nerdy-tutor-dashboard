import { NextResponse } from 'next/server'

export async function GET() {
  // Set headers to prevent caching
  const response = NextResponse.json({ cleared: true })
  
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  response.headers.set('Pragma', 'no-cache')
  response.headers.set('Expires', '0')
  response.headers.set('Surrogate-Control', 'no-store')
  
  return response
}
