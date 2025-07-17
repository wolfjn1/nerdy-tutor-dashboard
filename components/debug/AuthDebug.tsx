'use client'

import { useAuth } from '@/lib/auth/simple-auth-context'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export function AuthDebug() {
  const { user, tutor, loading } = useAuth()
  const [sessionData, setSessionData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    const checkSession = async () => {
      try {
        const supabase = createClient()
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          setError(error.message)
        }
        
        setSessionData({
          hasSession: !!session,
          userId: session?.user?.id,
          email: session?.user?.email,
          expiresAt: session?.expires_at,
          provider: session?.user?.app_metadata?.provider
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      }
    }
    
    checkSession()
  }, [])
  
  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black/80 text-white text-xs rounded-lg max-w-sm">
      <h3 className="font-bold mb-2">Auth Debug</h3>
      <div className="space-y-1">
        <div>Loading: {String(loading)}</div>
        <div>User: {user ? user.email : 'null'}</div>
        <div>Tutor: {tutor ? tutor.name : 'null'}</div>
        <div>Session: {sessionData ? JSON.stringify(sessionData, null, 2) : 'checking...'}</div>
        {error && <div className="text-red-400">Error: {error}</div>}
        <div className="mt-2 text-gray-400">
          <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing'}</div>
          <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Missing'}</div>
        </div>
      </div>
    </div>
  )
} 