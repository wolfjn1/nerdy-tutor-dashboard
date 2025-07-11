'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { 
  TutorProfileHeader, 
  WeeklyCalendar, 
  OpenOpportunities, 
  QuickActions, 
  EarningsSummary, 
  AdministrativeTasks 
} from '@/components/dashboard'
import dashboardDataRaw from '@/lib/mock-data/dashboard.json'

// Type assertion to ensure proper types
const dashboardData = dashboardDataRaw as any

export default function TutorDashboard() {
  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="container mx-auto px-4 py-8">
        {/* Header Section with Logo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              {/* Nerdy Logo */}
              <div className="relative">
                <div className="w-16 h-16 rounded-xl bg-white/80 backdrop-blur-sm border border-white/90 flex items-center justify-center shadow-lg">
                  <Image 
                    src="/nerdy-logo.png" 
                    alt="Nerdy Live+AI" 
                    width={64} 
                    height={64} 
                    className="rounded-xl"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">
                  Welcome back, {dashboardData.tutor.name}! 👋
                </h1>
                <p className="text-slate-600">
                  Here's what's happening with your tutoring today
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-slate-500">
                {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tutor Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-8"
        >
          <TutorProfileHeader tutor={dashboardData.tutor} />
        </motion.div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left Column - Calendar and Opportunities */}
          <div className="xl:col-span-2 space-y-8">
            {/* Weekly Calendar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <WeeklyCalendar sessions={dashboardData.upcomingSessions} />
            </motion.div>

            {/* Open Opportunities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <OpenOpportunities opportunities={dashboardData.openOpportunities} />
            </motion.div>
          </div>

          {/* Right Column - Actions, Earnings, and Tasks */}
          <div className="space-y-8">
            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <QuickActions actions={dashboardData.quickActions} />
            </motion.div>

            {/* Earnings Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <EarningsSummary earnings={dashboardData.earnings} />
            </motion.div>

            {/* Administrative Tasks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <AdministrativeTasks tasks={dashboardData.administrativeTasks} />
            </motion.div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-8"
        >
          <div className="glass-effect border-white/30 rounded-xl p-6">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {dashboardData.recentActivities.map((activity: any, index: number) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.7 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-white/50 border border-white/30"
                >
                  <div className="w-2 h-2 rounded-full" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #ec4899 50%, #d946ef 75%, #06b6d4 100%)' }}></div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">{activity.message}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {activity.xpEarned > 0 && (
                    <div className="text-xs bg-gradient-yellow-pink bg-clip-text text-transparent font-bold">
                      +{activity.xpEarned} XP
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="text-sm text-slate-500">
            Powered by{' '}
            <span className="bg-gradient-nerdy bg-clip-text text-transparent font-bold">
              Nerdy Live+AI™
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 