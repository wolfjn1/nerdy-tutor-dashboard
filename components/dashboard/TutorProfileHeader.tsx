'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Users, Calendar, Zap, Sparkles, Trophy, Clock, DollarSign } from 'lucide-react'
import { Avatar, Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useTutorStore } from '@/lib/stores/tutorStore'

interface TutorProfileHeaderProps {
  className?: string
  totalSessions?: number
  activeStudents?: number
  monthlyEarnings?: number
}

export const TutorProfileHeader: React.FC<TutorProfileHeaderProps> = ({
  className,
  totalSessions = 0,
  activeStudents = 0,
  monthlyEarnings = 0
}) => {
  const { tutor, level, totalXP, xpForNextLevel } = useTutorStore()
  
  if (!tutor) return null
  
  // Calculate XP based on actual activity (10 XP per session)
  const calculatedXP = totalSessions * 10
  const displayXP = calculatedXP || totalXP || 0
  const xpProgress = (displayXP % 100) // Progress within current level

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-500'
      case 'busy':
        return 'bg-red-500'
      case 'away':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className={cn('glass-effect border-white/30 p-6', className)}>
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Profile Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              src={tutor.avatar_url}
              fallback={tutor.first_name && tutor.last_name ? `${tutor.first_name[0]}${tutor.last_name[0]}` : "TU"}
              size="2xl"
              className="ring-4 ring-white/30"
              animate={false}
            />
            <div className={cn(
              'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white/50',
              getStatusColor('available')
            )} />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-1">
              {tutor.first_name} {tutor.last_name}
            </h1>
            <p className="text-slate-600 dark:text-gray-300 mb-2">Expert Tutor</p>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-slate-600 dark:text-gray-400">
                {tutor.rating} • {tutor.total_hours} hours taught
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tutor.subjects.slice(0, 3).map((subject) => (
                <Badge 
                  key={subject} 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-600"
                  animate={false}
                >
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 3 && (
                <Badge 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-300 border-slate-200 dark:border-gray-600"
                  animate={false}
                >
                  +{tutor.subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section - Updated with meaningful metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)' }}>
            <div className="text-xl font-bold text-white">
              {tutor.total_hours}
            </div>
            <div className="text-xs text-white/90 font-medium">Total Hours</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}>
            <div className="text-xl font-bold text-white">
              {activeStudents}
            </div>
            <div className="text-xs text-white/90 font-medium">Active Students</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #f97316 100%)' }}>
            <div className="text-xl font-bold text-white">
              {totalSessions}
            </div>
            <div className="text-xs text-white/90 font-medium">Total Sessions</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #d946ef 100%)' }}>
            <div className="text-xl font-bold text-white">
              ${monthlyEarnings}
            </div>
            <div className="text-xs text-white/90 font-medium">This Month</div>
          </div>
        </div>
      </div>

      {/* Gamification Section - Improved spacing */}
      <div className="mt-6 pt-6 border-t border-slate-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-lg font-bold text-slate-800 dark:text-white">
                Level {Math.floor(displayXP / 100) + 1}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-slate-600 dark:text-gray-400">
                {displayXP} XP Total
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-slate-700 dark:text-gray-300">
              {totalSessions > 0 ? `${(totalSessions / 30).toFixed(1)} sessions/day avg` : 'Start teaching to earn XP!'}
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative w-full h-3 bg-slate-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>
        <div className="flex justify-between mt-2">
          <span className="text-xs text-slate-600 dark:text-gray-400">
            {xpProgress} / 100 XP to next level
          </span>
          <span className="text-xs text-slate-600 dark:text-gray-400">
            +10 XP per session
          </span>
        </div>

        {/* Recent Achievements - Better spacing */}
        {tutor.badges && tutor.badges.length > 0 && (
          <div className="flex items-center gap-3 mt-4">
            <span className="text-sm text-slate-600 dark:text-gray-400">Recent:</span>
            <div className="flex gap-2">
              {tutor.badges.slice(0, 2).map((badge) => (
                <motion.div
                  key={badge}
                  className="flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-gray-700 border border-slate-200 dark:border-gray-600"
                  whileHover={{ scale: 1.05 }}
                >
                  <span className="text-sm">🏆</span>
                  <span className="text-xs text-slate-700 dark:text-gray-300">{badge}</span>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default TutorProfileHeader 