'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

export default function ForceRefreshPage() {
  const router = useRouter()

  useEffect(() => {
    async function forceRefresh() {
      const supabase = createClient()
      
      // Get current session
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session) {
        // Force a session refresh to ensure cookies are set
        await supabase.auth.refreshSession()
        
        // Small delay to ensure cookies are written
        await new Promise(resolve => setTimeout(resolve, 500))
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    }
    
    forceRefresh()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Refreshing session...</h1>
        <p className="text-gray-600">Please wait while we update your authentication</p>
      </div>
    </div>
  )
} 