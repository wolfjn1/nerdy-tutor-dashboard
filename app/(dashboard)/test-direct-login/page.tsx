'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function TestDirectLoginPage() {
  const [email, setEmail] = useState('sarah_chen@hotmail.com')
  const [password, setPassword] = useState('demo123')
  const [status, setStatus] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDirectLogin = async () => {
    setLoading(true)
    setStatus({ message: 'Starting login...' })
    
    try {
      // Direct sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setStatus({ 
          error: error.message,
          details: error
        })
        setLoading(false)
        return
      }
      
      setStatus({
        message: 'Login successful!',
        user: data.user?.email,
        session: {
          access_token: data.session?.access_token ? 'Present' : 'Missing',
          refresh_token: data.session?.refresh_token ? 'Present' : 'Missing',
          expires_at: data.session?.expires_at
        }
      })
      
      // Wait a moment for session to establish
      setTimeout(() => {
        setStatus((prev: any) => ({ ...prev, message: 'Redirecting...' }))
        router.push('/dashboard')
      }, 2000)
      
    } catch (err: any) {
      setStatus({ 
        error: 'Unexpected error',
        details: err.message 
      })
      setLoading(false)
    }
  }
  
  const checkSession = async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    setStatus((prev: any) => ({
      ...prev,
      currentSession: session ? {
        user: session.user?.email,
        expires: new Date(session.expires_at! * 1000).toLocaleString()
      } : 'No session'
    }))
  }
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Direct Login Test</h1>
      
      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded dark:bg-gray-800"
          />
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={handleDirectLogin}
            disabled={loading}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Direct Login'}
          </button>
          
          <button
            onClick={checkSession}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
          >
            Check Session
          </button>
        </div>
      </div>
      
      <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="font-bold mb-2">Status:</h2>
        <pre className="text-xs whitespace-pre-wrap">{JSON.stringify(status, null, 2)}</pre>
      </div>
      
      <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900 rounded">
        <p className="text-sm">This bypasses the auth context and uses Supabase client directly.</p>
      </div>
    </div>
  )
} 