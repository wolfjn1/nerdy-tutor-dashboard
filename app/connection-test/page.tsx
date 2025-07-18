'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function ConnectionTest() {
  const [results, setResults] = useState<any>({})
  const [testing, setTesting] = useState(true)

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    setTesting(true)
    const testResults: any = {}

    // Test 1: Basic connectivity
    const start1 = Date.now()
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      testResults.apiHealth = {
        success: true,
        time: Date.now() - start1,
        data
      }
    } catch (error) {
      testResults.apiHealth = {
        success: false,
        time: Date.now() - start1,
        error: error.message
      }
    }

    // Test 2: Supabase connection
    const start2 = Date.now()
    try {
      const supabase = createClient()
      const { data, error } = await supabase.auth.getSession()
      testResults.supabaseAuth = {
        success: !error,
        time: Date.now() - start2,
        hasSession: !!data?.session,
        error: error?.message
      }
    } catch (error) {
      testResults.supabaseAuth = {
        success: false,
        time: Date.now() - start2,
        error: error.message
      }
    }

    // Test 3: Database query
    const start3 = Date.now()
    try {
      const supabase = createClient()
      const { count, error } = await supabase
        .from('tutors')
        .select('*', { count: 'exact', head: true })
      
      testResults.database = {
        success: !error,
        time: Date.now() - start3,
        error: error?.message
      }
    } catch (error) {
      testResults.database = {
        success: false,
        time: Date.now() - start3,
        error: error.message
      }
    }

    // Test 4: Network info
    testResults.network = {
      online: navigator.onLine,
      connection: (navigator as any).connection?.effectiveType || 'unknown',
      userAgent: navigator.userAgent
    }

    setResults(testResults)
    setTesting(false)
  }

  const getStatusColor = (success: boolean) => success ? 'text-green-600' : 'text-red-600'
  const getTimeColor = (time: number) => {
    if (time < 500) return 'text-green-600'
    if (time < 2000) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Connection Test</h1>
        
        {testing ? (
          <div className="bg-white p-8 rounded-lg shadow">
            <p className="text-lg">Running connection tests...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* API Health */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">API Health Check</h2>
              <p className={getStatusColor(results.apiHealth?.success)}>
                Status: {results.apiHealth?.success ? '✅ Connected' : '❌ Failed'}
              </p>
              <p className={getTimeColor(results.apiHealth?.time)}>
                Response Time: {results.apiHealth?.time}ms
              </p>
              {results.apiHealth?.error && (
                <p className="text-red-600 mt-2">Error: {results.apiHealth.error}</p>
              )}
            </div>

            {/* Supabase Auth */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Supabase Authentication</h2>
              <p className={getStatusColor(results.supabaseAuth?.success)}>
                Status: {results.supabaseAuth?.success ? '✅ Connected' : '❌ Failed'}
              </p>
              <p className={getTimeColor(results.supabaseAuth?.time)}>
                Response Time: {results.supabaseAuth?.time}ms
              </p>
              <p>Session: {results.supabaseAuth?.hasSession ? '✅ Active' : '❌ None'}</p>
              {results.supabaseAuth?.error && (
                <p className="text-red-600 mt-2">Error: {results.supabaseAuth.error}</p>
              )}
            </div>

            {/* Database */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
              <p className={getStatusColor(results.database?.success)}>
                Status: {results.database?.success ? '✅ Connected' : '❌ Failed'}
              </p>
              <p className={getTimeColor(results.database?.time)}>
                Query Time: {results.database?.time}ms
              </p>
              {results.database?.error && (
                <p className="text-red-600 mt-2">Error: {results.database.error}</p>
              )}
            </div>

            {/* Network Info */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">Network Information</h2>
              <p>Online: {results.network?.online ? '✅ Yes' : '❌ No'}</p>
              <p>Connection Type: {results.network?.connection}</p>
              <details className="mt-2">
                <summary className="cursor-pointer text-blue-600">User Agent</summary>
                <p className="mt-2 text-sm text-gray-600">{results.network?.userAgent}</p>
              </details>
            </div>

            {/* Recommendations */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-xl font-semibold mb-4">Recommendations</h2>
              {results.apiHealth?.time > 2000 && (
                <p>⚠️ Slow API response. Check your network connection.</p>
              )}
              {results.supabaseAuth?.time > 3000 && (
                <p>⚠️ Slow Supabase connection. May experience loading delays.</p>
              )}
              {!results.supabaseAuth?.success && (
                <p>🔴 Cannot connect to Supabase. Check if firewall is blocking *.supabase.co</p>
              )}
              {results.network?.connection === 'slow-2g' && (
                <p>⚠️ Very slow network detected. Experience may be degraded.</p>
              )}
            </div>

            <button
              onClick={runTests}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Run Tests Again
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 