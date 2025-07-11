'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, TrendingUp, Users, Calendar, Zap, Sparkles, Trophy } from 'lucide-react'
import { Avatar, Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface TutorProfileHeaderProps {
  tutor: {
    id: string
    name: string
    email: string
    avatar: string
    title: string
    specialties: string[]
    rating: number
    totalSessions: number
    totalEarnings: number
    joinDate: string
    status: 'available' | 'busy' | 'away'
    location: string
    gamification: {
      level: number
      xp: number
      xpToNextLevel: number
      streak: number
      rank: string
      achievements: Array<{
        id: string
        title: string
        description: string
        icon: string
        unlockedAt: string
      }>
    }
  }
  className?: string
}

export const TutorProfileHeader: React.FC<TutorProfileHeaderProps> = ({
  tutor,
  className
}) => {
  const xpProgress = (tutor.gamification.xp / tutor.gamification.xpToNextLevel) * 100

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
              src={tutor.avatar}
              fallback={tutor.name.split(' ').map(n => n[0]).join('')}
              size="2xl"
              className="ring-4 ring-white/30"
            />
            <div className={cn(
              'absolute -bottom-1 -right-1 w-6 h-6 rounded-full border-2 border-white/50',
              getStatusColor(tutor.status)
            )} />
          </div>
          
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 mb-1">
              {tutor.name}
            </h1>
            <p className="text-slate-600 mb-2">{tutor.title}</p>
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span className="text-sm text-slate-600">
                {tutor.rating} • {tutor.totalSessions} sessions
              </span>
            </div>
            <div className="flex flex-wrap gap-1">
              {tutor.specialties.slice(0, 3).map((specialty) => (
                <Badge 
                  key={specialty} 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-100 text-slate-700 border-slate-200"
                >
                  {specialty}
                </Badge>
              ))}
              {tutor.specialties.length > 3 && (
                <Badge 
                  variant="secondary" 
                  size="sm"
                  className="bg-slate-100 text-slate-700 border-slate-200"
                >
                  +{tutor.specialties.length - 3} more
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 flex-1">
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 100%)' }}>
            <div className="text-xl font-bold text-white">
              {tutor.totalSessions}
            </div>
            <div className="text-xs text-white/90 font-medium">Total Sessions</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #ec4899 0%, #06b6d4 100%)' }}>
            <div className="text-xl font-bold text-white">
              ${(tutor.totalEarnings / 1000).toFixed(0)}k
            </div>
            <div className="text-xs text-white/90 font-medium">Total Earned</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #f97316 0%, #d946ef 100%)' }}>
            <div className="text-xl font-bold text-white">
              {tutor.gamification.level}
            </div>
            <div className="text-xs text-white/90 font-medium">Level</div>
          </div>
          <div className="text-center p-3 rounded-lg flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #fbbf24 0%, #f97316 25%, #ec4899 50%, #d946ef 75%, #06b6d4 100%)' }}>
            <div className="text-xl font-bold text-white">
              {tutor.gamification.streak}
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
                {tutor.gamification.rank} • Level {tutor.gamification.level}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-500" />
              <span className="text-sm text-slate-600">
                {tutor.gamification.xp} / {tutor.gamification.xpToNextLevel} XP
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <span className="text-sm font-bold bg-gradient-orange-magenta bg-clip-text text-transparent">
              {tutor.gamification.streak} day streak
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
            {tutor.gamification.achievements.slice(0, 2).map((achievement) => (
              <motion.div
                key={achievement.id}
                className="flex items-center gap-1 px-2 py-1 rounded-full bg-slate-100 border border-slate-200"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-sm">{achievement.icon}</span>
                <span className="text-xs text-slate-700">{achievement.title}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  )
}

export default TutorProfileHeader 