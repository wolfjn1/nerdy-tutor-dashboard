'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  useEffect(() => {
    // Simply redirect to dashboard - let the dashboard handle auth
    router.push('/dashboard')
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center">
      <div className="text-purple-600 dark:text-purple-400">Redirecting...</div>
    </div>
  )
} 