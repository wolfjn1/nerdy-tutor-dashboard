'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function StatusPage() {
  const [status, setStatus] = useState<any>({
    loading: true,
    supabase: null,
    auth: null,
    env: null,
    error: null
  })

  useEffect(() => {
    const checkStatus = async () => {
      try {
        // Check environment
        const env = {
          hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          urlStart: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
          nodeEnv: process.env.NODE_ENV
        }

        // Check Supabase connection
        const supabase = createClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Try a simple database query
        let dbStatus = null
        try {
          const { error: dbError } = await supabase.from('tutors').select('count').limit(1)
          dbStatus = dbError ? `DB Error: ${dbError.message}` : 'Connected'
        } catch (e) {
          dbStatus = `DB Exception: ${e instanceof Error ? e.message : 'Unknown'}`
        }

        setStatus({
          loading: false,
          supabase: {
            connected: true,
            dbStatus
          },
          auth: {
            hasSession: !!session,
            userId: session?.user?.id,
            email: session?.user?.email,
            error: sessionError?.message
          },
          env,
          error: null
        })
      } catch (error) {
        setStatus({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    checkStatus()
  }, [])

  if (status.loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <h1 className="text-2xl font-bold mb-4">Status Check</h1>
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-8">Nerdy Tutor Dashboard - Status</h1>
      
      <div className="space-y-6 max-w-2xl">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Environment</h2>
          <pre className="text-sm">{JSON.stringify(status.env, null, 2)}</pre>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Supabase Connection</h2>
          <pre className="text-sm">{JSON.stringify(status.supabase, null, 2)}</pre>
        </div>

        <div className="bg-gray-800 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Authentication</h2>
          <pre className="text-sm">{JSON.stringify(status.auth, null, 2)}</pre>
        </div>

        {status.error && (
          <div className="bg-red-900 p-4 rounded">
            <h2 className="text-lg font-semibold mb-2">Error</h2>
            <p>{status.error}</p>
          </div>
        )}

        <div className="mt-8">
          <a 
            href="/login" 
            className="inline-block bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Go to Login
          </a>
        </div>
      </div>
    </div>
  )
} 