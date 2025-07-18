'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-browser'

interface Tutor {
  id: string
  auth_user_id: string
  name: string
  email: string
  [key: string]: any
}

interface AuthContextType {
  user: User | null
  tutor: Tutor | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  signUp?: (email: string, password: string, userData?: any) => Promise<{ error: Error | null, user?: User | null }>
  updateProfile?: (updates: any) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tutor: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  signUp: async () => ({ error: null }),
  updateProfile: async () => ({ error: null }),
})

export const useAuth = () => useContext(AuthContext)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const supabase = createClient()

  // Handle client-side mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Only run auth check on client side after mounting
    if (!mounted) return

    let isSubscribed = true
    let retryCount = 0
    const maxRetries = 3

    // Simple auth check with timeout
    const checkAuth = async () => {
      const startTime = Date.now()
      
      // Create a timeout promise
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Auth check timeout')), 5000) // 5 second timeout
      })

      try {
        console.log('[SimpleAuth] Checking session...')
        
        // Race between auth check and timeout
        const result = await Promise.race([
          supabase.auth.getSession(),
          timeoutPromise
        ])
        
        const { data: { session } } = result as any
        
        console.log(`[SimpleAuth] Session check took ${Date.now() - startTime}ms`)
        
        if (!isSubscribed) return
        
        if (session?.user) {
          console.log('[SimpleAuth] User found:', session.user.id)
          setUser(session.user)
          
          const tutorStartTime = Date.now()
          
          // Fetch tutor profile with timeout
          const tutorResult = await Promise.race([
            supabase
              .from('tutors')
              .select('*')
              .eq('auth_user_id', session.user.id)
              .single(),
            timeoutPromise
          ])
          
          const { data: tutorData } = tutorResult as any
          
          console.log(`[SimpleAuth] Tutor fetch took ${Date.now() - tutorStartTime}ms`)
          
          if (tutorData && isSubscribed) {
            console.log('[SimpleAuth] Tutor found:', tutorData.name)
            setTutor(tutorData)
          }
        }
        
        console.log(`[SimpleAuth] Total auth check took ${Date.now() - startTime}ms`)
      } catch (error) {
        console.error('[SimpleAuth] Error:', error)
        
        // Retry if we haven't exceeded max retries
        if (retryCount < maxRetries && isSubscribed) {
          retryCount++
          console.log(`[SimpleAuth] Retrying... (attempt ${retryCount}/${maxRetries})`)
          setTimeout(checkAuth, 1000 * retryCount) // Exponential backoff
          return
        }
      } finally {
        if (isSubscribed) {
          console.log('[SimpleAuth] Loading complete')
          setLoading(false)
        }
      }
    }

    // Start auth check immediately (no delay needed for Netlify)
    checkAuth()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return
      
      console.log('[SimpleAuth] Auth state changed:', event)
      if (session?.user) {
        setUser(session.user)
        
        const { data: tutorData } = await supabase
          .from('tutors')
          .select('*')
          .eq('auth_user_id', session.user.id)
          .single()
        
        if (tutorData) {
          setTutor(tutorData)
        }
      } else {
        setUser(null)
        setTutor(null)
      }
    })

    return () => {
      isSubscribed = false
      subscription.unsubscribe()
    }
  }, [mounted, supabase])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) return { error }
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setTutor(null)
    // Navigate using window.location instead of router
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: userData
        }
      })
      if (error) return { error, user: null }
      return { error: null, user: data.user }
    } catch (error) {
      return { error: error as Error, user: null }
    }
  }

  const updateProfile = async (updates: any) => {
    try {
      if (!user || !tutor) return { error: new Error('No user logged in') }
      
      const { error } = await supabase
        .from('tutors')
        .update(updates)
        .eq('id', tutor.id)
      
      if (error) return { error }
      
      // Update local state
      setTutor({ ...tutor, ...updates })
      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  // During SSR or before mount, show loading state
  if (!mounted) {
    return (
      <AuthContext.Provider value={{ user: null, tutor: null, loading: true, signIn, signOut, signUp, updateProfile }}>
        {children}
      </AuthContext.Provider>
    )
  }

  return (
    <AuthContext.Provider value={{ user, tutor, loading, signIn, signOut, signUp, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
} 