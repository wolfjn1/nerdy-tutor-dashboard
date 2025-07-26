'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestSSRAuthPage() {
  const [status, setStatus] = useState<any>({})
  const [cookies, setCookies] = useState<string>('')
  
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      
      // Check current cookies
      setCookies(document.cookie || 'No cookies found')
      
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Check for auth cookies
      const authCookies = document.cookie
        .split('; ')
        .filter(cookie => cookie.includes('sb-') && cookie.includes('-auth-token'))
      
      setStatus({
        session: session ? {
          access_token: session.access_token ? 'Present' : 'Missing',
          refresh_token: session.refresh_token ? 'Present' : 'Missing',
          user_email: session.user?.email
        } : 'No session',
        sessionError: sessionError?.message,
        user: user ? {
          id: user.id,
          email: user.email
        } : 'No user',
        userError: userError?.message,
        authCookies: authCookies.length > 0 ? authCookies : ['No auth cookies found'],
        allCookies: document.cookie.split('; ')
      })
    }
    
    checkAuth()
  }, [])
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">SSR Auth Test</h1>
      
      <div className="space-y-6">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Auth Status:</h2>
          <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(status, null, 2)}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Raw Cookies:</h2>
          <pre className="text-xs whitespace-pre-wrap">{cookies}</pre>
        </div>
        
        <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded">
          <h2 className="font-bold mb-2">Instructions:</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Test this page in incognito mode</li>
            <li>Login at /login with sarah_chen@hotmail.com / demo123</li>
            <li>Return to this page to see if auth cookies are set</li>
            <li>Look for cookies starting with 'sb-' containing 'auth-token'</li>
          </ol>
        </div>
      </div>
    </div>
  )
} 