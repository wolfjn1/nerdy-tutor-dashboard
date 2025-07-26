'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestAuthDebugPage() {
  const [debugInfo, setDebugInfo] = useState<any>({})
  const supabase = createClient()
  
  useEffect(() => {
    async function debugAuth() {
      // Check all cookies
      const allCookies = document.cookie
      
      // Check localStorage
      const localStorageItems: any = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.includes('supabase')) {
          localStorageItems[key] = localStorage.getItem(key)
        }
      }
      
      // Check sessionStorage
      const sessionStorageItems: any = {}
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i)
        if (key && key.includes('supabase')) {
          sessionStorageItems[key] = sessionStorage.getItem(key)
        }
      }
      
      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      // Get user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      // Check auth state
      const authState = await new Promise((resolve) => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          resolve({ event, session })
          subscription.unsubscribe()
        })
        
        // Timeout after 2 seconds
        setTimeout(() => {
          resolve({ event: 'TIMEOUT', session: null })
          subscription.unsubscribe()
        }, 2000)
      })
      
      setDebugInfo({
        cookies: {
          all: allCookies,
          parsed: allCookies.split('; ').reduce((acc, cookie) => {
            const [key, value] = cookie.split('=')
            if (key && key.includes('sb-')) {
              acc[key] = value ? value.substring(0, 50) + '...' : 'empty'
            }
            return acc
          }, {} as any)
        },
        localStorage: localStorageItems,
        sessionStorage: sessionStorageItems,
        session: session ? {
          user: session.user?.email,
          access_token: session.access_token ? 'Present' : 'Missing',
          refresh_token: session.refresh_token ? 'Present' : 'Missing',
          expires_at: session.expires_at
        } : 'No session',
        sessionError: sessionError?.message,
        user: user ? {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        } : 'No user',
        userError: userError?.message,
        authState,
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      })
    }
    
    debugAuth()
  }, [])
  
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Information</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Cookies:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo.cookies, null, 2)}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Storage:</h2>
          <div className="mb-4">
            <h3 className="font-semibold">LocalStorage:</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo.localStorage, null, 2)}</pre>
          </div>
          <div>
            <h3 className="font-semibold">SessionStorage:</h3>
            <pre className="text-xs overflow-auto">{JSON.stringify(debugInfo.sessionStorage, null, 2)}</pre>
          </div>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Auth State:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify({
            session: debugInfo.session,
            sessionError: debugInfo.sessionError,
            user: debugInfo.user,
            userError: debugInfo.userError,
            authState: debugInfo.authState
          }, null, 2)}</pre>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-bold mb-2">Environment:</h2>
          <pre className="text-xs overflow-auto">{JSON.stringify({
            supabaseUrl: debugInfo.supabaseUrl,
            hasAnonKey: debugInfo.hasAnonKey
          }, null, 2)}</pre>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-100 dark:bg-blue-900 rounded">
        <h2 className="font-bold mb-2">What to look for:</h2>
        <ul className="list-disc list-inside text-sm space-y-1">
          <li>Cookies starting with 'sb-' should contain auth tokens</li>
          <li>Session should have both access_token and refresh_token</li>
          <li>Auth state event should be SIGNED_IN or INITIAL_SESSION</li>
          <li>User object should contain email and ID</li>
        </ul>
      </div>
    </div>
  )
} 