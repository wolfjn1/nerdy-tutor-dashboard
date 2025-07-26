import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }
  
  // Fetch tutor profile
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
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          User ID: {user.id}
          Email: {user.email}
          Error: {tutorError?.message || 'No tutor profile found'}
        </pre>
      </div>
    )
  }
  
  // Fetch students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Fetch today's sessions
  const { data: todaySessionsData } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true })
    
  // Fetch upcoming sessions (for the "Upcoming Sessions" section)
  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)
    
  // Calculate stats
  const activeStudentsCount = students?.filter(s => s.is_active).length || 0
  const totalStudents = students?.length || 0
  const todaysSessions = todaySessionsData?.length || 0
  
  // Format sessions for the client
  const formattedSessions = upcomingSessions?.map(s => ({
    ...s,
    student_name: s.students ? `${s.students.first_name} ${s.students.last_name}` : 'Unknown Student'
  })) || []
  
  const stats = {
    activeStudentsCount,
    todaysSessions,
    totalStudents
  }
  
  // Pass all data to the client component
  return (
    <DashboardClient 
      initialTutor={tutor} 
      user={user}
      students={students || []}
      sessions={formattedSessions}
      stats={stats}
    />
  )
} 