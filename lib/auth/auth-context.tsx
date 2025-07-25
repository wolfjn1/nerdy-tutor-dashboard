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
  
  // Debug Supabase client
  console.log('[Auth] Supabase client initialized with URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
  
  // Get setTutor and reset from the global store
  const setTutorInStore = useTutorStore((state) => state.setTutor)
  const resetStore = useTutorStore((state) => state.reset)

  // Fetch tutor profile when user changes
  const fetchTutorProfile = async (userId: string, userEmail?: string) => {
    try {
      console.log('[Auth] Fetching tutor profile for user:', userId, 'email:', userEmail)
      
      // First check if we have a valid session
      const { data: { session } } = await supabase.auth.getSession()
      console.log('[Auth] Current session:', { 
        hasSession: !!session, 
        userId: session?.user?.id,
        email: session?.user?.email 
      })
      
      // Log the exact query we're making
      console.log('[Auth] Making query: tutors.select(*).eq(auth_user_id, ' + userId + ').single()')
      
      const { data, error } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', userId)
        .single()

      console.log('[Auth] Query by auth_user_id result:', { 
        data, 
        error,
        errorCode: error?.code,
        errorMessage: error?.message,
        errorDetails: error?.details
      })

      if (error) {
        console.log('[Auth] Error fetching tutor profile:', error.code, error.message, error.details)
        
        // If no tutor exists, try to fetch by email as fallback
        if (error.code === 'PGRST116') {
          console.log('[Auth] No tutor record found by auth_user_id, trying by email')
          
          // Use the passed email
          if (userEmail) {
            console.log('[Auth] Trying email fallback with:', userEmail)
            const { data: tutorByEmail, error: emailError } = await supabase
              .from('tutors')
              .select('*')
              .eq('email', userEmail)
              .single()
            
            console.log('[Auth] Query by email result:', { data: tutorByEmail, error: emailError })
            
            if (tutorByEmail && !emailError) {
              console.log('[Auth] Found tutor by email, using that data')
              setTutor(tutorByEmail)
              setTutorInStore(tutorByEmail)
              return
            } else {
              console.log('[Auth] Email fallback failed:', emailError?.message)
            }
          }
          
          console.log('[Auth] No tutor record found, creating default data')
          const defaultTutor = {
            id: 'demo-tutor-001',
            auth_user_id: userId,
            email: 'sarah_chen@hotmail.com',
            first_name: 'Sarah',
            last_name: 'Chen',
            avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
            bio: 'Expert mathematics tutor with 5+ years of experience. Specializing in AP Calculus, SAT/ACT prep, and college-level mathematics.',
            subjects: ['Mathematics', 'Calculus', 'Algebra', 'SAT Math'],
            hourly_rate: 85,
            availability: {},
            rating: 4.9,
            total_earnings: 15750,
            total_hours: 185,
            is_verified: true,
            badges: ['Expert Tutor', 'Top Rated', 'Century Club', 'Perfect Week']
          }
          
          setTutor(defaultTutor)
          setTutorInStore(defaultTutor)
          
          // Also set gamification data
          const setGamificationData = useTutorStore.getState().setGamificationData
          const setStreak = useTutorStore.getState().setStreak
          
          // Set level 42 with 25% progress (128662 XP total)
          setGamificationData(128662)
          
          // Set streak to 21 days
          setStreak(21)
          
          console.log('[Auth] Default tutor data set with gamification')
          return defaultTutor
        }
        
        throw error
      }
      
      console.log('[Auth] Tutor profile fetched:', data)
      
      // Update both local state and global store
      setTutor(data)
      if (data) {
        setTutorInStore(data)
        console.log('[Auth] Tutor data set in store')
      }
      
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
          await fetchTutorProfile(data.user.id, data.user.email)
          
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
        console.log('[Auth] Initializing auth...')
        // First try normal session
        const { data: { session } } = await supabase.auth.getSession()
        
        console.log('[Auth] Session found:', !!session, session?.user?.id)
        
        if (session) {
          setUser(session.user)
          const tutorData = await fetchTutorProfile(session.user.id, session.user.email)
          console.log('[Auth] After fetchTutorProfile, tutor data:', tutorData)
        } else {
          // Check for stored tokens
          const tokens = await tokenManager.getTokens()
          if (tokens && !await tokenManager.isTokenExpired()) {
            const { data: { user } } = await supabase.auth.getUser(tokens.access_token)
            if (user) {
              setUser(user)
              await fetchTutorProfile(user.id, user.email)
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
        await fetchTutorProfile(session.user.id, session.user.email)
        
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
        
        // Small delay to ensure session is established
        await new Promise(resolve => setTimeout(resolve, 100))
        
        await fetchTutorProfile(data.user.id, email)
        
        // Store tokens for fallback
        if (data.session) {
          await tokenManager.storeTokens({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at || Math.floor(Date.now() / 1000) + 3600,
            token_type: 'Bearer'
          })
        }
        
        // Redirect to dashboard after successful login
        router.push('/dashboard')
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

        await fetchTutorProfile(authData.user.id, email)
        
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
        await fetchTutorProfile(user.id, user.email)
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