import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StudentsClient from './students-client'

export default async function StudentsPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }
  
  // Get tutor profile
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (tutorError || !tutor) {
    console.error('Tutor fetch error:', tutorError)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Profile Setup Required</h1>
        <p>Your tutor profile needs to be set up. Please contact support.</p>
      </div>
    )
  }
  
  // Fetch all students for this tutor
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor.id)
    .order('first_name', { ascending: true })
    
  if (studentsError) {
    console.error('Students fetch error:', studentsError)
  }
  
  // Fetch all sessions for this tutor
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  if (sessionsError) {
    console.error('Sessions fetch error:', sessionsError)
  }
  
  // Process students with session stats
  const studentsWithStats = (students || []).map((student: any) => {
    const studentSessions = (sessions || []).filter((s: any) => s.student_id === student.id)
    const completedSessions = studentSessions.filter((s: any) => s.status === 'completed')
    const upcomingSessions = studentSessions
      .filter((s: any) => s.status === 'scheduled' && new Date(s.scheduled_at) > new Date())
      .sort((a: any, b: any) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime())
    
    // Calculate average rating from completed sessions
    const ratingsSum = completedSessions.reduce((sum: number, s: any) => sum + (s.rating || 0), 0)
    const ratingsCount = completedSessions.filter((s: any) => s.rating !== null).length
    const avgRating = ratingsCount > 0 ? Math.round((ratingsSum / ratingsCount) * 10) / 10 : 0
    
    // Calculate total earnings (assuming $50 per session for now)
    const totalEarnings = completedSessions.length * 50
    
    // Get next session
    const nextSession = upcomingSessions[0]
    
    // Get last completed session
    const lastSession = completedSessions
      .sort((a: any, b: any) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())[0]
    
    return {
      ...student,
      nextSession: nextSession ? {
        date: new Date(nextSession.scheduled_at).toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        time: new Date(nextSession.scheduled_at).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      } : undefined,
      stats: {
        totalSessions: studentSessions.length,
        completedSessions: completedSessions.length,
        avgRating,
        lastSession: lastSession ? new Date(lastSession.scheduled_at) : undefined,
        totalEarnings
      }
    }
  })
  
  return <StudentsClient students={studentsWithStats} />
} 