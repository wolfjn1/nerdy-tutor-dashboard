'use client'

export const dynamic = 'force-dynamic'

import React, { useEffect, useState } from 'react'
import { Calendar, Clock, TrendingUp, Users, DollarSign, Target, BookOpen, Trophy } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'
import { useHydratedStore } from '@/lib/hooks/useHydratedStore'
import { 
  getTodaysSessions, 
  getTodaysEarnings, 
  getActiveStudentsCount, 
  getSuccessRate,
  getUpcomingSessions,
  getRequiredActions,
  getQuickActions
} from '@/lib/api/dashboard'
import { format } from 'date-fns'

export default function DashboardPage() {
  const { tutor, level, totalXP, xpForNextLevel, streak, students, sessions, isHydrated } = useHydratedStore()
  const { loading: authLoading, user, tutor: authTutor } = useAuth()
  const [mounted, setMounted] = React.useState(false)
  
  // Dashboard data state
  const [todaysSessions, setTodaysSessions] = useState<number>(0)
  const [todaysEarnings, setTodaysEarnings] = useState<number>(0)
  const [activeStudentsCount, setActiveStudentsCount] = useState<number>(0)
  const [successRate, setSuccessRate] = useState<number>(0)
  const [upcomingSessions, setUpcomingSessions] = useState<any[]>([])
  const [requiredActions, setRequiredActions] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  // Debug auth changes
  React.useEffect(() => {
    console.log('[Dashboard] Auth state changed:', {
      authLoading,
      user: user?.email,
      authTutor: authTutor?.email,
      storeTutor: tutor?.email
    })
  }, [authLoading, user, authTutor, tutor])
  
  // Use tutor from auth if store is not ready
  const actualTutor = authTutor || tutor
  
  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      console.log('[Dashboard] Fetch attempt - tutor:', actualTutor)
      if (!actualTutor?.id) {
        console.log('[Dashboard] No tutor ID, skipping fetch')
        return
      }
      
      setDataLoading(true)
      try {
        const [
          sessionsData,
          earnings,
          activeCount,
          rate,
          upcoming,
          actions
        ] = await Promise.all([
          getTodaysSessions(actualTutor.id),
          getTodaysEarnings(actualTutor.id),
          getActiveStudentsCount(actualTutor.id),
          getSuccessRate(actualTutor.id),
          getUpcomingSessions(actualTutor.id, 3),
          getRequiredActions(actualTutor.id)
        ])
        
        setTodaysSessions(sessionsData.length)
        setTodaysEarnings(earnings)
        setActiveStudentsCount(activeCount)
        setSuccessRate(rate)
        setUpcomingSessions(upcoming)
        setRequiredActions(actions)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setDataLoading(false)
      }
    }
    
    if (mounted && actualTutor?.id) {
      fetchDashboardData()
    }
  }, [mounted, actualTutor?.id])
  
  // Debug log
  console.log('[Dashboard] Tutor data from store:', tutor)
  console.log('[Dashboard] Tutor data from auth:', authTutor)
  console.log('[Dashboard] User from auth:', user)
  console.log('[Dashboard] Auth loading:', authLoading)
  console.log('[Dashboard] Mounted:', mounted)
  console.log('[Dashboard] isHydrated:', isHydrated)
  console.log('[Dashboard] Environment:', {
    NODE_ENV: process.env.NODE_ENV,
    hasSupabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasSupabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  })
  
  // Temporary fix: Clear cache button
  const clearCacheAndReload = () => {
    localStorage.removeItem('tutor-store')
    // Also clear any service worker caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => caches.delete(name))
      })
    }
    window.location.reload()
  }
  
  // Show loading skeleton while store is hydrating or auth is initializing
  if (!mounted || (!actualTutor && authLoading)) {
    console.log('[Dashboard] Showing skeleton - mounted:', mounted, 'isHydrated:', isHydrated, 'actualTutor:', !!actualTutor, 'authLoading:', authLoading)
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700" />
          <div>
            <div className="h-8 w-64 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-4">
      {/* Temporary cache clear button */}
      {!tutor && !authLoading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
            If you're seeing loading issues, click below to clear cache:
          </p>
          <button
            onClick={clearCacheAndReload}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md text-sm font-medium"
          >
            Clear Cache & Reload
          </button>
        </div>
      )}
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Tutor Image */}
          <div className="flex-shrink-0">
            <img 
                              src={actualTutor?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
              alt={actualTutor ? `${actualTutor.first_name} ${actualTutor.last_name}` : "Tutor"}
              className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-200 dark:ring-pink-800 shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Welcome back{actualTutor ? `, ${actualTutor.first_name} ${actualTutor.last_name}` : ''}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Here's your tutoring overview for today
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Gamification Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 dark:from-purple-700 dark:via-pink-600 dark:to-purple-800 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">Level {level || 42}</div>
              <div className="text-purple-100 dark:text-purple-200">Expert</div>
            </div>
            
            <div className="hidden lg:block h-16 w-px bg-white/30" />
            
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-300" />
              <div>
                <div className="text-2xl font-bold">{streak || 21}</div>
                <div className="text-sm text-purple-100 dark:text-purple-200">day streak</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            <div className="flex justify-between text-sm mb-2">
              <span>{(() => {
                // Calculate XP within current level
                let remainingXP = totalXP || 0
                for (let i = 1; i < (level || 1); i++) {
                  // XP formula: level * 100 + (level - 1) * 50
                  remainingXP -= (i * 100 + (i - 1) * 50)
                }
                return remainingXP
              })()} / {xpForNextLevel || 100} XP</span>
              <span>to next level</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-yellow-300 to-yellow-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${(() => {
                  // Calculate progress within current level
                  let remainingXP = totalXP || 0
                  for (let i = 1; i < (level || 1); i++) {
                    remainingXP -= (i * 100 + (i - 1) * 50)
                  }
                  const progress = (remainingXP / (xpForNextLevel || 100)) * 100
                  return Math.min(100, Math.max(0, progress))
                })()}%` }}
              />
            </div>
            
            {/* Recent Achievements */}
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm font-medium">Recent:</span>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-white/20 dark:bg-white/10 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  🎯 Century Club
                </span>
                <span className="px-3 py-1.5 bg-white/20 dark:bg-white/10 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  ⭐ Perfect Week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {dataLoading ? '...' : todaysSessions}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Sessions Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-pink-200 dark:border-pink-800 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                ${dataLoading ? '...' : todaysEarnings.toFixed(0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Today's Earnings</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {dataLoading ? '...' : activeStudentsCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Students</div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-pink-200 dark:border-pink-800 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {dataLoading ? '...' : successRate}%
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Session Card */}
      {upcomingSessions.length > 0 && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Next Session</h2>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-400 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {upcomingSessions[0].students?.first_name?.[0]}{upcomingSessions[0].students?.last_name?.[0]}
              </div>
              <div>
                <div className="font-medium">{upcomingSessions[0].students?.first_name} {upcomingSessions[0].students?.last_name}</div>
                <div className="text-sm text-gray-300">
                  {upcomingSessions[0].subject} • {format(new Date(upcomingSessions[0].scheduled_at), 'MMM d, h:mm a')}
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
                Reschedule
              </button>
              <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 rounded-lg text-sm font-medium transition-colors">
                Start Session
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Required Actions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold">Required Actions</h2>
          </div>
          
          <div className="space-y-3">
            {dataLoading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : requiredActions.length > 0 ? (
              requiredActions.slice(0, 3).map((action) => (
                <div 
                  key={action.id} 
                  className={`p-3 rounded-lg border ${
                    action.urgency === 'high' 
                      ? 'border-red-500/50 bg-red-500/10' 
                      : 'border-yellow-500/50 bg-yellow-500/10'
                  }`}
                >
                  <div className="font-medium text-sm">{action.title}</div>
                  <div className="text-xs text-gray-300 mt-1">{action.description}</div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No actions required</div>
            )}
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-white shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Today's Schedule</h2>
          
          <div className="space-y-3">
            {dataLoading ? (
              <div className="text-gray-400 text-sm">Loading...</div>
            ) : upcomingSessions.length > 0 ? (
              upcomingSessions.map((session) => (
                <div key={session.id} className="flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                  <div className="w-1.5 h-12 bg-purple-500 rounded-full" />
                  <div className="flex-1">
                    <div className="font-medium text-sm">
                      {session.students?.first_name} {session.students?.last_name}
                    </div>
                    <div className="text-xs text-gray-300">
                      {format(new Date(session.scheduled_at), 'h:mm a')} - {session.subject}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-gray-400 text-sm">No sessions scheduled today</div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold">Quick Actions</h2>
          </div>
          
          <div className="space-y-3">
            <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium">AI Lesson Builder</div>
                  <div className="text-xs text-gray-300">Create lesson plans</div>
                </div>
              </div>
            </button>
            
            <button className="w-full p-4 bg-white/10 hover:bg-white/20 rounded-lg text-left transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="font-medium">AI Study Assistant</div>
                  <div className="text-xs text-gray-300">Generate problems</div>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 