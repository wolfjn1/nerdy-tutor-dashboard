'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

export default function FixSessionPage() {
  const [status, setStatus] = useState<any>({})
  const supabase = createClient()
  const router = useRouter()

  const fixSession = async () => {
    try {
      // Get current session from localStorage
      const projectRef = 'kyldpxoxayemjhxmehkc'
      const authKey = `sb-${projectRef}-auth-token`
      
      // Check localStorage
      const localStorageValue = window.localStorage.getItem(authKey)
      
      if (!localStorageValue) {
        setStatus({ error: 'No session found in localStorage. Please login first.' })
        return
      }

      // Parse the session
      const sessionData = JSON.parse(localStorageValue)
      
      // Manually set as cookie
      const cookieValue = encodeURIComponent(localStorageValue)
      const isSecure = window.location.protocol === 'https:'
      
      // Set multiple cookie variations to ensure it works
      document.cookie = `${authKey}=${cookieValue}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
      document.cookie = `${authKey}.0=${cookieValue}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
      document.cookie = `${authKey}.1=${cookieValue}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
      
      // Also try setting individual parts
      if (sessionData.access_token) {
        document.cookie = `sb-access-token=${sessionData.access_token}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
      }
      if (sessionData.refresh_token) {
        document.cookie = `sb-refresh-token=${sessionData.refresh_token}; path=/; max-age=31536000; SameSite=Lax${isSecure ? '; Secure' : ''}`
      }

      // Verify cookies were set
      const cookies = document.cookie
      
      setStatus({
        success: true,
        localStorage: {
          found: true,
          user: sessionData.user?.email
        },
        cookies: {
          set: true,
          hasSbCookie: cookies.includes('sb-'),
          cookieCount: cookies.split('; ').filter(c => c.includes('sb-')).length
        },
        next: 'Cookies have been set. Click below to go to dashboard.'
      })
      
    } catch (err) {
      setStatus({ error: String(err) })
    }
  }

  const goToDashboard = () => {
    // Use hard navigation to ensure cookies are sent
    window.location.href = '/dashboard'
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Fix Session Storage</h1>
      
      <p className="text-gray-600 dark:text-gray-400">
        This page attempts to fix the session storage issue by copying 
        localStorage auth data to cookies.
      </p>
      
      <div className="flex gap-2">
        <button
          onClick={fixSession}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Fix Session
        </button>
        
        {status.success && (
          <button
            onClick={goToDashboard}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Go to Dashboard
          </button>
        )}
      </div>
      
      {status && Object.keys(status).length > 0 && (
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <pre className="text-xs overflow-auto">
{JSON.stringify(status, null, 2)}
          </pre>
        </div>
      )}
      
      <div className="mt-8 p-4 bg-yellow-100 dark:bg-yellow-900 rounded">
        <h2 className="font-bold mb-2">Instructions:</h2>
        <ol className="list-decimal list-inside space-y-1">
          <li>First, login at: /login</li>
          <li>Then come back to this page</li>
          <li>Click "Fix Session" to copy auth from localStorage to cookies</li>
          <li>Click "Go to Dashboard" to test if it worked</li>
        </ol>
      </div>
    </div>
  )
} 