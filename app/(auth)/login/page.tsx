'use client'

import { useState } from 'react'
import { signInWithEmail } from './actions'
import Link from 'next/link'
import { Button, Card } from '@/components/ui'
import { Mail, Lock, AlertCircle, Loader2, Send, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [magicLinkSent, setMagicLinkSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validate fields
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    
    if (!password.trim()) {
      setError('Please enter your password.')
      return
    }
    
    setIsLoading(true)

    try {
      const result = await signInWithEmail(email, password)
      if (result?.error) {
        // Provide more user-friendly error messages
        if (result.error.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.')
        } else if (result.error.includes('Email not confirmed')) {
          setError('Please verify your email address before signing in.')
        } else if (result.error.includes('User not found')) {
          setError('No account found with this email address.')
        } else {
          setError(result.error)
        }
        setIsLoading(false)
      }
      // If successful, the server action will redirect
    } catch (err) {
      console.error('Login error:', err)
      setError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (!email.trim()) {
      setError('Please enter your email address.')
      return
    }
    
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`
        }
      })

      if (error) {
        setError(error.message)
      } else {
        setMagicLinkSent(true)
      }
    } catch (err) {
      console.error('Magic link error:', err)
      setError('Failed to send magic link. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Demo account handler
  const fillDemoAccount = () => {
    setEmail('sarah_chen@hotmail.com')
    setPassword('demo123')
    setError('')
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Welcome */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center justify-center mb-4">
            <img 
              src="/nerdy-logo.png" 
              alt="Nerdy" 
              className="h-12"
            />
          </Link>
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-400">Welcome Back</h1>
          <p className="text-purple-600 dark:text-purple-300 mt-2">Sign in to your tutor dashboard</p>
        </div>

        <Card className="p-8">
          {/* Toggle between password and magic link */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-6">
            <button
              type="button"
              onClick={() => setShowMagicLink(false)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                !showMagicLink 
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Password
            </button>
            <button
              type="button"
              onClick={() => setShowMagicLink(true)}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                showMagicLink 
                  ? 'bg-white dark:bg-gray-700 text-purple-600 dark:text-purple-400 shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              Magic Link
            </button>
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-6 p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {!showMagicLink ? (
            // Password login form
            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-purple-600 dark:text-purple-400 hover:underline">
                  Forgot password?
                </Link>
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
          ) : (
            // Magic link form
            magicLinkSent ? (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mb-4">
                  <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Check your email!</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  We've sent a magic link to <strong>{email}</strong>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setMagicLinkSent(false)
                    setShowMagicLink(false)
                  }}
                >
                  Back to login
                </Button>
              </div>
            ) : (
              <form onSubmit={handleMagicLink} className="space-y-4">
                <div>
                  <label htmlFor="magic-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="magic-email"
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

                <Button
                  type="submit"
                  className="w-full"
                  variant="gradient"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending magic link...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </form>
            )
          )}

          {/* Demo account button */}
          {!magicLinkSent && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or</span>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                className="w-full mt-4"
                onClick={fillDemoAccount}
              >
                Use Demo Account
              </Button>
              <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
                Demo: sarah_chen@hotmail.com / demo123
              </p>
            </div>
          )}
        </Card>

        {/* Sign up link */}
        <p className="text-center mt-6 text-sm text-gray-600 dark:text-gray-400">
          Don't have an account?{' '}
          <Link href="/register" className="text-purple-600 dark:text-purple-400 hover:underline font-medium">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
} 