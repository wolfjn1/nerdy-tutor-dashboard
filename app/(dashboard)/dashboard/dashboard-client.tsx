'use client'

import React, { useEffect } from 'react'
import { useTutorStore } from '@/lib/stores/tutorStore'
import Link from 'next/link'
import { OnboardingCompletionBanner } from './OnboardingCompletionBanner'
import GamificationWidget from '@/components/dashboard/GamificationWidget'
import GamificationSummaryCard from '@/components/dashboard/GamificationSummaryCard'
import { AchievementNotificationContainer } from '@/components/gamification'
import { TierProgress } from '@/components/gamification/TierProgress'
import { BonusTracker } from '@/components/gamification/BonusTracker'

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
  gamificationData?: {
    totalPoints: number
    currentLevel: string
    currentTier: string
    badges: Array<{ badge_type: string; earned_at: string }>
    recentAchievements: Array<{
      id: string
      type: string
      title: string
      earned_at: string
      points?: number
    }>
    weeklyPoints: number
    currentStreak: number
    nextMilestone: any
  }
}

export default function DashboardClient({ 
  initialTutor, 
  user,
  students = [],
  sessions = [],
  stats = { activeStudentsCount: 0, todaysSessions: 0, totalStudents: 0 },
  gamificationData
}: DashboardClientProps) {
  // Debug logging
  console.log('Dashboard Client Data:', {
    studentsCount: students.length,
    sessionsCount: sessions.length,
    stats,
    gamificationData,
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
      {/* Achievement Notifications */}
      <AchievementNotificationContainer 
        tutorId={initialTutor.id}
        position="bottom-right"
        showBadges={true}
        showAchievements={true}
      />
      
      {/* Onboarding Completion Banner */}
      <OnboardingCompletionBanner />
      
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome back, {tutor.first_name || 'Tutor'} {tutor.last_name || ''}! 👋
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Here's your tutoring overview for today
        </p>
      </div>

      {/* Replace mock gamification header with real gamification widget */}
      {gamificationData && (
        <div className="mb-8">
          <GamificationWidget 
            data={{
              totalPoints: gamificationData.totalPoints,
              currentLevel: gamificationData.currentLevel,
              levelProgress: 0, // Will be calculated in the widget
              currentTier: gamificationData.currentTier,
              recentAchievements: gamificationData.recentAchievements,
              badges: gamificationData.badges,
              nextMilestone: gamificationData.nextMilestone
            }}
            tutorId={initialTutor.id}
          />
        </div>
      )}

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

      {/* Two column layout for sessions and gamification summary */}
      <div className="grid gap-8 lg:grid-cols-2 mb-8">
        {/* Upcoming Sessions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
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
          {sessions.length > 5 && (
            <Link href="/sessions" className="block mt-4">
              <p className="text-sm text-center text-blue-600 dark:text-blue-400 font-medium">
                View All Sessions →
              </p>
            </Link>
          )}
        </div>

        {/* Gamification Summary */}
        {gamificationData && (
          <GamificationSummaryCard 
            totalPoints={gamificationData.totalPoints}
            currentLevel={gamificationData.currentLevel}
            currentStreak={gamificationData.currentStreak}
            weeklyPoints={gamificationData.weeklyPoints}
          />
        )}

        {/* Tier Progress */}
        <TierProgress />
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
        
        <Link href="/achievements" className="block">
          <button className="w-full p-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg shadow-sm hover:shadow-md transition-shadow text-left">
            <h4 className="font-semibold mb-2">View Achievements</h4>
            <p className="text-sm text-purple-100">Track your progress & rewards</p>
          </button>
        </Link>
      </div>

      {/* Bonus Tracker */}
      <div className="mt-8">
        <BonusTracker />
      </div>
    </div>
  )
} 