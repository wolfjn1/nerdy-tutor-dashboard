'use client'

import React, { useEffect, useState } from 'react'
import { useTutorStore } from '@/lib/stores/tutorStore'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface DashboardClientProps {
  initialTutor: any
  user: any
}

export default function DashboardClient({ initialTutor, user }: DashboardClientProps) {
  // Initialize the tutor store with the server data
  const setTutor = useTutorStore(state => state.setTutor)
  
  // State for dashboard data
  const [students, setStudents] = useState<any[]>([])
  const [sessions, setSessions] = useState<any[]>([])
  const [todaysSessions, setTodaysSessions] = useState(0)
  const [activeStudentsCount, setActiveStudentsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    console.log('DashboardClient mounted with tutor:', initialTutor)
    // Set the tutor data in the store
    setTutor(initialTutor)
    // Load dashboard data
    loadDashboardData()
  }, [])
  
  async function loadDashboardData() {
    try {
      const supabase = createClient()
      
      console.log('Loading dashboard data for tutor:', initialTutor.id)
      
      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        .eq('tutor_id', initialTutor.id)
        
      if (studentsError) {
        console.error('Error fetching students:', studentsError)
        setError(`Failed to load students: ${studentsError.message}`)
      } else {
        console.log('Loaded students:', studentsData?.length)
        setStudents(studentsData || [])
        // Count active students
        const activeCount = studentsData?.filter(s => s.is_active).length || 0
        setActiveStudentsCount(activeCount)
      }
      
      // Fetch sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('sessions')
        .select(`
          *,
          students:student_id (
            first_name,
            last_name
          )
        `)
        .eq('tutor_id', initialTutor.id)
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true })
        
      if (sessionsError) {
        console.error('Error fetching sessions:', sessionsError)
        setError(prev => prev ? `${prev}; Failed to load sessions: ${sessionsError.message}` : `Failed to load sessions: ${sessionsError.message}`)
      } else {
        console.log('Loaded sessions:', sessionsData?.length)
        setSessions(sessionsData || [])
        
        // Calculate today's sessions
        const today = new Date().toDateString()
        const todaysCount = sessionsData?.filter(s => 
          new Date(s.scheduled_at).toDateString() === today
        ).length || 0
        setTodaysSessions(todaysCount)
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }
  
  // Use initialTutor directly
  const tutor = initialTutor
  
  // Show error state if tutor is missing
  if (!tutor) {
    return (
      <div className="p-6">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-red-700 dark:text-red-400">Error Loading Dashboard</h2>
          <p className="text-red-600 dark:text-red-300 mt-2">Unable to load tutor profile data.</p>
          <pre className="mt-2 text-xs">{JSON.stringify({ user, initialTutor }, null, 2)}</pre>
        </div>
      </div>
    )
  }
  
  // Calculate today's earnings (assuming $50 per session)
  const todaysEarnings = todaysSessions * 50
  
  return (
    <div className="p-6">
      {/* Error Banner */}
      {error && (
        <div className="mb-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
          <p className="text-sm text-yellow-700 dark:text-yellow-400">{error}</p>
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {tutor.first_name || 'Tutor'} {tutor.last_name || ''}! 👋
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
            <p className="text-purple-100">{tutor.title || 'Expert Tutor'}</p>
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
          <p className="text-2xl font-bold">{loading ? '...' : todaysSessions}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
          <p className="text-2xl font-bold">${loading ? '...' : todaysEarnings}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
          <p className="text-2xl font-bold">{loading ? '...' : activeStudentsCount}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          <p className="text-2xl font-bold">95%</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
        ) : sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">
                    {session.students?.first_name} {session.students?.last_name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.scheduled_at).toLocaleString()} • {session.subject}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  session.status === 'completed' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                  session.status === 'scheduled' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                  'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {session.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600 dark:text-gray-400">No upcoming sessions scheduled</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/sessions/new" className="block">
          <button className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <h4 className="font-semibold mb-2">Schedule Session</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Book a new tutoring session</p>
          </button>
        </Link>
        
        <Link href="/students" className="block">
          <button className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <h4 className="font-semibold mb-2">View Students</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">Manage your student roster</p>
          </button>
        </Link>
        
        <Link href="/messages" className="block">
          <button className="w-full p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <h4 className="font-semibold mb-2">Check Messages</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">View your inbox</p>
          </button>
        </Link>
      </div>

      {/* Debug info for troubleshooting */}
      <details className="mt-8">
        <summary className="cursor-pointer text-sm text-gray-500">Debug Info</summary>
        <pre className="mt-2 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
{JSON.stringify({
  tutor: {
    id: tutor.id,
    name: `${tutor.first_name} ${tutor.last_name}`,
    email: tutor.email,
    level: tutor.level,
    title: tutor.title
  },
  stats: {
    students: `${students.length} total, ${activeStudentsCount} active`,
    sessions: `${sessions.length} upcoming, ${todaysSessions} today`,
    loading: loading,
    error: error
  }
}, null, 2)}
        </pre>
      </details>
    </div>
  )
} 