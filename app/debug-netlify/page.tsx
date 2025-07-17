'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useAuth } from '@/lib/auth/simple-auth-context'

export default function NetlifyDebugPage() {
  const [envVars, setEnvVars] = useState<any>(null)
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null)
  const [authStatus, setAuthStatus] = useState<any>(null)
  const { user, tutor } = useAuth()

  useEffect(() => {
    // Check environment variables
    setEnvVars({
      hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      url: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...'
    })

    // Test Supabase connection
    async function testSupabase() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from('tutors').select('count').single()
        setSupabaseStatus({
          connected: !error,
          error: error?.message || null
        })
      } catch (err: any) {
        setSupabaseStatus({
          connected: false,
          error: err.message
        })
      }
    }

    testSupabase()
  }, [])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Netlify Debug Page</h1>
      
      <div className="space-y-6">
        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Environment Variables</h2>
          <pre className="text-sm">{JSON.stringify(envVars, null, 2)}</pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Supabase Connection</h2>
          <pre className="text-sm">{JSON.stringify(supabaseStatus, null, 2)}</pre>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Auth Status</h2>
          <div className="space-y-2">
            <p>User: {user ? user.email : 'Not logged in'}</p>
            <p>Tutor: {tutor ? tutor.name : 'No tutor profile'}</p>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Navigation Links</h2>
          <div className="space-y-2">
            <a href="/dashboard" className="block text-blue-400 hover:text-blue-300">Dashboard</a>
            <a href="/students" className="block text-blue-400 hover:text-blue-300">Students</a>
            <a href="/sessions" className="block text-blue-400 hover:text-blue-300">Sessions</a>
            <a href="/settings" className="block text-blue-400 hover:text-blue-300">Settings</a>
          </div>
        </div>
      </div>
    </div>
  )
} 