import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SimpleDashboardPage() {
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
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Error Loading Profile</h1>
        <pre>{JSON.stringify({ user, tutorError }, null, 2)}</pre>
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
    
  const activeStudentsCount = students?.filter(s => s.is_active).length || 0
  const todaysSessions = sessions?.filter(s => 
    new Date(s.scheduled_at).toDateString() === new Date().toDateString()
  ).length || 0
  
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {tutor.first_name} {tutor.last_name}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's your tutoring overview for today (Server Rendered)
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</p>
          <p className="text-2xl font-bold">{todaysSessions}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
          <p className="text-2xl font-bold">${todaysSessions * 50}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
          <p className="text-2xl font-bold">{activeStudentsCount}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Total Students</p>
          <p className="text-2xl font-bold">{students?.length || 0}</p>
        </div>
      </div>

      {/* Debug Data */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm text-gray-500">Raw Tutor Data</summary>
        <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
{JSON.stringify(tutor, null, 2)}
        </pre>
      </details>
      
      <div className="mt-6">
        <Link href="/dashboard" className="text-blue-600 hover:underline">
          ← Back to regular dashboard
        </Link>
      </div>
    </div>
  )
} 