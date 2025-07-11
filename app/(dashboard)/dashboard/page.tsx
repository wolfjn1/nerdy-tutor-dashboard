'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, Zap, Users, DollarSign } from 'lucide-react'
import { TutorProfileHeader, QuickActions } from '@/components/dashboard'
import { Card, Button, SimpleAreaChart } from '@/components/ui'
import dashboardDataRaw from '@/lib/mock-data/dashboard.json'

// Type assertion to ensure proper types
const dashboardData = dashboardDataRaw as any

export default function DashboardPage() {
  const nextSession = dashboardData.upcomingSessions[0]
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Welcome back, {dashboardData.tutor.name}! 👋
            </h1>
            <p className="text-slate-600">
              Here's your tutoring overview for today
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold bg-gradient-nerdy bg-clip-text text-transparent">
              Level {dashboardData.tutor.gamification.level}
            </div>
            <div className="text-sm text-slate-500">
              {dashboardData.tutor.gamification.xp} / {dashboardData.tutor.gamification.xpToNextLevel} XP
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
      >
        <Card className="glass-effect border-white/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-yellow-pink flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">3</div>
              <div className="text-sm text-slate-600">Sessions Today</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-pink-cyan flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">${todaysEarnings}</div>
              <div className="text-sm text-slate-600">Today's Earnings</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-orange-magenta flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">12</div>
              <div className="text-sm text-slate-600">Active Students</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-nerdy flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">94%</div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Next Session */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-effect border-white/30 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-cyan-500" />
                Next Session
              </h2>
              
              {nextSession ? (
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/60">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-pink-cyan flex items-center justify-center text-white font-bold">
                      {nextSession.studentName.split(' ').map((n: string) => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{nextSession.studentName}</div>
                      <div className="text-sm text-slate-600">{nextSession.subject}</div>
                      <div className="text-sm text-slate-500">
                        {new Date(nextSession.date).toLocaleDateString()} at {nextSession.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                    <Button variant="gradient" gradientType="pink-cyan" size="sm" xpReward={25}>
                      Start Session
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No upcoming sessions</p>
                </div>
              )}
            </Card>
          </motion.div>

          {/* Weekly Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass-effect border-white/30 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Weekly Earnings</h2>
              <div className="h-64">
                <SimpleAreaChart
                  data={weeklyProgress}
                  xDataKey="day"
                  yDataKey="amount"
                  height={200}
                  color="#06b6d4"
                  gradient={true}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <QuickActions actions={dashboardData.quickActions} />
          </motion.div>

          {/* Urgent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass-effect border-white/30 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Urgent Tasks</h2>
              <div className="space-y-3">
                {dashboardData.administrativeTasks
                  .filter((task: any) => task.priority === 'high')
                  .slice(0, 3)
                  .map((task: any, index: number) => (
                    <div key={task.id} className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <div className="font-medium text-red-800 text-sm">{task.title}</div>
                      <div className="text-xs text-red-600">Due: {task.dueDate}</div>
                    </div>
                  ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-3"
                >
                  View All Tasks
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* Opportunities */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="glass-effect border-white/30 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">New Opportunities</h2>
              <div className="space-y-3">
                {dashboardData.openOpportunities.slice(0, 2).map((opportunity: any, index: number) => (
                  <div key={opportunity.id} className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <div className="font-medium text-blue-800 text-sm">{opportunity.studentName}</div>
                    <div className="text-xs text-blue-600">{opportunity.subject} • ${opportunity.hourlyRate}/hr</div>
                  </div>
                ))}
                
                <Button 
                  variant="gradient" 
                  gradientType="orange-magenta" 
                  size="sm" 
                  className="w-full mt-3"
                  xpReward={20}
                >
                  Browse All Opportunities
                </Button>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 