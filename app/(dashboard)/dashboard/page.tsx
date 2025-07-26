import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ServerDashboardPage() {
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
    // For now, show a message instead of crashing
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
    
  // Fetch sessions
  const { data: sessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)
  
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {tutor.first_name} {tutor.last_name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's your tutoring overview for today
        </p>
      </div>

      {/* Gamification Header */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Level {tutor.level || 1}</h2>
            <p className="text-purple-100">{tutor.title || 'Expert'}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Total XP</p>
            <p className="text-2xl font-bold">{tutor.total_xp || 0}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-purple-100">Streak</p>
            <p className="text-2xl font-bold">🔥 {tutor.streak || 0} days</p>
          </div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</p>
          <p className="text-2xl font-bold">{sessions?.filter(s => 
            new Date(s.scheduled_at).toDateString() === new Date().toDateString()
          ).length || 0}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
          <p className="text-2xl font-bold">$0</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
          <p className="text-2xl font-bold">{students?.filter(s => s.is_active).length || 0}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          <p className="text-2xl font-bold">95%</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
        {sessions && sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">Session #{session.id.slice(-6)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.scheduled_at).toLocaleString()}
                  </p>
                </div>
                <span className="px-3 py-1 bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300 rounded text-sm">
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No upcoming sessions scheduled</p>
        )}
      </div>

      {/* Debug Info */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
        <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
          User: {JSON.stringify({ id: user.id, email: user.email }, null, 2)}
          Tutor: {JSON.stringify(tutor, null, 2)}
        </pre>
      </details>
    </div>
  )
} 