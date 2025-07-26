import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DebugDashboardPage() {
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
    
  // Fetch students
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor?.id || '')
    
  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: todaysSessions, error: sessionsError } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutor?.id || '')
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true })
    
  // Fetch all sessions for debugging
  const { data: allSessions, error: allSessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutor?.id || '')
    .order('scheduled_at', { ascending: true })
    .limit(50)
    
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Dashboard Debug Information</h1>
      
      {/* User Info */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">Authenticated User</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
        </pre>
      </div>
      
      {/* Tutor Info */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">Tutor Profile</h2>
        {tutorError ? (
          <p className="text-red-600">Error: {tutorError.message}</p>
        ) : (
          <pre className="text-sm overflow-auto">
            {JSON.stringify(tutor, null, 2)}
          </pre>
        )}
      </div>
      
      {/* Students Info */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">Students</h2>
        <p className="mb-2">Total: {students?.length || 0} | Active: {students?.filter(s => s.is_active).length || 0}</p>
        {studentsError ? (
          <p className="text-red-600">Error: {studentsError.message}</p>
        ) : (
          <pre className="text-sm overflow-auto max-h-64">
            {JSON.stringify(students, null, 2)}
          </pre>
        )}
      </div>
      
      {/* Today's Sessions */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">Today's Sessions</h2>
        <p className="mb-2">Count: {todaysSessions?.length || 0}</p>
        <p className="mb-2">Date Range: {today.toISOString()} to {tomorrow.toISOString()}</p>
        {sessionsError ? (
          <p className="text-red-600">Error: {sessionsError.message}</p>
        ) : (
          <pre className="text-sm overflow-auto max-h-64">
            {JSON.stringify(todaysSessions, null, 2)}
          </pre>
        )}
      </div>
      
      {/* All Sessions (for debugging) */}
      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded">
        <h2 className="text-xl font-semibold mb-2">All Sessions (First 50)</h2>
        <p className="mb-2">Count: {allSessions?.length || 0}</p>
        {allSessionsError ? (
          <p className="text-red-600">Error: {allSessionsError.message}</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-auto">
            {allSessions?.map(session => (
              <div key={session.id} className="text-sm">
                {new Date(session.scheduled_at).toLocaleString()} - {session.subject} - {session.status}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 