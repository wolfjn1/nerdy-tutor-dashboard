import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'

export default async function ServerDashboard() {
  const cookieStore = cookies()
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
  
  // Get the user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Get tutor data
  const { data: tutor } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome back{tutor ? `, ${tutor.first_name} ${tutor.last_name}` : ''}!
      </h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow mb-4">
        <h2 className="text-xl font-semibold mb-2">Server-Side Rendered Data</h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          This data was fetched on the server, not in the browser
        </p>
        
        <div className="space-y-2">
          <p><strong>User Email:</strong> {user.email}</p>
          <p><strong>User ID:</strong> {user.id}</p>
          
          {tutor && (
            <>
              <p><strong>Tutor Name:</strong> {tutor.first_name} {tutor.last_name}</p>
              <p><strong>Rating:</strong> {tutor.rating}</p>
              <p><strong>Hourly Rate:</strong> ${tutor.hourly_rate}</p>
              <p><strong>Total Hours:</strong> {tutor.total_hours}</p>
            </>
          )}
        </div>
      </div>
      
      <div className="flex gap-4">
        <a 
          href="/dashboard" 
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Go to Client Dashboard
        </a>
        <a 
          href="/api/check-ssr-auth" 
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Check SSR Auth Status
        </a>
      </div>
    </div>
  )
} 