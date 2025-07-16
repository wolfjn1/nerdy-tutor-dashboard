'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to console
    console.error('Global error boundary caught:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
        
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold mb-2">Error Details:</h3>
          <p className="font-mono text-sm mb-4">{error.message}</p>
          
          {error.stack && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                Show stack trace
              </summary>
              <pre className="mt-2 text-xs overflow-auto bg-black/50 p-4 rounded">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-4">
          <button
            onClick={reset}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded transition-colors"
          >
            Try again
          </button>
          
          <div className="text-sm text-gray-400">
            <p>Possible causes:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Missing environment variables (Supabase URL/Key)</li>
              <li>Network connectivity issues</li>
              <li>Invalid Supabase configuration</li>
              <li>Database connection problems</li>
            </ul>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-sm text-gray-400 mb-2">Debug Information:</p>
            <div className="text-xs font-mono bg-black/30 p-3 rounded">
              <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL ? '✓ Set' : '✗ Missing'}</div>
              <div>Key: {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✓ Set' : '✗ Missing'}</div>
              <div>Environment: {process.env.NODE_ENV}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 