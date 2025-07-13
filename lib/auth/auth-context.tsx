'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase-browser'
import { AuthStorageAdapter } from './storage-adapter'
import { TokenAuthManager } from './token-auth'

interface AuthContextType {
  user: User | null
  tutor: any | null
  loading: boolean
  storageWarning: string | null
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<{ error: Error | null }>
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

  // Fetch tutor profile when user changes
  const fetchTutorProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', userId)
        .single()

      if (error) throw error
      setTutor(data)
      return data
    } catch (error) {
      console.error('Error fetching tutor profile:', error)
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

  useEffect(() => {
    // Check storage capabilities
    const storageInfo = tokenManager.getStorageInfo()
    setStorageWarning(storageInfo.warning)

    // Check for existing session
    const initializeAuth = async () => {
      try {
        // First try normal session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setUser(session.user)
          await fetchTutorProfile(session.user.id)
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
        console.error('Error initializing auth:', error)
      } finally {
        setLoading(false)
      }
    }

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

  return (
    <AuthContext.Provider
      value={{
        user,
        tutor,
        loading,
        storageWarning,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
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