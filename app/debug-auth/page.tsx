'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function DebugAuthPage() {
  const [status, setStatus] = useState<any>({})
  
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      
      try {
        // Check session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Get current URL info
        const urlInfo = {
          origin: window.location.origin,
          href: window.location.href,
          protocol: window.location.protocol,
          host: window.location.host
        }
        
        setStatus({
          timestamp: new Date().toISOString(),
          session: session ? {
            user: session.user.email,
            expires: session.expires_at,
            hasToken: !!session.access_token
          } : null,
          sessionError: sessionError?.message || null,
          url: urlInfo,
          cookies: document.cookie ? 'Present' : 'None',
          env: {
            hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            nodeEnv: process.env.NODE_ENV
          }
        })
      } catch (error: any) {
        setStatus({
          error: error.message,
          timestamp: new Date().toISOString()
        })
      }
    }
    
    checkAuth()
  }, [])
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Auth Status</h1>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
        {JSON.stringify(status, null, 2)}
      </pre>
      
      <div className="mt-4 space-y-2">
        <a 
          href="/test-auth" 
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Go to Test Auth Page
        </a>
        <br />
        <a 
          href="/dashboard?bypass=true" 
          className="inline-block px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Bypass Auth to Dashboard
        </a>
      </div>
    </div>
  )
} 