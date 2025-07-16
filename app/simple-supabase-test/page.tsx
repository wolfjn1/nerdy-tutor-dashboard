'use client'

import { useState } from 'react'

export default function SimpleSupabaseTest() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const testSupabase = async () => {
    setLoading(true)
    try {
      // Import and create client dynamically
      const { createClient } = await import('@supabase/supabase-js')
      
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        throw new Error('Missing environment variables')
      }
      
      const supabase = createClient(url, key)
      
      // Try a simple query
      const { data, error } = await supabase
        .from('tutors')
        .select('count')
        .limit(1)
      
      setResult({
        success: !error,
        data,
        error: error?.message,
        timestamp: new Date().toISOString()
      })
    } catch (err) {
      setResult({
        success: false,
        error: err instanceof Error ? err.message : 'Unknown error',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Supabase Test</h1>
      <p className="mb-6">Direct Supabase client test without auth context</p>
      
      <button
        onClick={testSupabase}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded mb-6 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>
      
      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
          <pre className="text-sm">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-8 space-y-2">
        <a href="/no-auth-test" className="block text-blue-400 hover:text-blue-300">
          → Back to No Auth Test
        </a>
        <a href="/api/force-logout" className="block text-blue-400 hover:text-blue-300">
          → Force Logout (API)
        </a>
      </div>
    </div>
  )
} 