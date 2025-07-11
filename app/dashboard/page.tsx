'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, Zap, Users, DollarSign, AlertTriangle, Target } from 'lucide-react'

// Temporarily comment out complex imports to debug
// import { TutorProfileHeader, QuickActions } from '@/components/dashboard'
// import { Card, Button, SimpleAreaChart } from '@/components/ui'
// import dashboardDataRaw from '@/lib/mock-data/dashboard.json'

// Simple mock data for testing
const mockData = {
  tutor: {
    name: "John Doe",
    gamification: {
      level: 42,
      rank: "Expert",
      streak: 21,
      xp: 2450,
      xpToNextLevel: 3000,
      achievements: [
        { id: "1", title: "Century Club", icon: "🎯" },
        { id: "2", title: "Perfect Week", icon: "⭐" }
      ]
    }
  },
  upcomingSessions: [
    {
      id: "1",
      studentName: "Sarah Chen",
      subject: "AP Calculus",
      date: "2025-07-07",
      time: "14:00"
    }
  ],
  administrativeTasks: [
    {
      id: "1",
      title: "Submit December timesheet",
      priority: "high",
      dueDate: "2024-01-17"
    }
  ],
  openOpportunities: [
    {
      id: "1",
      studentName: "Alex Thompson",
      subject: "Linear Algebra",
      hourlyRate: 95,
      urgency: "high"
    }
  ]
}

export default function DashboardPage() {
  const nextSession = mockData.upcomingSessions[0]
  const todaysEarnings = 425
  const weeklyProgress = [
    { day: 'Mon', amount: 85 },
    { day: 'Tue', amount: 170 },
    { day: 'Wed', amount: 0 },
    { day: 'Thu', amount: 255 },
    { day: 'Fri', amount: 120 },
    { day: 'Sat', amount: 0 },
    { day: 'Sun', amount: 90 }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Debug Message */}
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        <strong>Debug:</strong> Dashboard page is rendering! 🎉
      </div>

      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back, {mockData.tutor.name}! 👋
            </h1>
            <p className="text-slate-600">
              Here's your tutoring overview for today
            </p>
          </div>
          
          {/* Gamification Section */}
          <div className="lg:text-right">
            <div className="flex items-center gap-4 lg:justify-end">
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                  Level {mockData.tutor.gamification.level}
                </div>
                <div className="text-sm text-slate-500">
                  {mockData.tutor.gamification.rank}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div className="text-right">
                  <div className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {mockData.tutor.gamification.streak}
                  </div>
                  <div className="text-xs text-slate-500">day streak</div>
                </div>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="mt-4 lg:w-64">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  {mockData.tutor.gamification.xp} / {mockData.tutor.gamification.xpToNextLevel} XP
                </span>
                <span className="text-xs text-slate-500">to next level</span>
              </div>
              <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${(mockData.tutor.gamification.xp / mockData.tutor.gamification.xpToNextLevel) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            
            {/* Recent Achievements */}
            <div className="flex items-center gap-2 mt-3 lg:justify-end">
              <span className="text-xs text-slate-500">Recent:</span>
              {mockData.tutor.gamification.achievements.slice(0, 2).map((achievement: any) => (
                <motion.div
                  key={achievement.id}
                  className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-pink-100 border border-yellow-200"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-sm">{achievement.icon}</span>
                  <span className="text-xs text-slate-700 font-medium">{achievement.title}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6"
      >
        <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">3</div>
              <div className="text-sm text-slate-600">Sessions Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center shadow-md">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">${todaysEarnings}</div>
              <div className="text-sm text-slate-600">Today's Earnings</div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">12</div>
              <div className="text-sm text-slate-600">Active Students</div>
            </div>
          </div>
        </div>

        <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">94%</div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Next Session Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="bg-white/60 backdrop-blur-sm border border-white/30 rounded-lg p-6">
          <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-500" />
            Next Session
          </h2>
          
          {nextSession && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 lg:p-6 rounded-lg bg-white/60 border border-white/40 hover:bg-white/80 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-md">
                  {nextSession.studentName.split(' ').map((n: string) => n[0]).join('')}
                </div>
                <div>
                  <div className="font-semibold text-slate-800 text-lg">{nextSession.studentName}</div>
                  <div className="text-sm text-slate-600 font-medium">{nextSession.subject}</div>
                  <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(nextSession.date).toLocaleDateString()} at {nextSession.time}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors">
                  Reschedule
                </button>
                <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-shadow">
                  Start Session
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Debug Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">Debug Information:</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>✅ Dashboard page component is rendering</li>
          <li>✅ Mock data is loading: {mockData.tutor.name}</li>
          <li>✅ Framer Motion animations are working</li>
          <li>✅ Tailwind CSS classes are applied</li>
          <li>✅ Icons from Lucide React are displaying</li>
        </ul>
      </div>
    </div>
  )
} 