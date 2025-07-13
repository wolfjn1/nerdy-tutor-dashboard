'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Users, Calendar, Zap, Sparkles, Trophy } from 'lucide-react'
import { Avatar, Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useTutorStore } from '@/lib/stores/tutorStore'

interface TutorProfileHeaderProps {
  className?: string
}

export const TutorProfileHeader: React.FC<TutorProfileHeaderProps> = ({
  className
}) => {
  const { tutor, level, totalXP, xpForNextLevel, streak } = useTutorStore()
  
  if (!tutor) return null
  
  const xpProgress = (totalXP / xpForNextLevel) * 100

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
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              {tutor.first_name} {tutor.last_name}
            </h1>
            <p className="text-slate-600 mb-2">Expert Tutor</p>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-slate-600">
                {tutor.rating} • {tutor.total_hours} hours taught
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tutor.subjects.slice(0, 3).map((subject) => (
                <Badge 
                  key={subject} 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-100 text-slate-700 border-slate-200"
                  animate={false}
                >
                  {subject}
                </Badge>
              ))}
              {tutor.subjects.length > 3 && (
                <Badge 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-100 text-slate-700 border-slate-200"
                  animate={false}
                >
                  +{tutor.subjects.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' }}>
            <div className="text-xl font-bold text-white">
              {tutor.total_hours}
            </div>
            <div className="text-xs text-white/90 font-medium">Total Hours</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #06b6d4 100%)' }}>
            <div className="text-xl font-bold text-white">
              ${(tutor.total_earnings / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-white/90 font-medium">Total Earned</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316 0%, #d946ef 100%)' }}>
            <div className="text-xl font-bold text-white">
              {level}
            </div>
            <div className="text-xs text-white/90 font-medium">Level</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #ec4899 50%, #d946ef 75%, #06b6d4 100%)' }}>
            <div className="text-xl font-bold text-white">
              {streak}
            </div>
            <div className="text-xs text-white/90 font-medium">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Gamification Section */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-lg font-bold text-slate-800">
                Expert • Level {level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-slate-600">
                {totalXP} / {xpForNextLevel} XP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-sm font-bold bg-gradient-orange-magenta bg-clip-text text-transparent">
              {streak} day streak
            </span>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="relative w-full h-3 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="absolute left-0 top-0 h-full rounded-full"
            style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #ec4899 50%, #d946ef 75%, #06b6d4 100%)' }}
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </div>

        {/* Recent Achievements */}
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm text-slate-600">Recent achievements:</span>
          <div className="flex gap-2">
            {tutor.badges.slice(0, 2).map((badge) => (
              <motion.div
                key={badge}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 border border-slate-200"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm">🏆</span>
                <span className="text-xs text-slate-700">{badge}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default TutorProfileHeader 