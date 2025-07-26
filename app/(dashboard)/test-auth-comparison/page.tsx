'use client'

import { useState } from 'react'

export default function TestAuthComparisonPage() {
  const [sdkStatus, setSdkStatus] = useState('')
  const [fetchStatus, setFetchStatus] = useState('')

  const testWithSDK = async () => {
    setSdkStatus('Testing with SDK...')
    
    try {
      const { createSimpleClient } = await import('@/lib/supabase-browser-simple')
      const supabase = createSimpleClient()
      
      setSdkStatus('SDK client created, attempting login...')
      
      // Add a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('SDK login timeout after 10s')), 10000)
      })
      
      const loginPromise = supabase.auth.signInWithPassword({
        email: 'sarah_chen@hotmail.com',
        password: 'demo123',
      })
      
      const result = await Promise.race([loginPromise, timeoutPromise]) as any
      
      if (result.error) {
        setSdkStatus(`SDK Error: ${result.error.message}`)
      } else {
        setSdkStatus(`SDK Success! User: ${result.data.user?.email}`)
      }
    } catch (error) {
      setSdkStatus(`SDK Exception: ${String(error)}`)
    }
  }

  const testWithFetch = async () => {
    setFetchStatus('Testing with fetch...')
    
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!url || !key) {
        setFetchStatus('Missing environment variables')
        return
      }
      
      const authUrl = `${url}/auth/v1/token?grant_type=password`
      
      // Add a timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': key,
        },
        body: JSON.stringify({
          email: 'sarah_chen@hotmail.com',
          password: 'demo123',
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (response.ok) {
        const data = await response.json()
        setFetchStatus(`Fetch Success! Token: ${data.access_token?.substring(0, 20)}...`)
      } else {
        const error = await response.text()
        setFetchStatus(`Fetch Error (${response.status}): ${error}`)
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        setFetchStatus('Fetch timeout after 10s')
      } else {
        setFetchStatus(`Fetch Exception: ${String(error)}`)
      }
    }
  }

  const testBoth = async () => {
    setSdkStatus('')
    setFetchStatus('')
    
    // Run both tests in parallel
    await Promise.all([
      testWithSDK(),
      testWithFetch()
    ])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Auth Method Comparison</h1>
      
      <p className="mb-4 text-gray-600">
        Compare Supabase SDK vs direct fetch to identify where the issue is.
      </p>
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={testWithSDK}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test SDK Only
        </button>
        <button
          onClick={testWithFetch}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Test Fetch Only
        </button>
        <button
          onClick={testBoth}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
        >
          Test Both
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="font-bold mb-2">SDK Method:</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded h-32 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm">{sdkStatus || 'Not tested yet'}</pre>
          </div>
        </div>
        
        <div>
          <h2 className="font-bold mb-2">Fetch Method:</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded h-32 overflow-auto">
            <pre className="whitespace-pre-wrap text-sm">{fetchStatus || 'Not tested yet'}</pre>
          </div>
        </div>
      </div>
    </div>
  )
} 