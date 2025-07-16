'use client'

import { useEffect, useState } from 'react'

export default function TestSupabasePage() {
  const [results, setResults] = useState<any>({
    loading: true,
    env: null,
    client: null,
    error: null
  })

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Check environment variables
        const env = {
          hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
          hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...'
        }

        // Try to create client
        let clientTest = { created: false, error: null as string | null }
        try {
          const { createClient } = await import('@/lib/supabase-browser')
          const client = createClient()
          clientTest.created = true
          
          // Try to get session
          const { data: { session }, error } = await client.auth.getSession()
          if (error) {
            clientTest.error = error.message
          } else {
            clientTest = {
              ...clientTest,
              hasSession: !!session,
              sessionUser: session?.user?.email
            }
          }
        } catch (e) {
          clientTest.error = e instanceof Error ? e.message : 'Unknown error'
        }

        setResults({
          loading: false,
          env,
          client: clientTest,
          error: null
        })
      } catch (error) {
        setResults({
          loading: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
      
      {results.loading ? (
        <p>Testing Supabase connection...</p>
      ) : (
        <div className="space-y-4">
          <div className="bg-gray-800 p-4 rounded">
            <h2 className="font-semibold mb-2">Environment Variables:</h2>
            <pre className="text-sm">{JSON.stringify(results.env, null, 2)}</pre>
          </div>

          <div className="bg-gray-800 p-4 rounded">
            <h2 className="font-semibold mb-2">Client Test:</h2>
            <pre className="text-sm">{JSON.stringify(results.client, null, 2)}</pre>
          </div>

          {results.error && (
            <div className="bg-red-900/20 border border-red-700 p-4 rounded">
              <h2 className="font-semibold mb-2">Error:</h2>
              <p className="text-sm">{results.error}</p>
            </div>
          )}

          <div className="mt-6 space-y-2">
            <a href="/api/test-supabase" className="block text-blue-400 hover:text-blue-300">
              → Check API Route Test
            </a>
            <a href="/status" className="block text-blue-400 hover:text-blue-300">
              → Go to Status Page
            </a>
            <a href="/login" className="block text-blue-400 hover:text-blue-300">
              → Try Login Page
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 