'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

interface AuthContextType {
  user: User | null
  tutor: any | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>
  signUp: (email: string, password: string, firstName: string, lastName: string) => Promise<{ error: Error | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<{ error: Error | null }>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tutor: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  updateProfile: async () => ({ error: null }),
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tutor, setTutor] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  useEffect(() => {
    // Check for existing session
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session) {
          setUser(session.user)
          await fetchTutorProfile(session.user.id)
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
      } else {
        setUser(null)
        setTutor(null)
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
        await fetchTutorProfile(data.user.id)
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
      }

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
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