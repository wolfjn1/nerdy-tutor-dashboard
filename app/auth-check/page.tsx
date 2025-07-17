'use client'

import { useAuth } from '@/lib/auth/simple-auth-context'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function AuthCheckPage() {
  const { user, tutor, loading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  
  useEffect(() => {
    async function checkSession() {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      setSessionData(session)
    }
    checkSession()
  }, [])
  
  return (
    <div className="p-8 bg-white dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Authentication Check</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Context Status:</h2>
          <p>Loading: {loading ? 'Yes' : 'No'}</p>
          <p>User: {user ? user.email : 'None'}</p>
          <p>User ID: {user?.id || 'None'}</p>
          <p>Tutor: {tutor ? `${tutor.first_name} ${tutor.last_name}` : 'None'}</p>
          <p>Tutor ID: {tutor?.id || 'None'}</p>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Direct Session Check:</h2>
          <p>Session: {sessionData ? 'Active' : 'None'}</p>
          <p>Session User: {sessionData?.user?.email || 'None'}</p>
          <p>Session Expires: {sessionData?.expires_at || 'N/A'}</p>
        </div>
        
        <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded">
          <h2 className="font-bold mb-2">Next Steps:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Add your Netlify URL to Supabase allowed URLs</li>
            <li>Clear browser cookies and cache</li>
            <li>Try logging in again</li>
            <li>If auth works, both sections above should show user data</li>
          </ol>
        </div>
        
        <div className="flex gap-4">
          <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Go to Login
          </a>
          <a href="/dashboard" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
            Go to Dashboard
          </a>
          <a href="/clear-session" className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Clear Session
          </a>
        </div>
      </div>
    </div>
  )
} 