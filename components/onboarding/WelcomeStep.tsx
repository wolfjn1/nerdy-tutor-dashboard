'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Users, TrendingUp, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface WelcomeStepProps {
  onComplete: () => void
  isCompleted: boolean
}

export function WelcomeStep({ onComplete, isCompleted }: WelcomeStepProps) {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Your Tutoring Journey! 🎉
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          We're excited to have you join our community of passionate educators.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-800/50 rounded-lg">
              <Users className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Connect with Students
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Match with students who need your expertise and build lasting educational relationships.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800/50 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                AI-Powered Tools
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Leverage cutting-edge AI to create personalized lesson plans and track progress.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-800/50 rounded-lg">
              <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Grow Your Career
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Earn competitive rates, receive bonuses for excellence, and advance through performance tiers.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-pink-50 dark:bg-pink-900/20 rounded-lg p-4 border border-pink-200 dark:border-pink-800">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-800/50 rounded-lg">
              <Sparkles className="w-5 h-5 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Gamified Experience
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Earn points, unlock badges, and climb leaderboards as you help students succeed.
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
          What's Next?
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          This quick onboarding will help you:
        </p>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            Complete your tutor profile
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            Learn best practices for successful tutoring
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            Discover AI tools to enhance your sessions
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            Set up your first student
          </li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        {!isCompleted && (
          <Button
            onClick={onComplete}
            size="lg"
            variant="gradient"
            gradientType="purple"
            className="min-w-[200px]"
          >
            Let's Get Started!
          </Button>
        )}
      </motion.div>
    </div>
  )
} 