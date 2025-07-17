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

    // Simple auth check
    const checkAuth = async () => {
      try {
        console.log('[SimpleAuth] Checking session...')
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          console.log('[SimpleAuth] User found:', session.user.id)
          setUser(session.user)
          
          // Fetch tutor profile
          const { data: tutorData } = await supabase
            .from('tutors')
            .select('*')
            .eq('auth_user_id', session.user.id)
            .single()
          
          if (tutorData) {
            console.log('[SimpleAuth] Tutor found:', tutorData.name)
            setTutor(tutorData)
          }
        }
      } catch (error) {
        console.error('[SimpleAuth] Error:', error)
      } finally {
        console.log('[SimpleAuth] Loading complete')
        setLoading(false)
      }
    }

    // Run check with a small delay for Vercel
    const timer = setTimeout(checkAuth, 100)

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
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
      clearTimeout(timer)
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