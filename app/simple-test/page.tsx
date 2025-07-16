'use client'

import { useState, useEffect } from 'react'

export default function SimpleTestPage() {
  const [status, setStatus] = useState<string[]>(['Page loaded'])
  
  const addStatus = (msg: string) => {
    setStatus(prev => [...prev, `${new Date().toISOString()}: ${msg}`])
  }
  
  useEffect(() => {
    addStatus('Component mounted')
    
    // Test basic fetch
    fetch('/api/env-check')
      .then(res => res.json())
      .then(data => addStatus(`Env check: ${JSON.stringify(data)}`))
      .catch(err => addStatus(`Fetch error: ${err.message}`))
  }, [])
  
  const testDirectSupabase = async () => {
    addStatus('Testing direct Supabase connection...')
    
    try {
      // Direct fetch to Supabase without SDK
      const response = await fetch('https://kyldpxoxayemjhxmehkc.supabase.co/rest/v1/tutors?select=count&limit=1', {
        headers: {
          'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''}`
        }
      })
      
      addStatus(`Response status: ${response.status}`)
      
      if (!response.ok) {
        const text = await response.text()
        addStatus(`Response error: ${text}`)
      } else {
        const data = await response.json()
        addStatus(`Response data: ${JSON.stringify(data)}`)
      }
    } catch (error: any) {
      addStatus(`Direct fetch error: ${error.message}`)
    }
  }
  
  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Simple Test Page (No Auth)</h1>
      
      <div className="mb-4">
        <button
          onClick={testDirectSupabase}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Test Direct Supabase Connection
        </button>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Status Log:</h2>
        {status.map((msg, i) => (
          <div key={i} className="text-sm font-mono mb-1">{msg}</div>
        ))}
      </div>
      
      <div className="mt-8">
        <h2 className="font-bold mb-2">Environment Info:</h2>
        <p>NODE_ENV: {process.env.NODE_ENV}</p>
        <p>Has Supabase URL: {!!process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Yes' : 'No'}</p>
        <p>Has Supabase Key: {!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Yes' : 'No'}</p>
      </div>
    </div>
  )
} 