'use client'

import { useState } from 'react'

export default function TestBasicLoginPage() {
  const [status, setStatus] = useState('')

  const testLogin = async () => {
    setStatus('Testing...')
    
    try {
      // Import the safe client
      const { createClientSafe } = await import('@/lib/supabase-client-safe')
      const supabase = createClientSafe()
      
      setStatus('Client created, attempting login...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'sarah_chen@hotmail.com',
        password: 'demo123',
      })
      
      if (error) {
        setStatus(`Error: ${error.message}`)
      } else {
        setStatus(`Success! User: ${data.user?.email}`)
        
        // Check session
        setTimeout(async () => {
          const { data: { session } } = await supabase.auth.getSession()
          setStatus(prev => prev + `\nSession exists: ${!!session}`)
        }, 1000)
      }
    } catch (err) {
      setStatus(`Exception: ${String(err)}`)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Basic Login Test</h1>
      
      <button
        onClick={testLogin}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Test Login
      </button>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <pre className="whitespace-pre-wrap">{status || 'Click to test'}</pre>
      </div>
      
      <div className="mt-4 text-sm text-gray-600">
        <p>Expected: sarah_chen@hotmail.com / demo123</p>
      </div>
    </div>
  )
} 