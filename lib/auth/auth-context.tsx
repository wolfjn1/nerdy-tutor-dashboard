'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { AuthStorageAdapter } from './storage-adapter'
import { TokenAuthManager } from './token-auth'
import { useTutorStore } from '@/lib/stores/tutorStore'

interface AuthContextType {
  user: User | null
  tutor: any | null
  loading: boolean
  storageWarning: string | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<{ error: Error | null }>
  refreshAuth: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tutor: null,
  loading: true,
  storageWarning: null,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
  refreshAuth: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tutor, setTutor] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageWarning, setStorageWarning] = useState<string | null>(null)
  const router = useRouter()
  const storageAdapter = new AuthStorageAdapter()
  const tokenManager = new TokenAuthManager()
  const supabase = createClient()
  
  // Get setTutor and reset from the global store
  const setTutorInStore = useTutorStore((state) => state.setTutor)
  const resetStore = useTutorStore((state) => state.reset)

  // Fetch tutor profile when user changes
  const fetchTutorProfile = async (userId: string) => {
    try {
      console.log('[Auth] Fetching tutor profile for user:', userId)
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', userId)
        .single()

      if (error) {
        console.log('[Auth] Error fetching tutor profile:', error)
        
        // If no tutor exists, don't create one automatically
        if (error.code === 'PGRST116') {
          console.log('[Auth] No tutor record found for user:', userId)
          setTutor(null)
          return null
        }
        
        throw error
      }

      console.log('[Auth] Tutor profile loaded:', data)
      setTutor(data)
      setTutorInStore(data)
      return data
    } catch (error) {
      console.error('[Auth] Error in fetchTutor:', error)
      setTutor(null)
      return null
    }
  }

  // Check for URL-based token (for extreme cases)
  const checkUrlToken = async () => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    
    if (token) {
      try {
        // Verify token with backend
        const { data, error } = await supabase.auth.getUser(token)
        if (!error && data.user) {
          setUser(data.user)
          await fetchTutorProfile(data.user.id)
          
          // Clean URL
          window.history.replaceState({}, document.title, window.location.pathname)
          
          setStorageWarning('Using URL-based authentication. Sessions will not persist. Please enable cookies.')
        }
      } catch (error) {
        console.error('Invalid URL token:', error)
      }
    }
  }

  // Check for existing session
  const initializeAuth = async () => {
    try {
      console.log('[Auth] Initializing auth...')
      console.log('[Auth] Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
      console.log('[Auth] Has Anon Key:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      
      // Add a small delay to ensure cookies are ready (helps with Vercel)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      // First try normal session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('[Auth] Session error:', sessionError)
        // Don't throw, continue with no session
      }
      
      console.log('[Auth] Session found:', !!session, session?.user?.id)
      
      if (session) {
        setUser(session.user)
        const tutorData = await fetchTutorProfile(session.user.id)
        console.log('[Auth] After fetchTutorProfile, tutor data:', tutorData)
      } else {
        // Check for stored tokens
        const tokens = await tokenManager.getTokens()
        if (tokens && !await tokenManager.isTokenExpired()) {
          const { data: { user } } = await supabase.auth.getUser(tokens.access_token)
          if (user) {
            setUser(user)
            await fetchTutorProfile(user.id)
          }
        } else {
          // Last resort: check URL token
          await checkUrlToken()
        }
      }
    } catch (error) {
      console.error('[Auth] Error initializing auth:', error)
      // If error, just proceed without auth
      setUser(null)
      setTutor(null)
    } finally {
      // Always set loading to false to prevent infinite loading
      console.log('[Auth] Setting loading to false')
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check storage capabilities
    const storageInfo = tokenManager.getStorageInfo()
    setStorageWarning(storageInfo.warning)

    // Initialize auth on mount
    initializeAuth()

    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUser(session.user)
        await fetchTutorProfile(session.user.id)
        
        // Store tokens for fallback
        if (session.access_token && session.refresh_token) {
          await tokenManager.storeTokens({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            expires_at: session.expires_at || Math.floor(Date.now() / 1000) + 3600,
            token_type: 'Bearer'
          })
        }
      } else {
        setUser(null)
        setTutor(null)
        await tokenManager.clearTokens()
      }
      
      if (event === 'SIGNED_OUT') {
        router.push('/login')
      }
      
      // Redirect to dashboard on sign in if we're on a public page
      if (event === 'SIGNED_IN' && session) {
        const publicPages = ['/login', '/register', '/forgot-password']
        if (publicPages.includes(window.location.pathname)) {
          router.push('/dashboard')
        }
      }
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [router])

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        setUser(data.user)  // Set the user state
        await fetchTutorProfile(data.user.id)
        
        // Store tokens for fallback
        if (data.session) {
          await tokenManager.storeTokens({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
            token_type: 'Bearer'
          })
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    try {
      // Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      if (authData.user) {
        // Create tutor profile
        const { error: profileError } = await supabase
          .from('tutors')
          .insert({
            auth_user_id: authData.user.id,
            email,
            first_name: firstName,
            last_name: lastName,
            // Set some defaults
            hourly_rate: 50,
            subjects: [],
            rating: 0,
            total_earnings: 0,
            total_hours: 0,
            is_verified: false,
            badges: [],
          })

        if (profileError) throw profileError

        await fetchTutorProfile(authData.user.id)
        
        // Store tokens if available
        if (authData.session) {
          await tokenManager.storeTokens({
            access_token: authData.session.access_token,
            refresh_token: authData.session.refresh_token,
            expires_at: authData.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
            token_type: 'Bearer'
          })
        }
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    await tokenManager.clearTokens()
    setUser(null)
    setTutor(null)
    resetStore() // Clear the tutor store
    router.push('/login')
  }

  const updateProfile = async (updates: any) => {
    try {
      if (!tutor?.id) throw new Error('No tutor profile found')

      const { error } = await supabase
        .from('tutors')
        .update(updates)
        .eq('id', tutor.id)

      if (error) throw error

      // Refresh tutor data
      if (user) {
        await fetchTutorProfile(user.id)
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // Force refresh auth state
  const refreshAuth = async () => {
    console.log('[Auth] Force refreshing auth...')
    setLoading(true)
    await initializeAuth()
  }

  const value = {
    user,
    tutor,
    loading,
    storageWarning,
    signIn,
    signUp,
    signOut,
    refreshAuth, // Add this to the context value
    updateProfile,
  }

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 