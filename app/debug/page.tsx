'use client'

import { useEffect, useState } from 'react'

export default function DebugPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkHealth() {
      try {
        const response = await fetch('/api/health')
        const data = await response.json()
        setStatus(data)
      } catch (error: any) {
        setStatus({ error: error.message })
      } finally {
        setLoading(false)
      }
    }
    
    checkHealth()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">Environment Status</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-sm">
              {JSON.stringify(status, null, 2)}
            </pre>
          )}
          
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Client-side Environment</h3>
            <div className="space-y-1 text-sm">
              <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}</p>
              <p>Supabase Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}</p>
              <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not available'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 