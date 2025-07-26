'use client'

import { useAuth } from '@/lib/auth/auth-context'

export default function SimpleDashboardPage() {
  const { user, tutor, loading } = useAuth()
  
  if (loading) {
    return <div className="p-8">Loading...</div>
  }
  
  if (!user) {
    return <div className="p-8">Not authenticated</div>
  }
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">
        Welcome back{tutor ? `, ${tutor.first_name} ${tutor.last_name}` : ''}!
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-2">User Info</h2>
          <p>Email: {user.email}</p>
          <p>ID: {user.id}</p>
        </div>
        
        {tutor && (
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Tutor Profile</h2>
            <p>Name: {tutor.first_name} {tutor.last_name}</p>
            <p>Email: {tutor.email}</p>
            <p>Rating: {tutor.rating}</p>
            <p>Hourly Rate: ${tutor.hourly_rate}</p>
          </div>
        )}
      </div>
    </div>
  )
} 