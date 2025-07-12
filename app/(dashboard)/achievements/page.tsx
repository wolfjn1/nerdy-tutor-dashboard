'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Trophy, Star, Target, Award, Zap, Users } from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'

export default function AchievementsPage() {
  const achievements = [
    {
      id: '1',
      title: 'First Session',
      description: 'Complete your first tutoring session',
      icon: Target,
      color: 'bg-green-500',
      earned: true,
      xp: 10
    },
    {
      id: '2',
      title: 'Century Club',
      description: 'Complete 100 tutoring sessions',
      icon: Trophy,
      color: 'bg-gold-500',
      earned: true,
      xp: 100
    },
    {
      id: '3',
      title: 'Perfect Week',
      description: 'Maintain 5-star rating for a week',
      icon: Star,
      color: 'bg-purple-500',
      earned: true,
      xp: 50
    },
    {
      id: '4',
      title: 'Master Tutor',
      description: 'Reach level 50',
      icon: Award,
      color: 'bg-blue-500',
      earned: false,
      xp: 200
    },
    {
      id: '5',
      title: 'Speed Demon',
      description: 'Complete 10 sessions in one day',
      icon: Zap,
      color: 'bg-orange-500',
      earned: false,
      xp: 75
    },
    {
      id: '6',
      title: 'Student Favorite',
      description: 'Get 50 five-star reviews',
      icon: Users,
      color: 'bg-pink-500',
      earned: false,
      xp: 150
    }
  ]

  const earnedAchievements = achievements.filter(a => a.earned)
  const totalXP = earnedAchievements.reduce((sum, a) => sum + a.xp, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Achievements 🏆
        </h1>
        <p className="text-gray-600">
          Track your progress and unlock rewards
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {earnedAchievements.length}
          </div>
          <div className="text-sm text-gray-600">Achievements Earned</div>
        </div>

        <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {totalXP}
          </div>
          <div className="text-sm text-gray-600">XP from Achievements</div>
        </div>

        <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            42
          </div>
          <div className="text-sm text-gray-600">Current Level</div>
        </div>
      </motion.div>

      {/* Achievements Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {achievements.map((achievement, index) => {
          const Icon = achievement.icon
          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <div className={`bg-white rounded-xl border shadow-sm p-6 h-full transition-all duration-300 ${
                achievement.earned 
                  ? 'border-gray-200 hover:shadow-lg' 
                  : 'border-gray-100 bg-gray-50 opacity-75'
              }`}>
                <div className={`w-12 h-12 ${achievement.color} rounded-lg flex items-center justify-center mb-4 ${
                  !achievement.earned && 'opacity-50'
                }`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                
                <div className="flex items-center gap-2 mb-2">
                  <h3 className={`text-lg font-semibold ${
                    achievement.earned ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {achievement.title}
                  </h3>
                  {achievement.earned && (
                    <Badge variant="success" size="sm" className="bg-green-100 text-green-700 border-green-200">
                      Earned
                    </Badge>
                  )}
                </div>
                
                <p className={`text-sm mb-4 ${
                  achievement.earned ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {achievement.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className={`text-sm font-medium ${
                    achievement.earned ? 'text-purple-600' : 'text-gray-400'
                  }`}>
                    +{achievement.xp} XP
                  </div>
                  {achievement.earned && (
                    <div className="text-green-600 font-medium">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
} 