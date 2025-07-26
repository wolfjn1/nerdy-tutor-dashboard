'use client'

import { useState } from 'react'

export default function TestDirectAuthPage() {
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const testDirectAuth = async () => {
    setLoading(true)
    setStatus('Starting direct auth test...')
    
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey) {
        setStatus('Error: Missing environment variables')
        return
      }
      
      setStatus('Environment variables loaded, attempting auth...')
      
      // Direct API call to Supabase auth
      const authUrl = `${supabaseUrl}/auth/v1/token?grant_type=password`
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseKey,
        },
        body: JSON.stringify({
          email: 'sarah_chen@hotmail.com',
          password: 'demo123',
        }),
      })
      
      const responseText = await response.text()
      
      setStatus(`Response Status: ${response.status}\n${responseText}`)
      
      if (response.ok) {
        const data = JSON.parse(responseText)
        setStatus(prev => prev + `\n\nSuccess! Access token: ${data.access_token?.substring(0, 20)}...`)
      }
      
    } catch (error) {
      setStatus(`Error: ${String(error)}`)
      console.error('Direct auth error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Direct Auth Test (No SDK)</h1>
      
      <p className="mb-4 text-gray-600">
        This test bypasses the Supabase SDK and calls the auth API directly using fetch.
      </p>
      
      <button
        onClick={testDirectAuth}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50 mb-4"
      >
        {loading ? 'Testing...' : 'Test Direct Auth'}
      </button>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <pre className="whitespace-pre-wrap text-sm">{status || 'Click to test'}</pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not loaded'}</p>
        <p>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Loaded' : 'Not loaded'}</p>
      </div>
    </div>
  )
} 