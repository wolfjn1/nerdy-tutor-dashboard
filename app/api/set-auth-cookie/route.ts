import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { access_token, refresh_token, expires_at } = body
    
    if (!access_token || !refresh_token) {
      return NextResponse.json({ error: 'Missing tokens' }, { status: 400 })
    }
    
    const cookieStore = cookies()
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const projectRef = supabaseUrl.split('//')[1].split('.')[0]
    
    // Create the auth token cookie value
    const authToken = {
      access_token,
      refresh_token,
      expires_at,
      token_type: 'bearer',
      user: null // Will be populated by Supabase
    }
    
    // Set the cookie with proper options for production
    cookieStore.set({
      name: `sb-${projectRef}-auth-token`,
      value: JSON.stringify(authToken),
      httpOnly: false, // Must be false for client-side access
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    })
    
    // Also set a refresh token cookie
    cookieStore.set({
      name: `sb-${projectRef}-refresh-token`,
      value: refresh_token,
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 365 // 1 year
    })
    
    console.log('[API] Auth cookies set for project:', projectRef)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API] Error setting auth cookie:', error)
    return NextResponse.json({ error: 'Failed to set cookie' }, { status: 500 })
  }
} 