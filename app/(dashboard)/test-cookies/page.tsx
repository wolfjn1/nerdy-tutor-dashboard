'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function TestCookiesPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function checkCookies() {
      try {
        // Get all cookies
        const allCookies = document.cookie.split('; ').map(c => {
          const [name, value] = c.split('=')
          return { name, value: value?.substring(0, 20) + '...' }
        })

        // Check Supabase auth
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const { data: { user } } = await supabase.auth.getUser()

        // Check localStorage
        const localStorageKeys = Object.keys(localStorage)
        const supabaseLocalStorage = localStorageKeys
          .filter(key => key.includes('supabase'))
          .map(key => ({ key, value: localStorage.getItem(key)?.substring(0, 50) + '...' }))

        // Check sessionStorage  
        const sessionStorageKeys = Object.keys(sessionStorage)
        const supabaseSessionStorage = sessionStorageKeys
          .filter(key => key.includes('supabase'))
          .map(key => ({ key, value: sessionStorage.getItem(key)?.substring(0, 50) + '...' }))

        setData({
          cookies: {
            all: allCookies,
            supabase: allCookies.filter(c => c.name.includes('supabase'))
          },
          localStorage: {
            keys: localStorageKeys,
            supabase: supabaseLocalStorage
          },
          sessionStorage: {
            keys: sessionStorageKeys,
            supabase: supabaseSessionStorage
          },
          auth: {
            hasSession: !!session,
            userId: session?.user?.id,
            userEmail: session?.user?.email,
            hasUser: !!user
          }
        })
      } catch (error) {
        setData({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }

    checkCookies()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Cookie & Storage Debug</h1>
      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
} 