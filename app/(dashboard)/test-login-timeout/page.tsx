'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function TestLoginTimeoutPage() {
  const [status, setStatus] = useState<any>({})
  
  const testLoginWithTimeout = async () => {
    setStatus({ testing: true, message: 'Starting test...' })
    
    try {
      const supabase = createClient()
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Login timeout after 10 seconds')), 10000)
      })
      
      // Create login promise
      const loginPromise = supabase.auth.signInWithPassword({
        email: 'sarah_chen@hotmail.com',
        password: 'demo123',
      })
      
      // Race them
      setStatus({ testing: true, message: 'Attempting login (10s timeout)...' })
      
      const result = await Promise.race([loginPromise, timeoutPromise])
      
      // If we get here, login completed
      const { data, error } = result as any
      
      if (error) {
        setStatus({ 
          success: false, 
          error: error.message,
          code: error.code,
          details: JSON.stringify(error, null, 2)
        })
      } else {
        setStatus({ 
          success: true, 
          user: data.user?.email,
          hasSession: !!data.session,
          message: 'Login completed successfully!'
        })
      }
      
    } catch (err) {
      setStatus({ 
        success: false, 
        error: String(err),
        message: err instanceof Error && err.message.includes('timeout') 
          ? '⏱️ LOGIN IS HANGING - This confirms the issue!'
          : 'Unexpected error'
      })
    }
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Login Timeout Test</h1>
      
      <p className="mb-4 text-gray-600">
        This test will attempt to login with a 10-second timeout. 
        If it times out, we know the auth endpoint is hanging.
      </p>
      
      <button
        onClick={testLoginWithTimeout}
        disabled={status.testing}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {status.testing ? 'Testing...' : 'Test Login (10s timeout)'}
      </button>
      
      {status.message && (
        <div className={`mt-4 p-4 rounded ${
          status.success === false ? 'bg-red-100 text-red-800' : 
          status.success === true ? 'bg-green-100 text-green-800' : 
          'bg-blue-100 text-blue-800'
        }`}>
          <p className="font-bold">{status.message}</p>
          {status.error && (
            <p className="mt-2">Error: {status.error}</p>
          )}
          {status.details && (
            <pre className="mt-2 text-xs overflow-auto">{status.details}</pre>
          )}
        </div>
      )}
      
      <div className="mt-8 space-y-2">
        <a 
          href="/api/test-supabase-connection" 
          target="_blank"
          className="block text-blue-500 hover:underline"
        >
          → Test Supabase Connection (API)
        </a>
        <a 
          href="/test-login-detailed" 
          className="block text-blue-500 hover:underline"
        >
          → Detailed Login Test
        </a>
      </div>
    </div>
  )
} 