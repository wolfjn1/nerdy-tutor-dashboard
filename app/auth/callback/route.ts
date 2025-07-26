import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // URL to redirect to after sign in process completes
      return NextResponse.redirect(`${requestUrl.origin}${next}`)
    }
  }

  // URL to redirect to if sign in fails
  return NextResponse.redirect(`${requestUrl.origin}/login?error=auth_callback_error`)
} 