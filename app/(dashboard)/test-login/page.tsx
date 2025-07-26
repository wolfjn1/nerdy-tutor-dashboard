'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function TestLoginPage() {
  const [email, setEmail] = useState('sarah_chen@hotmail.com')
  const [password, setPassword] = useState('demo123')
  const [result, setResult] = useState<any>(null)
  const supabase = createClient()

  const testLogin = async () => {
    setResult({ status: 'logging in...' })
    
    try {
      // Sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        setResult({ error: error.message })
        return
      }
      
      // Get session
      const { data: { session } } = await supabase.auth.getSession()
      
      // Check storage
      const localStorage = window.localStorage.getItem(`sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`)
      const cookies = document.cookie
      
      setResult({
        signIn: {
          success: true,
          user: data.user?.email,
          hasSession: !!data.session,
        },
        currentSession: {
          exists: !!session,
          user: session?.user?.email,
        },
        storage: {
          localStorage: !!localStorage,
          cookies: cookies.includes('sb-'),
          allCookies: cookies
        }
      })
    } catch (err) {
      setResult({ error: String(err) })
    }
  }

  const testLogout = async () => {
    await supabase.auth.signOut()
    setResult({ status: 'logged out' })
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Login Test</h1>
      
      <div className="space-y-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Email"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Password"
        />
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button
          onClick={testLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
      
      {result && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <pre className="text-xs overflow-auto">
{JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  )
} 