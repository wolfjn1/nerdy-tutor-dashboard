import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET() {
  const cookieStore = cookies()
  
  // Get all cookies and delete them
  cookieStore.getAll().forEach(cookie => {
    cookieStore.delete(cookie.name)
  })
  
  // Also try to delete common Supabase cookie names
  const supabaseCookies = [
    'sb-access-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'sb-kyldpxoxayemjhxmehkc-auth-token',
    'sb-kyldpxoxayemjhxmehkc-auth-token-code-verifier'
  ]
  
  supabaseCookies.forEach(name => {
    try {
      cookieStore.delete(name)
      cookieStore.delete({
        name,
        path: '/'
      })
    } catch (e) {
      // Ignore errors
    }
  })
  
  return NextResponse.json({ 
    message: 'Session cleared. You can now visit /login or /test pages.',
    links: {
      login: '/login',
      test: '/test',
      testSupabase: '/test-supabase',
      status: '/status'
    }
  })
} 