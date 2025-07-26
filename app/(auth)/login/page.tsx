'use client'

import { useState } from 'react'
import { signInWithEmail } from './actions'
import { Button } from '@/components/ui'
import { Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'

export default function SimpleLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const result = await signInWithEmail(email, password)
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // If successful, the server action will redirect
    } catch (err) {
      setError('An unexpected error occurred')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/nerdy-logo.png" 
            alt="Nerdy" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-400">Welcome Back</h1>
          <p className="text-purple-600 dark:text-purple-300 mt-2">Sign in to your tutor dashboard</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                <p className="text-sm">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
                <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 pl-11 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              variant="gradient"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6">
            <Button
              type="button"
              onClick={() => {
                setEmail('sarah_chen@hotmail.com')
                setPassword('demo123')
              }}
              className="w-full"
              variant="outline"
            >
              Use Demo Account
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Demo: sarah_chen@hotmail.com / demo123
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 