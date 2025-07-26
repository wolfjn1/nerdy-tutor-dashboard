'use client'

import React, { useEffect } from 'react'
import { useTutorStore } from '@/lib/stores/tutorStore'

interface DashboardClientProps {
  initialTutor: any
  user: any
}

export default function DashboardClient({ initialTutor, user }: DashboardClientProps) {
  // Initialize the tutor store with the server data
  const setTutor = useTutorStore(state => state.setTutor)
  
  useEffect(() => {
    // Set the tutor data in the store
    setTutor(initialTutor)
  }, [initialTutor])
  
  // Use initialTutor directly to avoid type issues
  const tutor = initialTutor
  
  return (
    <div className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {tutor.first_name} {tutor.last_name}! 👋
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
            <p className="text-purple-100">{tutor.title || 'Expert'}</p>
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
          <p className="text-2xl font-bold">0</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</p>
          <p className="text-2xl font-bold">$0</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Active Students</p>
          <p className="text-2xl font-bold">10</p>
        </div>
        
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
          <p className="text-2xl font-bold">95%</p>
        </div>
      </div>

      {/* Upcoming Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Upcoming Sessions</h3>
        <p className="text-gray-600 dark:text-gray-400">No upcoming sessions scheduled</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <button className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
          <h4 className="font-semibold mb-2">Schedule Session</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Book a new tutoring session</p>
        </button>
        
        <button className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
          <h4 className="font-semibold mb-2">View Students</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">Manage your student roster</p>
        </button>
        
        <button className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
          <h4 className="font-semibold mb-2">Check Messages</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">View your inbox</p>
        </button>
      </div>
    </div>
  )
} 