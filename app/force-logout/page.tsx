'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function ForceLogoutPage() {
  const [status, setStatus] = useState('Clearing session...')
  const router = useRouter()

  useEffect(() => {
    const clearSession = async () => {
      try {
        // Clear Supabase session
        const supabase = createClient()
        await supabase.auth.signOut()
        setStatus('Supabase session cleared')

        // Clear all cookies
        document.cookie.split(";").forEach((c) => {
          document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        setStatus('All cookies cleared')

        // Clear localStorage
        if (typeof window !== 'undefined') {
          localStorage.clear()
          sessionStorage.clear()
        }
        
        setStatus('Storage cleared. Redirecting to login...')
        
        // Wait a bit then redirect
        setTimeout(() => {
          router.push('/login')
        }, 2000)
        
      } catch (error) {
        setStatus(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    clearSession()
  }, [router])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Force Logout</h1>
        <p className="mb-4">{status}</p>
        <div className="space-y-2 mt-6">
          <a href="/login" className="block text-blue-400 hover:text-blue-300">
            → Go to Login (if not redirected)
          </a>
          <a href="/test" className="block text-blue-400 hover:text-blue-300">
            → Go to Test Page
          </a>
        </div>
      </div>
    </div>
  )
} 