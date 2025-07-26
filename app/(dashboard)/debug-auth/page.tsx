import { createClient } from '@/utils/supabase/server'

export default async function DebugAuthPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  // Get session
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()
  
  let tutor = null
  let tutorError = null
  
  if (user) {
    // Try to fetch tutor by auth_user_id
    const result1 = await supabase
      .from('tutors')
      .select('*')
      .eq('auth_user_id', user.id)
      .single()
      
    if (result1.error) {
      // Try by email as fallback
      const result2 = await supabase
        .from('tutors')
        .select('*')
        .eq('email', user.email)
        .single()
        
      tutor = result2.data
      tutorError = result2.error
    } else {
      tutor = result1.data
      tutorError = result1.error
    }
  }
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Authentication & Data</h1>
      
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Auth User</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-xs">
{JSON.stringify({ user, userError }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Session</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-xs">
{JSON.stringify({ session: session ? { ...session, access_token: 'REDACTED', refresh_token: 'REDACTED' } : null, sessionError }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Tutor Profile</h2>
          <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto text-xs">
{JSON.stringify({ tutor, tutorError }, null, 2)}
          </pre>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-3">Summary</h2>
          <ul className="space-y-2">
            <li className={user ? 'text-green-600' : 'text-red-600'}>
              ✓ User authenticated: {user ? `Yes (${user.email})` : 'No'}
            </li>
            <li className={session ? 'text-green-600' : 'text-red-600'}>
              ✓ Session valid: {session ? 'Yes' : 'No'}
            </li>
            <li className={tutor ? 'text-green-600' : 'text-red-600'}>
              ✓ Tutor profile found: {tutor ? `Yes (${tutor.first_name} ${tutor.last_name})` : 'No'}
            </li>
            {user && tutor && (
              <li className={user.id === tutor.auth_user_id ? 'text-green-600' : 'text-yellow-600'}>
                ✓ Auth ID match: {user.id === tutor.auth_user_id ? 'Yes' : `No (user: ${user.id}, tutor: ${tutor.auth_user_id})`}
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
} 