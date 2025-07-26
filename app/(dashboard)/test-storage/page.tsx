'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function TestStoragePage() {
  const [storageData, setStorageData] = useState<any>({})
  const supabase = createClient()

  useEffect(() => {
    async function checkStorage() {
      // Get all cookies
      const cookies = document.cookie.split('; ').reduce((acc: any, cookie) => {
        const [name, value] = cookie.split('=')
        if (name && name.includes('sb-')) {
          acc[name] = value ? decodeURIComponent(value).substring(0, 50) + '...' : ''
        }
        return acc
      }, {})

      // Get all localStorage
      const localStorage: any = {}
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i)
        if (key && key.includes('sb-')) {
          const value = window.localStorage.getItem(key) || ''
          localStorage[key] = value.substring(0, 50) + '...'
        }
      }

      // Get session from Supabase
      const { data: { session } } = await supabase.auth.getSession()
      
      setStorageData({
        cookies,
        localStorage,
        hasSession: !!session,
        sessionUser: session?.user?.email
      })
    }

    checkStorage()
  }, [])

  const forceSetCookie = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      // Force set the auth token as a cookie
      const authKey = `sb-${process.env.NEXT_PUBLIC_SUPABASE_URL!.split('//')[1].split('.')[0]}-auth-token`
      const sessionData = JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_at: session.expires_at,
        token_type: 'bearer',
        user: session.user
      })
      
      document.cookie = `${authKey}=${encodeURIComponent(sessionData)}; path=/; max-age=31536000; SameSite=None; Secure`
      alert('Cookie set! Refresh the page.')
    }
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Storage Test</h1>
      
      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Session Status:</h2>
        <p>Has Session: {storageData.hasSession ? 'Yes' : 'No'}</p>
        <p>User: {storageData.sessionUser || 'None'}</p>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">Cookies (sb-*):</h2>
        <pre className="text-xs overflow-auto">
{JSON.stringify(storageData.cookies || {}, null, 2)}
        </pre>
      </div>

      <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
        <h2 className="font-bold mb-2">LocalStorage (sb-*):</h2>
        <pre className="text-xs overflow-auto">
{JSON.stringify(storageData.localStorage || {}, null, 2)}
        </pre>
      </div>

      <button 
        onClick={forceSetCookie}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Force Set Auth Cookie
      </button>
    </div>
  )
} 