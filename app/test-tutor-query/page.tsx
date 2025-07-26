'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-browser-v2'

export default function TestTutorQuery() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function testQuery() {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setResult({ error: 'No user logged in' })
        setLoading(false)
        return
      }

      // Try to fetch tutor by auth_user_id
      const { data: tutorById, error: errorById } = await supabase
        .from('tutors')
        .select('*')
        .eq('auth_user_id', user.id)
        .single()

      // Try to fetch tutor by email
      const { data: tutorByEmail, error: errorByEmail } = await supabase
        .from('tutors')
        .select('*')
        .eq('email', user.email)
        .single()

      setResult({
        user: {
          id: user.id,
          email: user.email
        },
        queryById: {
          success: !!tutorById,
          data: tutorById,
          error: errorById
        },
        queryByEmail: {
          success: !!tutorByEmail,
          data: tutorByEmail,
          error: errorByEmail
        }
      })
      setLoading(false)
    }

    testQuery()
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Tutor Query Test</h1>
      <pre className="bg-gray-100 p-4 rounded overflow-auto">
        {JSON.stringify(result, null, 2)}
      </pre>
    </div>
  )
} 