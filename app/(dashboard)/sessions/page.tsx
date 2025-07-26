import React from 'react'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import SessionsClient from './sessions-client'

export default async function SessionsPage() {
  const supabase = createServerComponentClient({ cookies })
  
  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return <div>Please log in to view sessions</div>
  }

  // Get tutor profile
  const { data: tutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  if (!tutor) {
    return <div>Tutor profile not found</div>
  }

  // Get all sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      students (
        id,
        first_name,
        last_name,
        grade,
        subjects,
        avatar_url,
        is_active
      )
    `)
    .eq('tutor_id', tutor.id)
    .order('scheduled_at', { ascending: true })

  // Transform sessions data for the client component
  const formattedSessions = sessions?.map(session => ({
    id: session.id,
    studentId: session.student_id,
    date: session.scheduled_at,
    duration: session.duration || 60,
    subject: session.subject,
    status: session.status || 'scheduled',
    type: session.session_type || 'online',
    notes: session.notes,
    rating: session.rating,
    earnings: session.price,
    createdAt: session.created_at,
    updatedAt: session.updated_at,
    student: session.students ? {
      id: session.students.id,
      firstName: session.students.first_name,
      lastName: session.students.last_name,
      grade: session.students.grade,
      subjects: session.students.subjects || [],
      avatar: session.students.avatar_url,
      isActive: session.students.is_active
    } : undefined
  })) || []

  return <SessionsClient sessions={formattedSessions} />
} 