'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/auth-context'
import { Button } from '@/components/ui'
import { Mail, Lock, AlertCircle, Loader2, Send, Check } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const { signIn } = useAuth()
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
    console.log('Starting authentication with:', email)

    const { error } = await signIn(email, password)
    console.log('SignIn result:', { error })
    
    if (error) {
      console.error('Login error:', error)
      // Provide more user-friendly error messages
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please check your credentials and try again.')
      } else if (error.message.includes('Email not confirmed')) {
        setError('Please verify your email address before signing in.')
      } else if (error.message.includes('User not found')) {
        setError('No account found with this email address.')
      } else if (error.message.includes('network')) {
        setError('Network error. Please check your connection and try again.')
      } else {
        setError(error.message || 'An error occurred during sign in. Please try again.')
      }
      setIsLoading(false)
    } else {
      console.log('Login successful, redirecting to dashboard...')
      setIsLoading(false)
      
      // Check if we have a session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('Current session after login:', session)
      
      // Force session refresh to ensure cookies are set
      const { data: refreshData } = await supabase.auth.refreshSession()
      console.log('Session refresh result:', refreshData)
      
      // Give time for auth state to propagate
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Use router.push for client-side navigation
      console.log('Executing redirect to /dashboard')
      router.push('/dashboard')
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) throw error

      setMagicLinkSent(true)
      setIsLoading(false)
    } catch (error: any) {
      setError(error.message)
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <img 
            src="/nerdy-logo.png" 
            alt="Nerdy" 
            className="h-12 mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-400">Welcome Back</h1>
          <p className="text-purple-600 dark:text-purple-300 mt-2">Sign in to your tutor dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          {!magicLinkSent ? (
            <>
              {/* Toggle between password and magic link */}
              <div className="flex gap-2 mb-6">
                <button
                  type="button"
                  onClick={() => setShowMagicLink(false)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    !showMagicLink 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  Password Login
                </button>
                <button
                  type="button"
                  onClick={() => setShowMagicLink(true)}
                  className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                    showMagicLink 
                      ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  Magic Link
                </button>
              </div>

              <form onSubmit={showMagicLink ? handleMagicLink : handleSubmit} className="space-y-6">
                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}

                {/* Email Field */}
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

                {/* Password Field - only show for password login */}
                {!showMagicLink && (
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
                )}

                {/* Remember Me & Forgot Password - only for password login */}
                {!showMagicLink && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded"
                      />
                      <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Remember me
                      </label>
                    </div>
                    <Link href="/forgot-password" className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                      Forgot password?
                    </Link>
                  </div>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isLoading}
                  variant="gradient"
                  gradientType="nerdy"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin h-5 w-5 mr-2" />
                      {showMagicLink ? 'Sending...' : 'Signing in...'}
                    </>
                  ) : (
                    <>
                      {showMagicLink ? (
                        <>
                          <Send className="h-5 w-5 mr-2" />
                          Send Magic Link
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </>
                  )}
                </Button>
              </form>

              {/* Cookie Warning */}
              {showMagicLink && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <p className="text-xs text-yellow-700 dark:text-yellow-400">
                    <strong>Note:</strong> Magic links work best when cookies are enabled. 
                    If you're having issues, try enabling cookies or using a different browser.
                  </p>
                </div>
              )}
            </>
          ) : (
            /* Magic Link Sent Confirmation */
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                <Check className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Check your email!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We sent a magic link to <strong>{email}</strong>
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Click the link in the email to sign in. The link will expire in 1 hour.
              </p>
              <Button
                variant="ghost"
                className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:text-purple-300 dark:hover:bg-purple-900/20"
                onClick={() => {
                  setMagicLinkSent(false)
                  setShowMagicLink(false)
                }}
              >
                Back to login
              </Button>
            </div>
          )}

          {/* Divider */}
          {!magicLinkSent && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">Or continue with</span>
                </div>
              </div>

              {/* Demo Login */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="solid"
                  className="w-full bg-purple-100 hover:bg-purple-200 text-purple-700 hover:text-purple-800 border border-purple-200 dark:bg-purple-900/30 dark:hover:bg-purple-900/40 dark:text-purple-300 dark:hover:text-purple-200 dark:border-purple-700"
                  onClick={async () => {
                    setEmail('sarah_chen@hotmail.com')
                    setPassword('demo123')
                    setShowMagicLink(false)
                    // Automatically submit the form after setting demo credentials
                    setTimeout(() => {
                      const form = document.querySelector('form') as HTMLFormElement
                      if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                      }
                    }, 100)
                  }}
                >
                  Use Demo Account
                </Button>
                <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                  Demo: sarah_chen@hotmail.com / demo123
                </p>
              </div>

              {/* Sign Up Link */}
              <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link href="/register" className="font-medium text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                  Sign up
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
} 