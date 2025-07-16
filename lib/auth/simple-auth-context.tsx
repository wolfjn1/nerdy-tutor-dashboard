'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

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
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  tutor: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export function SimpleAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
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
    setTimeout(checkAuth, 100)

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
      subscription.unsubscribe()
    }
  }, [])

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
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ user, tutor, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
} 