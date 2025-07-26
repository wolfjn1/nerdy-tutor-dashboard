'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestLoginDetailedPage() {
  const [email, setEmail] = useState('sarah_chen@hotmail.com')
  const [password, setPassword] = useState('demo123')
  const [logs, setLogs] = useState<string[]>([])
  
  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()} - ${message}`])
  }

  const testLogin = async () => {
    setLogs([])
    addLog('Starting login test...')
    
    try {
      addLog('Creating Supabase client...')
      const supabase = createClient()
      addLog('Client created successfully')
      
      addLog('Checking initial session...')
      const { data: { session: initialSession } } = await supabase.auth.getSession()
      addLog(`Initial session: ${initialSession ? 'exists' : 'none'}`)
      
      addLog(`Attempting login with: ${email}`)
      addLog('Calling signInWithPassword...')
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        addLog(`LOGIN ERROR: ${error.message}`)
        addLog(`Error code: ${error.code || 'none'}`)
        addLog(`Error status: ${error.status || 'none'}`)
        return
      }
      
      addLog('Login successful!')
      addLog(`User ID: ${data.user?.id}`)
      addLog(`User email: ${data.user?.email}`)
      addLog(`Has session: ${!!data.session}`)
      
      // Check storage immediately
      addLog('Checking storage...')
      const projectRef = 'kyldpxoxayemjhxmehkc'
      const authKey = `sb-${projectRef}-auth-token`
      
      const localStorageValue = window.localStorage.getItem(authKey)
      const sessionStorageValue = window.sessionStorage.getItem(authKey)
      const cookies = document.cookie
      
      addLog(`LocalStorage ${authKey}: ${localStorageValue ? 'found' : 'not found'}`)
      addLog(`SessionStorage ${authKey}: ${sessionStorageValue ? 'found' : 'not found'}`)
      addLog(`Cookies with 'sb-': ${cookies.includes('sb-') ? 'found' : 'not found'}`)
      
      // Try to get session again
      addLog('Getting session after login...')
      const { data: { session: newSession } } = await supabase.auth.getSession()
      addLog(`Session after login: ${newSession ? 'exists' : 'none'}`)
      
      // Try a test query
      addLog('Testing database query...')
      const { data: tutors, error: queryError } = await supabase
        .from('tutors')
        .select('id, email')
        .limit(1)
      
      if (queryError) {
        addLog(`Query error: ${queryError.message}`)
      } else {
        addLog(`Query successful, found ${tutors?.length || 0} tutors`)
      }
      
    } catch (err) {
      addLog(`EXCEPTION: ${String(err)}`)
      if (err instanceof Error) {
        addLog(`Stack: ${err.stack}`)
      }
    }
  }

  const clearAll = () => {
    localStorage.clear()
    sessionStorage.clear()
    document.cookie.split(";").forEach(c => {
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
    })
    setLogs(['Cleared all storage'])
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Detailed Login Test</h1>
      
      <div className="space-y-4 mb-6">
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
      
      <div className="flex gap-2 mb-6">
        <button
          onClick={testLogin}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Test Login
        </button>
        <button
          onClick={clearAll}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Clear All Storage
        </button>
      </div>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Logs:</h2>
        <div className="space-y-1 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Click "Test Login" to start.</p>
          ) : (
            logs.map((log, i) => (
              <div key={i} className={log.includes('ERROR') ? 'text-red-500' : ''}>
                {log}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
} 