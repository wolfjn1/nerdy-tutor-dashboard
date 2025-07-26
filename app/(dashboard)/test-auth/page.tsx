'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useTutorStore } from '@/lib/stores/tutorStore'

export default function TestAuthPage() {
  const { user, tutor, loading, storageWarning } = useAuth()
  const storeTutor = useTutorStore((state) => state.tutor)
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Context:</h2>
          <pre className="text-xs overflow-auto">
{JSON.stringify({
  loading,
  user: user ? { id: user.id, email: user.email } : null,
  tutor: tutor ? { id: tutor.id, email: tutor.email, name: `${tutor.first_name} ${tutor.last_name}` } : null,
  storageWarning
}, null, 2)}
          </pre>
        </div>
        
        <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded">
          <h2 className="font-bold mb-2">Store:</h2>
          <pre className="text-xs overflow-auto">
{JSON.stringify({
  tutor: storeTutor ? { id: storeTutor.id, email: storeTutor.email, name: `${storeTutor.first_name} ${storeTutor.last_name}` } : null
}, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
} 