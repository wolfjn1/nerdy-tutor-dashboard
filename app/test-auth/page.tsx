'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function TestAuthPage() {
  const [status, setStatus] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const testConnection = async () => {
    setStatus([])
    setLoading(true)
    addStatus('Testing Supabase connection...')

    try {
      const supabase = createClient()
      addStatus('Supabase client created successfully')

      // Test database connection
      const { data, error } = await supabase.from('tutors').select('count').limit(1)
      if (error) {
        addStatus(`Database connection error: ${error.message}`)
      } else {
        addStatus('Database connection successful')
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        addStatus(`Current session found: ${session.user.email}`)
      } else {
        addStatus('No active session')
      }
    } catch (err: any) {
      addStatus(`Error: ${err.message}`)
    }

    setLoading(false)
  }

  const testLogin = async () => {
    setLoading(true)
    addStatus('Testing login with demo account...')

    try {
      const supabase = createClient()
      
      // Sign out first
      await supabase.auth.signOut()
      addStatus('Signed out any existing session')

      // Try to sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'sarah_chen@hotmail.com',
        password: 'demo123'
      })

      if (error) {
        addStatus(`Login error: ${error.message}`)
      } else {
        addStatus('Login successful!')
        addStatus(`User ID: ${data.user?.id}`)
        addStatus(`Email: ${data.user?.email}`)
        
        // Check for tutor profile
        const { data: tutorData, error: tutorError } = await supabase
          .from('tutors')
          .select('*')
          .eq('auth_user_id', data.user?.id)
          .single()

        if (tutorError) {
          addStatus(`Tutor profile error: ${tutorError.message}`)
        } else {
          addStatus(`Tutor found: ${tutorData.first_name} ${tutorData.last_name}`)
        }
      }
    } catch (err: any) {
      addStatus(`Unexpected error: ${err.message}`)
    }

    setLoading(false)
  }

  const checkEnvironment = () => {
    addStatus('Checking environment variables...')
    addStatus(`NEXT_PUBLIC_SUPABASE_URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}`)
    addStatus(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}`)
    
    if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
      addStatus(`URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6 text-purple-900 dark:text-purple-400">Auth Test Page</h1>
        
        <div className="space-y-4 mb-6">
          <button
            onClick={checkEnvironment}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            Check Environment
          </button>
          
          <button
            onClick={testConnection}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 ml-4"
          >
            Test Connection
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 ml-4"
          >
            Test Login
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Status Log:</h2>
          <div className="space-y-2 font-mono text-sm">
            {status.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">Click a button to start testing...</p>
            ) : (
              status.map((message, index) => (
                <p key={index} className="text-gray-700 dark:text-gray-300">
                  {message}
                </p>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 