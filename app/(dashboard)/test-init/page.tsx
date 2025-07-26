'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'

export default function TestInitPage() {
  const [status, setStatus] = useState<any>({})

  useEffect(() => {
    // Check environment variables
    const envCheck = {
      url: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      projectRef: process.env.NEXT_PUBLIC_SUPABASE_URL ? 
        process.env.NEXT_PUBLIC_SUPABASE_URL.split('//')[1].split('.')[0] : 
        'not-found'
    }

    // Try to create client
    let clientStatus = {}
    try {
      const { createClient } = require('@/lib/supabase-browser')
      const supabase = createClient()
      clientStatus = {
        created: true,
        authUrl: supabase.auth.url,
        hasAuth: !!supabase.auth,
        hasFrom: !!supabase.from,
      }
    } catch (err) {
      clientStatus = {
        created: false,
        error: String(err)
      }
    }

    setStatus({
      env: envCheck,
      client: clientStatus,
      window: {
        location: window.location.href,
        protocol: window.location.protocol,
        host: window.location.host
      }
    })
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Supabase Initialization Test</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <pre className="text-xs overflow-auto">
{JSON.stringify(status, null, 2)}
        </pre>
      </div>
      
      <div className="mt-4 space-y-2">
        <a 
          href="/api/check-env" 
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          target="_blank"
        >
          Check Server Environment
        </a>
      </div>
    </div>
  )
} 