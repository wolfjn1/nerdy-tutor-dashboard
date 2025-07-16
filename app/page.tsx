'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/simple-auth-context'

export default function RootPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.push('/dashboard')
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center">
      <div className="text-purple-600 dark:text-purple-400">Loading...</div>
    </div>
  )
} 