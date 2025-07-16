'use client'

import { useState } from 'react'

export default function AuthTestPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  
  const testAuth = async () => {
    setLoading(true)
    setResult(null)
    
    try {
      const response = await fetch('/api/test-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'sarah_chen@hotmail.com',
          password: 'demo123'
        })
      })
      
      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({
        success: false,
        error: 'Network error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setLoading(false)
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Direct Auth Test</h1>
      <p className="mb-6">This tests authentication directly without the auth context</p>
      
      <button
        onClick={testAuth}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded mb-6 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Demo Login'}
      </button>
      
      {result && (
        <div className={`p-4 rounded ${result.success ? 'bg-green-900/20 border border-green-700' : 'bg-red-900/20 border border-red-700'}`}>
          <h2 className="font-semibold mb-2">Result:</h2>
          <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
      
      <div className="mt-8 bg-gray-800 p-4 rounded">
        <h2 className="font-semibold mb-2">What this tests:</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Direct Supabase connection</li>
          <li>Authentication with demo credentials</li>
          <li>Tutor profile lookup</li>
          <li>No auth context wrapper</li>
        </ul>
      </div>
      
      <div className="mt-6 space-y-2">
        <a href="/no-auth-test" className="block text-blue-400 hover:text-blue-300">
          → Back to No Auth Test
        </a>
        <a href="/simple-supabase-test" className="block text-blue-400 hover:text-blue-300">
          → Simple Supabase Test
        </a>
      </div>
    </div>
  )
} 