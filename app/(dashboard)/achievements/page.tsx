'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Target, Award, Zap, Users, Loader, TrendingUp, Book, Clock, Sparkles, Medal } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { useAuth } from '@/lib/auth/simple-auth-context'
import { getTutorAchievements, getAchievementStats, groupAchievementsByTier } from '@/lib/api/achievements'
import { cn } from '@/lib/utils'

// Icon mapping based on achievement type
const getAchievementIcon = (achievement: any) => {
  const iconMap: { [key: string]: any } = {
    'sessions_count': Trophy,
    'hours_taught': Clock,
    'student_rating': Star,
    'streak_days': Zap,
  }
  
  return iconMap[achievement.condition_type] || Trophy
}

export default function AchievementsPage() {
  const { tutor } = useAuth()
  const [achievements, setAchievements] = useState<any[]>([])
  const [tieredAchievements, setTieredAchievements] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!tutor?.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const [achievementsData, statsData] = await Promise.all([
          getTutorAchievements(tutor.id),
          getAchievementStats(tutor.id)
        ])
        
        setAchievements(achievementsData)
        const grouped = groupAchievementsByTier(achievementsData)
        setTieredAchievements(grouped)
        setStats(statsData)
      } catch (err) {
        console.error('Error fetching achievements:', err)
        setError('Failed to load achievements')
      } finally {
        setLoading(false)
      }
    }
    
    fetchAchievements()
  }, [tutor?.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading achievements...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Achievements 🏆
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Progress through Bronze → Silver → Gold → Diamond tiers
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-purple-200 dark:border-purple-800 p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
            {tieredAchievements.reduce((count, a) => count + (a.tierIndex + 1), 0)}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Tiers Unlocked</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-green-200 dark:border-green-800 p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
            {stats?.totalXPEarned || 0}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total XP Earned</div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800 p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {tieredAchievements.filter(a => a.tierIndex === 3).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Diamond Achievements</div>
        </div>
      </motion.div>

      {/* Tiered Achievements Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {tieredAchievements.map((achievement, index) => {
          const Icon = getAchievementIcon(achievement)
          
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
            >
              <Card className="p-6 hover:shadow-lg transition-all">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      `w-12 h-12 rounded-lg flex items-center justify-center`,
                      achievement.currentTier?.color || 'bg-gray-400'
                    )}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                        {achievement.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {achievement.description}
                      </p>
                    </div>
                  </div>
                  {achievement.totalXP > 0 && (
                    <Badge variant="gradient" size="sm">
                      +{achievement.totalXP} XP
                    </Badge>
                  )}
                </div>

                {/* Tier Badges */}
                <div className="flex items-center gap-2 mb-4">
                  {achievement.allTiers.map((tier: any, tierIdx: number) => {
                    const isAchieved = achievement.tierIndex >= tierIdx
                    const isCurrent = achievement.tierIndex === tierIdx
                    
                    return (
                      <div
                        key={tier.name}
                        className={cn(
                          "flex-1 text-center py-2 rounded-lg text-xs font-medium transition-all",
                          isAchieved ? tier.color : 'bg-gray-200 dark:bg-gray-700',
                          isAchieved ? 'text-white' : 'text-gray-500 dark:text-gray-400',
                          isCurrent && 'ring-2 ring-offset-2 ring-purple-500 dark:ring-offset-gray-800'
                        )}
                      >
                        <Medal className="h-4 w-4 mx-auto mb-1" />
                        {tier.name}
                      </div>
                    )
                  })}
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>Progress to {achievement.nextTier?.name || 'Complete'}</span>
                    <span>{achievement.progressText}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, achievement.progressPercent)}%` }}
                    />
                  </div>
                </div>

                {/* Next Tier Reward */}
                {achievement.nextTier && (
                  <div className="mt-3 text-xs text-gray-500 dark:text-gray-400">
                    Next: <span className="font-medium">{achievement.nextTier.name}</span> tier at {achievement.nextTier.value} {achievement.condition_type.replace('_', ' ')}
                  </div>
                )}
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Empty State */}
      {tieredAchievements.length === 0 && (
        <div className="text-center py-12">
          <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No achievements yet. Start teaching to unlock your first achievement!</p>
        </div>
      )}
    </div>
  )
} 