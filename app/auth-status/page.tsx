'use client'

import { useAuth } from '@/lib/auth/simple-auth-context'

export default function AuthStatusPage() {
  const { user, tutor, loading } = useAuth()
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-2xl font-bold mb-6">Current Auth Status</h1>
      
      <div className="space-y-4 max-w-2xl">
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Loading State:</h2>
          <p className={loading ? 'text-yellow-400' : 'text-green-400'}>
            {loading ? 'Loading...' : 'Loaded'}
          </p>
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">User:</h2>
          {user ? (
            <pre className="text-sm">{JSON.stringify({
              id: user.id,
              email: user.email,
              authenticated: true
            }, null, 2)}</pre>
          ) : (
            <p className="text-gray-400">No user logged in</p>
          )}
        </div>
        
        <div className="bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Tutor:</h2>
          {tutor ? (
            <pre className="text-sm">{JSON.stringify({
              id: tutor.id,
              name: tutor.name,
              email: tutor.email
            }, null, 2)}</pre>
          ) : (
            <p className="text-gray-400">No tutor profile loaded</p>
          )}
        </div>
        
        <div className="mt-6 space-y-2">
          <p className="text-sm text-gray-400">This page shows the current auth state from SimpleAuthContext</p>
          
          <div className="space-y-2 mt-4">
            <a href="/login" className="block text-blue-400 hover:text-blue-300">
              → Go to Login
            </a>
            <a href="/dashboard" className="block text-blue-400 hover:text-blue-300">
              → Try Dashboard
            </a>
            <a href="/api/force-logout" className="block text-blue-400 hover:text-blue-300">
              → Force Logout
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 