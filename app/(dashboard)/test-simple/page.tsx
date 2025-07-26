'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

export default function TestSimplePage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      try {
        // Get session
        const { data: { session } } = await supabase.auth.getSession()
        console.log('[TestSimple] Session:', session)

        // Get user
        const { data: { user } } = await supabase.auth.getUser()
        console.log('[TestSimple] User:', user)

        // Try to fetch tutors
        const { data: tutors, error: tutorsError } = await supabase
          .from('tutors')
          .select('*')
          .limit(5)
        
        console.log('[TestSimple] Tutors query:', { tutors, error: tutorsError })

        // Try to fetch specific tutor if we have a user
        let specificTutor = null
        if (user) {
          const { data: specific, error: specificError } = await supabase
            .from('tutors')
            .select('*')
            .eq('auth_user_id', user.id)
            .single()
          
          console.log('[TestSimple] Specific tutor:', { specific, error: specificError })
          specificTutor = specific
        }

        setData({
          session: session ? { id: session.user.id, email: session.user.email } : null,
          user: user ? { id: user.id, email: user.email } : null,
          tutorsCount: tutors?.length || 0,
          tutorsError: tutorsError?.message,
          specificTutor: specificTutor,
          supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL
        })
      } catch (error) {
        console.error('[TestSimple] Error:', error)
        setData({ error: error instanceof Error ? error.message : 'Unknown error' })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  if (loading) return <div>Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple Auth Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
} 