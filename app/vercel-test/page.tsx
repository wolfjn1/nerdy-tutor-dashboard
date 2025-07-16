'use client'

import { useState, useEffect } from 'react'

export default function VercelTest() {
  const [tests, setTests] = useState<any[]>([])
  
  const addTest = (name: string, result: any) => {
    setTests(prev => [...prev, { name, result, timestamp: new Date().toISOString() }])
  }

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    // Test 1: Basic environment
    addTest('Environment', {
      nodeEnv: process.env.NODE_ENV,
      vercel: process.env.VERCEL,
      vercelEnv: process.env.VERCEL_ENV,
      vercelUrl: process.env.VERCEL_URL,
      isProduction: process.env.NODE_ENV === 'production'
    })

    // Test 2: Supabase env vars
    addTest('Supabase Config', {
      hasUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30),
      keyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length
    })

    // Test 3: Network test to Google
    try {
      const start = Date.now()
      const response = await fetch('https://www.google.com/robots.txt')
      const time = Date.now() - start
      addTest('Network Test (Google)', {
        status: response.status,
        time: `${time}ms`,
        ok: response.ok
      })
    } catch (error: any) {
      addTest('Network Test (Google)', { error: error.message })
    }

    // Test 4: Direct Supabase health check
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      try {
        const start = Date.now()
        const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })
        const time = Date.now() - start
        addTest('Supabase Health Check', {
          status: response.status,
          time: `${time}ms`,
          ok: response.ok
        })
      } catch (error: any) {
        addTest('Supabase Health Check', { error: error.message })
      }
    }

    // Test 5: Timeout test
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch('/api/env-check', {
        signal: controller.signal
      })
      clearTimeout(timeoutId)
      
      const data = await response.json()
      addTest('Local API Test', { success: true, data })
    } catch (error: any) {
      addTest('Local API Test', { 
        error: error.name === 'AbortError' ? 'Request timed out after 5s' : error.message 
      })
    }
  }

  const runSupabaseTest = async () => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      addTest('Manual Supabase Test', { error: 'Missing environment variables' })
      return
    }

    try {
      const start = Date.now()
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
          }
        }
      )
      const time = Date.now() - start
      
      addTest('Manual Supabase Test', {
        status: response.status,
        time: `${time}ms`,
        statusText: response.statusText
      })
    } catch (error: any) {
      addTest('Manual Supabase Test', { error: error.message })
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Vercel Deployment Test</h1>
        
        <div className="mb-6 flex gap-4">
          <button
            onClick={runSupabaseTest}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Test Supabase Connection
          </button>
          
          <button
            onClick={() => {
              setTests([])
              runTests()
            }}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Re-run All Tests
          </button>
        </div>

        <div className="space-y-4">
          {tests.map((test, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="font-bold text-lg mb-2">{test.name}</h3>
              <pre className="text-sm overflow-auto bg-gray-100 dark:bg-gray-900 p-3 rounded">
                {JSON.stringify(test.result, null, 2)}
              </pre>
              <p className="text-xs text-gray-500 mt-2">{test.timestamp}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6">
          <h3 className="font-bold mb-2">What to check:</h3>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Environment should show VERCEL=1 and correct VERCEL_ENV</li>
            <li>Supabase Config should show both vars present</li>
            <li>Network Test should complete quickly (&lt;1000ms)</li>
            <li>Supabase Health Check should return status 200</li>
            <li>If Supabase tests timeout, there's a network/firewall issue</li>
          </ul>
        </div>

        <div className="mt-6 text-center">
          <a href="/dashboard-static" className="text-blue-600 hover:text-blue-700">
            Go to Static Dashboard →
          </a>
        </div>
      </div>
    </div>
  )
} 