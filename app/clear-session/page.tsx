'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'

export default function ClearSessionPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function clearSession() {
      console.log('Clearing session...')
      await supabase.auth.signOut()
      
      // Clear any local storage or session storage
      if (typeof window !== 'undefined') {
        localStorage.clear()
        sessionStorage.clear()
      }
      
      console.log('Session cleared, redirecting to login...')
      router.push('/login')
    }
    
    clearSession()
  }, [router, supabase])

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center">
      <div className="text-purple-600 dark:text-purple-400">Clearing session...</div>
    </div>
  )
} 