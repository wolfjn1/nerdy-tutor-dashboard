'use client'

import React, { useEffect } from 'react'
import { useTutorStore } from '@/lib/stores/tutorStore'
import Link from 'next/link'

interface DashboardClientProps {
  initialTutor: any
  user: any
  students?: any[]
  sessions?: any[]
  stats?: {
    activeStudentsCount: number
    todaysSessions: number
    totalStudents: number
  }
}

export default function DashboardClient({ 
  initialTutor, 
  user,
  students = [],
  sessions = [],
  stats = { activeStudentsCount: 0, todaysSessions: 0, totalStudents: 0 }
}: DashboardClientProps) {
  // Debug logging
  console.log('Dashboard Client Data:', {
    studentsCount: students.length,
    sessionsCount: sessions.length,
    stats,
    sessions: sessions.map(s => ({
      date: s.scheduled_at,
      student: s.student_name
    }))
  })
  
  // Initialize the tutor store with the server data
  const setTutor = useTutorStore(state => state.setTutor)
  
  useEffect(() => {
    // Set the tutor data in the store
    setTutor(initialTutor)
  }, [initialTutor, setTutor])
  
  // Use data passed from server
  const tutor = initialTutor
  const activeStudentsCount = stats.activeStudentsCount
  const todaysSessions = stats.todaysSessions
  const todaysEarnings = todaysSessions * 50
  
  return (
    <div className="p-6">
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
          <p className="text-2xl font-bold">{todaysSessions}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
          <p className="text-2xl font-bold">${todaysEarnings}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
          <p className="text-2xl font-bold">{activeStudentsCount}</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          <p className="text-2xl font-bold">95%</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.slice(0, 5).map((session) => (
              <div key={session.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div>
                  <p className="font-medium">
                    {session.student_name || 'Student'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(session.scheduled_at).toISOString().replace('T', ' ').slice(0, 16)} • {session.subject}
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

      {/* Debug Info - Shows in development and when deployed */}
      <div className="mb-8 p-4 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Info</h3>
        <p className="text-sm">Total Students: {students.length}</p>
        <p className="text-sm">Total Sessions Passed: {sessions.length}</p>
        <p className="text-sm">Stats - Today Sessions: {stats.todaysSessions}</p>
        <p className="text-sm">Stats - Active Students: {stats.activeStudentsCount}</p>
        <p className="text-sm">Last Updated: {new Date().toISOString()}</p>
        <p className="text-sm text-gray-600">Build: 2025-07-26-v2</p>
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
    </div>
  )
} 