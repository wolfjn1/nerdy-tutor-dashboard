import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function DataCheckPage() {
  const supabase = await createClient()
  
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get tutor
  const { data: tutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  // Get students
  const { data: students, count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact' })
    .eq('tutor_id', tutor?.id || '')
    
  // Get today's sessions
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  const { data: todaysSessions } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutor?.id || '')
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    
  // Get all sessions count
  const { count: totalSessions } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', tutor?.id || '')
    
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Data Check</h1>
      
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-semibold mb-2">Authentication</h2>
          <p>User ID: {user.id}</p>
          <p>Email: {user.email}</p>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-semibold mb-2">Tutor</h2>
          <p>Name: {tutor?.first_name} {tutor?.last_name}</p>
          <p>Tutor ID: {tutor?.id}</p>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-semibold mb-2">Students</h2>
          <p>Total: {studentCount || 0}</p>
          <p>Active: {students?.filter(s => s.is_active).length || 0}</p>
          <p>Inactive: {students?.filter(s => !s.is_active).length || 0}</p>
        </div>
        
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <h2 className="font-semibold mb-2">Sessions</h2>
          <p>Today ({today.toISOString().split('T')[0]}): {todaysSessions?.length || 0}</p>
          <p>Total: {totalSessions || 0}</p>
          {todaysSessions && todaysSessions.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-semibold">Today's sessions:</p>
              {todaysSessions.map(s => (
                <p key={s.id} className="text-sm">
                  {new Date(s.scheduled_at).toTimeString().slice(0,5)} - {s.subject} ({s.status})
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 