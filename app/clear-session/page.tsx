'use client'

import { useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function ClearSessionPage() {
  const router = useRouter()
  
  useEffect(() => {
    async function clearSession() {
      const supabase = createClient()
      await supabase.auth.signOut()
      router.push('/login')
    }
    
    clearSession()
  }, [router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Clearing session...</h1>
        <p className="text-gray-600 dark:text-gray-400">You will be redirected to login shortly.</p>
      </div>
    </div>
  )
} 