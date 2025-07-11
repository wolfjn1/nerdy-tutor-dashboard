'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Clock, TrendingUp, Zap, Users, DollarSign, AlertTriangle, Target } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto space-y-8">
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
              Welcome back, {dashboardData.tutor.name}! 👋
            </h1>
            <p className="text-slate-600">
              Here's your tutoring overview for today
            </p>
          </div>
          
          {/* Gamification Section */}
          <div className="lg:text-right">
            <div className="flex items-center gap-4 lg:justify-end">
              <div className="text-right">
                <div className="text-2xl font-bold bg-gradient-nerdy bg-clip-text text-transparent">
                  Level {dashboardData.tutor.gamification.level}
                </div>
                <div className="text-sm text-slate-500">
                  {dashboardData.tutor.gamification.rank}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">🔥</span>
                <div className="text-right">
                  <div className="text-lg font-bold bg-gradient-orange-magenta bg-clip-text text-transparent">
                    {dashboardData.tutor.gamification.streak}
                  </div>
                  <div className="text-xs text-slate-500">day streak</div>
                </div>
              </div>
            </div>
            
            {/* XP Progress Bar */}
            <div className="mt-4 lg:w-64">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">
                  {dashboardData.tutor.gamification.xp} / {dashboardData.tutor.gamification.xpToNextLevel} XP
                </span>
                <span className="text-xs text-slate-500">to next level</span>
              </div>
              <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <motion.div
                  className="absolute left-0 top-0 h-full rounded-full"
                  style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #ec4899 50%, #d946ef 75%, #06b6d4 100%)' }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(dashboardData.tutor.gamification.xp / dashboardData.tutor.gamification.xpToNextLevel) * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              </div>
            </div>
            
            {/* Recent Achievements */}
            <div className="flex items-center gap-2 mt-3 lg:justify-end">
              <span className="text-xs text-slate-500">Recent:</span>
              {dashboardData.tutor.gamification.achievements.slice(0, 2).map((achievement: any) => (
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
        <Card className="glass-effect border-white/30 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-yellow-pink flex items-center justify-center shadow-md">
              <Calendar className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">3</div>
              <div className="text-sm text-slate-600">Sessions Today</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-pink-cyan flex items-center justify-center shadow-md">
              <DollarSign className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">${todaysEarnings}</div>
              <div className="text-sm text-slate-600">Today's Earnings</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-orange-magenta flex items-center justify-center shadow-md">
              <Users className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">12</div>
              <div className="text-sm text-slate-600">Active Students</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-4 lg:p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center gap-3 lg:gap-4">
            <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-lg bg-gradient-nerdy flex items-center justify-center shadow-md">
              <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div>
              <div className="text-xl lg:text-2xl font-bold text-slate-800">94%</div>
              <div className="text-sm text-slate-600">Success Rate</div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6 lg:space-y-8">
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 lg:p-6 rounded-lg bg-white/60 border border-white/40 hover:bg-white/80 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-full bg-gradient-pink-cyan flex items-center justify-center text-white font-bold shadow-md">
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
                  <div className="flex gap-2 sm:flex-col lg:flex-row">
                    <Button variant="outline" size="sm" className="flex-1 sm:flex-none">
                      Reschedule
                    </Button>
                    <Button variant="gradient" gradientType="pink-cyan" size="sm" xpReward={25} className="flex-1 sm:flex-none">
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
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-500" />
                  Weekly Earnings
                </h2>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-800">${weeklyProgress.reduce((sum, day) => sum + day.amount, 0)}</div>
                  <div className="text-xs text-slate-500">This Week</div>
                </div>
              </div>
              <div className="h-64">
                <SimpleAreaChart
                  data={weeklyProgress}
                  xDataKey="day"
                  yDataKey="amount"
                  height={240}
                  color="#06b6d4"
                  gradient={true}
                />
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6 lg:space-y-8">
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Urgent Tasks
                </h2>
                <div className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  {dashboardData.administrativeTasks.filter((task: any) => task.priority === 'high').length}
                </div>
              </div>
              <div className="space-y-3">
                {dashboardData.administrativeTasks
                  .filter((task: any) => task.priority === 'high')
                  .slice(0, 3)
                  .map((task: any, index: number) => (
                    <motion.div 
                      key={task.id} 
                      className="p-3 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
                      whileHover={{ scale: 1.02 }}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="font-medium text-red-800 text-sm">{task.title}</div>
                      <div className="text-xs text-red-600 flex items-center gap-1 mt-1">
                        <Clock className="w-3 h-3" />
                        Due: {task.dueDate}
                      </div>
                    </motion.div>
                  ))}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full mt-4"
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  New Opportunities
                </h2>
                <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-medium">
                  {dashboardData.openOpportunities.length}
                </div>
              </div>
              <div className="space-y-3">
                {dashboardData.openOpportunities.slice(0, 2).map((opportunity: any, index: number) => (
                  <motion.div 
                    key={opportunity.id} 
                    className="p-3 rounded-lg bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="font-medium text-blue-800 text-sm">{opportunity.studentName}</div>
                    <div className="text-xs text-blue-600 flex items-center gap-2 mt-1">
                      <span>{opportunity.subject}</span>
                      <span>•</span>
                      <span className="font-medium">${opportunity.hourlyRate}/hr</span>
                      <span className="bg-blue-200 text-blue-700 px-1.5 py-0.5 rounded text-xs">
                        {opportunity.urgency}
                      </span>
                    </div>
                  </motion.div>
                ))}
                
                <Button 
                  variant="gradient" 
                  gradientType="orange-magenta" 
                  size="sm" 
                  className="w-full mt-4"
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