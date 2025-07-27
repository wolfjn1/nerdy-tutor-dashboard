'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Clock, MessageSquare, Target, Heart, Star, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface BestPracticesStepProps {
  onComplete: () => void
  isCompleted: boolean
}

interface BestPractice {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  checked: boolean
}

export function BestPracticesStep({ onComplete, isCompleted }: BestPracticesStepProps) {
  const [practices, setPractices] = useState<BestPractice[]>([
    {
      id: 'preparation',
      title: 'Come Prepared',
      description: 'Review student goals and prepare materials before each session',
      icon: <Target className="w-5 h-5" />,
      color: 'purple',
      checked: false,
    },
    {
      id: 'punctuality',
      title: 'Be Punctual',
      description: 'Start and end sessions on time to respect everyone\'s schedule',
      icon: <Clock className="w-5 h-5" />,
      color: 'blue',
      checked: false,
    },
    {
      id: 'communication',
      title: 'Communicate Clearly',
      description: 'Use simple language and check for understanding frequently',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'green',
      checked: false,
    },
    {
      id: 'patience',
      title: 'Practice Patience',
      description: 'Every student learns at their own pace - be supportive and encouraging',
      icon: <Heart className="w-5 h-5" />,
      color: 'pink',
      checked: false,
    },
    {
      id: 'engagement',
      title: 'Keep Sessions Engaging',
      description: 'Use interactive methods and real-world examples to maintain interest',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'yellow',
      checked: false,
    },
    {
      id: 'feedback',
      title: 'Provide Regular Feedback',
      description: 'Give constructive feedback and celebrate student achievements',
      icon: <Star className="w-5 h-5" />,
      color: 'orange',
      checked: false,
    },
  ])

  const allChecked = practices.every(p => p.checked)
  const checkedCount = practices.filter(p => p.checked).length

  const togglePractice = (id: string) => {
    setPractices(prev => prev.map(p => 
      p.id === id ? { ...p, checked: !p.checked } : p
    ))
  }

  const getColorClasses = (color: string, checked: boolean) => {
    const colors = {
      purple: checked 
        ? 'bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400' 
        : 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      blue: checked
        ? 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400'
        : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: checked
        ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400'
        : 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      pink: checked
        ? 'bg-pink-100 dark:bg-pink-800/50 text-pink-600 dark:text-pink-400'
        : 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      yellow: checked
        ? 'bg-yellow-100 dark:bg-yellow-800/50 text-yellow-600 dark:text-yellow-400'
        : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400',
      orange: checked
        ? 'bg-orange-100 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400'
        : 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Best Practices for Success 🌟
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Follow these proven strategies to become an exceptional tutor.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-2">
          Why Best Practices Matter
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Tutors who follow these practices have:
        </p>
        <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            90% higher student retention rates
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            More 5-star reviews and referrals
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-purple-600 rounded-full" />
            Qualify for performance bonuses faster
          </li>
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-3"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Review each practice below and check the ones you commit to following:
        </p>

        {practices.map((practice, index) => (
          <motion.div
            key={practice.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className={`
              relative rounded-lg border-2 p-4 transition-all duration-200 cursor-pointer
              ${practice.checked 
                ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10' 
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700'
              }
            `}
            onClick={() => togglePractice(practice.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${getColorClasses(practice.color, practice.checked)}`}>
                {practice.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {practice.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {practice.description}
                </p>
              </div>

              <div className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${practice.checked 
                  ? 'bg-green-500 border-green-500' 
                  : 'border-gray-300 dark:border-gray-600'
                }
              `}>
                {practice.checked && (
                  <CheckCircle className="w-4 h-4 text-white" />
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-center"
      >
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {checkedCount}/{practices.length} practices reviewed
        </p>
        <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden max-w-xs mx-auto mb-6">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${(checkedCount / practices.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        {!isCompleted && (
          <Button
            onClick={onComplete}
            size="lg"
            variant="gradient"
            gradientType="purple"
            className="min-w-[200px]"
            disabled={!allChecked}
          >
            {allChecked ? "I'm Ready to Excel!" : `Review All Practices (${checkedCount}/${practices.length})`}
          </Button>
        )}
      </motion.div>
    </div>
  )
} 