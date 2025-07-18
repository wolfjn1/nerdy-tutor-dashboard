'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-nerdy-bg-light dark:bg-gray-900">
      <div className="text-center space-y-4 p-8">
        <h1 className="text-4xl font-bold text-purple-900 dark:text-purple-400">Oops! Something went wrong</h1>
        <p className="text-gray-600 dark:text-gray-400">We encountered an unexpected error.</p>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg max-w-md mx-auto">
          <p className="font-mono text-sm mb-4">{error.message || 'Unknown error occurred'}</p>
          {error.digest && (
            <p className="text-xs text-gray-500">Error ID: {error.digest}</p>
          )}
        </div>
        
        <div className="space-x-4">
          <Button
            onClick={reset}
            variant="gradient"
            gradientType="nerdy"
          >
            Try Again
          </Button>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  )
} 