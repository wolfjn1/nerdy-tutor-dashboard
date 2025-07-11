'use client'

import React from 'react'
import { Calendar, Clock, TrendingUp, Users, DollarSign, Target, BookOpen, Trophy } from 'lucide-react'

// Temporarily comment out complex imports to debug
// import { TutorProfileHeader, QuickActions } from '@/components/dashboard'
// import { Card, Button, SimpleAreaChart } from '@/components/ui'
// import dashboardDataRaw from '@/lib/mock-data/dashboard.json'

// Simple mock data for testing - updated to trigger fresh deployment
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

  return (
    <div className="space-y-3 w-full">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
        {/* Welcome Message */}
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1.5">
            Welcome back, {mockData.tutor.name}! 👋
          </h1>
          <p className="text-slate-600 text-sm">
            Here's your tutoring overview for today
          </p>
        </div>
        
        {/* Gamification Section */}
        <div className="lg:text-right bg-white/60 backdrop-blur-sm rounded-xl p-2.5 border border-white/50 shadow-sm lg:min-w-[280px]">
          <div className="flex items-center gap-3 lg:justify-end mb-2">
            <div className="text-center lg:text-right">
              <div className="text-xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">
                Level {mockData.tutor.gamification.level}
              </div>
              <div className="text-sm text-slate-500 font-medium">
                {mockData.tutor.gamification.rank}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xl">🔥</span>
              <div className="text-center lg:text-right">
                <div className="text-lg font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                  {mockData.tutor.gamification.streak}
                </div>
                <div className="text-xs text-slate-500">day streak</div>
              </div>
            </div>
          </div>
          
          {/* XP Progress Bar */}
          <div className="w-full">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600 font-medium">
                {mockData.tutor.gamification.xp} / {mockData.tutor.gamification.xpToNextLevel} XP
              </span>
              <span className="text-xs text-slate-500">to next level</span>
            </div>
            <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 transition-all duration-1000 ease-out"
                style={{ width: `${(mockData.tutor.gamification.xp / mockData.tutor.gamification.xpToNextLevel) * 100}%` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
            </div>
          </div>
          
          {/* Recent Achievements */}
          <div className="flex items-center gap-2 mt-3 lg:justify-end">
            <span className="text-xs text-slate-500 font-medium">Recent:</span>
            {mockData.tutor.gamification.achievements.slice(0, 2).map((achievement: any) => (
              <div
                key={achievement.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-yellow-100 to-pink-100 border border-yellow-200 hover:scale-105 transition-transform"
              >
                <span className="text-xs">{achievement.icon}</span>
                <span className="text-xs text-slate-700 font-medium">{achievement.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
        <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-2.5 hover:shadow-lg hover:bg-white/80 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-yellow-400 to-pink-500 flex items-center justify-center shadow-lg">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">3</div>
              <div className="text-sm text-slate-600 font-medium">Sessions Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-2.5 hover:shadow-lg hover:bg-white/80 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center shadow-lg">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">${todaysEarnings}</div>
              <div className="text-sm text-slate-600 font-medium">Today's Earnings</div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-2.5 hover:shadow-lg hover:bg-white/80 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">12</div>
              <div className="text-sm text-slate-600 font-medium">Active Students</div>
            </div>
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-2.5 hover:shadow-lg hover:bg-white/80 transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900">94%</div>
              <div className="text-sm text-slate-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-3">
        {/* Left Column - Main Content */}
        <div className="xl:col-span-2 space-y-3">
          {/* Next Session Card */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-3 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Clock className="w-5 h-5 text-cyan-500" />
              Next Session
            </h2>
            
            {nextSession && (
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/80 to-white/60 border border-white/60 hover:from-white/90 hover:to-white/70 transition-all duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center text-white font-bold shadow-lg">
                    {nextSession.studentName.split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-lg">{nextSession.studentName}</div>
                    <div className="text-slate-600 font-medium flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      {nextSession.subject}
                    </div>
                    <div className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(nextSession.date).toLocaleDateString()} at {nextSession.time}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-auto">
                  <button className="px-3 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 transition-colors font-medium text-sm">
                    Reschedule
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-pink-500 to-cyan-500 text-white rounded-lg hover:shadow-lg transition-all duration-200 font-medium text-sm">
                    Start Session
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-3 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Target className="w-5 h-5 text-blue-500" />
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button className="p-3 rounded-xl bg-gradient-to-r from-yellow-50 to-pink-50 border border-yellow-200 hover:from-yellow-100 hover:to-pink-100 transition-all duration-200 text-left">
                <div className="font-semibold text-slate-900 mb-1">AI Lesson Builder</div>
                <div className="text-sm text-slate-600">Create personalized lesson plans</div>
              </button>
              <button className="p-3 rounded-xl bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 hover:from-cyan-100 hover:to-blue-100 transition-all duration-200 text-left">
                <div className="font-semibold text-slate-900 mb-1">Schedule Session</div>
                <div className="text-sm text-slate-600">Book new tutoring sessions</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Column - Sidebar Content */}
        <div className="space-y-3">
          {/* Recent Activity */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-3 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Recent Activity
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="text-sm font-medium text-green-800">Session completed with Sarah</div>
                <div className="text-xs text-green-600 mt-1">+25 XP earned</div>
              </div>
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <div className="text-sm font-medium text-blue-800">New student match found</div>
                <div className="text-xs text-blue-600 mt-1">Linear Algebra - $95/hr</div>
              </div>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="bg-white/70 backdrop-blur-sm border border-white/50 rounded-xl p-3 shadow-sm">
            <h3 className="font-bold text-slate-900 mb-3">Today's Schedule</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-1.5 h-6 bg-cyan-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Sarah Chen</div>
                  <div className="text-xs text-slate-600">2:00 PM - AP Calculus</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
                <div>
                  <div className="text-sm font-medium text-slate-900">Marcus Johnson</div>
                  <div className="text-xs text-slate-600">4:30 PM - SAT Math</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 