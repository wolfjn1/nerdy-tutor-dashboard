import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function TestRLSPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }
  
  // Test 1: Can I see my tutor profile?
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  // Test 2: Can I see any tutor profiles?
  const { data: allTutors, error: allTutorsError } = await supabase
    .from('tutors')
    .select('id, first_name, last_name')
    .limit(5)
    
  // Test 3: Can I see my students?
  const { data: students, error: studentsError } = await supabase
    .from('students')
    .select('*')
    .limit(10)
    
  // Test 4: Can I see my sessions?
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .limit(10)
    
  // Test 5: Direct count queries
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    
  const { count: sessionCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">RLS Policy Test Results</h1>
      
      <div className="space-y-6">
        {/* User Info */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded">
          <h2 className="font-semibold">Authenticated User</h2>
          <p>ID: {user.id}</p>
          <p>Email: {user.email}</p>
        </div>
        
        {/* Test 1: Own Tutor Profile */}
        <div className={`p-4 rounded ${tutor ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <h2 className="font-semibold">Test 1: Can see own tutor profile?</h2>
          {tutor ? (
            <div>
              <p className="text-green-700 dark:text-green-300">✅ SUCCESS</p>
              <p>Name: {tutor.first_name} {tutor.last_name}</p>
              <p>Tutor ID: {tutor.id}</p>
            </div>
          ) : (
            <div>
              <p className="text-red-700 dark:text-red-300">❌ FAILED</p>
              <p>Error: {tutorError?.message || 'No tutor profile found'}</p>
            </div>
          )}
        </div>
        
        {/* Test 2: All Tutors */}
        <div className={`p-4 rounded ${allTutorsError ? 'bg-red-50 dark:bg-red-900/20' : 'bg-yellow-50 dark:bg-yellow-900/20'}`}>
          <h2 className="font-semibold">Test 2: Can see other tutors?</h2>
          {allTutorsError ? (
            <p className="text-red-700 dark:text-red-300">❌ Error: {allTutorsError.message}</p>
          ) : (
            <p>Found {allTutors?.length || 0} tutors (should be 0 or 1 with proper RLS)</p>
          )}
        </div>
        
        {/* Test 3: Students */}
        <div className={`p-4 rounded ${students && students.length > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <h2 className="font-semibold">Test 3: Can see students?</h2>
          {students && students.length > 0 ? (
            <div>
              <p className="text-green-700 dark:text-green-300">✅ SUCCESS</p>
              <p>Found {students.length} students (Total count: {studentCount || 0})</p>
            </div>
          ) : (
            <div>
              <p className="text-red-700 dark:text-red-300">❌ No students visible</p>
              <p>Error: {studentsError?.message || 'No data'}</p>
            </div>
          )}
        </div>
        
        {/* Test 4: Sessions */}
        <div className={`p-4 rounded ${sessions && sessions.length > 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
          <h2 className="font-semibold">Test 4: Can see sessions?</h2>
          {sessions && sessions.length > 0 ? (
            <div>
              <p className="text-green-700 dark:text-green-300">✅ SUCCESS</p>
              <p>Found {sessions.length} sessions (Total count: {sessionCount || 0})</p>
            </div>
          ) : (
            <div>
              <p className="text-red-700 dark:text-red-300">❌ No sessions visible</p>
              <p>Error: {sessionsError?.message || 'No data'}</p>
            </div>
          )}
        </div>
        
        {/* Summary */}
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-semibold mb-2">Summary</h2>
          <p className="text-sm">
            If you see your tutor profile (Test 1 ✅) but no students or sessions (Tests 3 & 4 ❌), 
            then RLS is working but the policies for students/sessions may need adjustment.
          </p>
          <p className="text-sm mt-2">
            The dashboard relies on these same queries, so fixing these tests will fix the dashboard.
          </p>
        </div>
      </div>
    </div>
  )
} 