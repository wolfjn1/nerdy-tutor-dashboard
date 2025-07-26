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
  
  // Log what we're passing to the client
  console.log('[Dashboard Server] Passing tutor data:', {
    id: tutor.id,
    name: `${tutor.first_name} ${tutor.last_name}`,
    email: tutor.email,
    hasFirstName: !!tutor.first_name,
    hasLastName: !!tutor.last_name,
    allFields: Object.keys(tutor)
  })
  
  // Pass the tutor data to the client component
  return <DashboardClient initialTutor={tutor} user={user} />
} 