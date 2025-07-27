'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, MessageSquare, Target, Calendar, Rocket, ArrowRight, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface FirstStudentGuideProps {
  onComplete: () => void
  isCompleted: boolean
}

interface GuideStep {
  number: number
  title: string
  description: string
  icon: React.ReactNode
  color: string
  tips: string[]
}

export function FirstStudentGuide({ onComplete, isCompleted }: FirstStudentGuideProps) {
  const steps: GuideStep[] = [
    {
      number: 1,
      title: 'Browse Available Opportunities',
      description: 'Explore student requests that match your expertise and schedule',
      icon: <Search className="w-5 h-5" />,
      color: 'purple',
      tips: [
        'Filter by subject and pay rate',
        'Look for high match scores (90%+)',
        'Check student needs carefully'
      ]
    },
    {
      number: 2,
      title: 'Respond to Opportunities',
      description: 'Express interest in students who are a good fit for your teaching style',
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'blue',
      tips: [
        'Respond quickly to urgent requests',
        'Highlight relevant experience',
        'Be genuine in your interest'
      ]
    },
    {
      number: 3,
      title: 'Connect & Set Goals',
      description: 'Once matched, establish clear learning objectives with your student',
      icon: <Target className="w-5 h-5" />,
      color: 'green',
      tips: [
        'Send a warm welcome message',
        'Discuss specific goals together',
        'Set expectations early'
      ]
    },
    {
      number: 4,
      title: 'Schedule & Start Teaching',
      description: 'Book your first session and begin making a difference',
      icon: <Calendar className="w-5 h-5" />,
      color: 'orange',
      tips: [
        'Confirm time zones',
        'Prepare your first lesson',
        'Test tech setup beforehand'
      ]
    }
  ]

  const getColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800',
      blue: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
      green: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800',
      orange: 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800',
    }
    return colors[color as keyof typeof colors] || colors.purple
  }

  const getIconColorClasses = (color: string) => {
    const colors = {
      purple: 'bg-purple-100 dark:bg-purple-800/50 text-purple-600 dark:text-purple-400',
      blue: 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400',
      orange: 'bg-orange-100 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400',
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
          Find Your First Student! 🎓
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Students are waiting to learn from you. Here's how to get matched with your first student.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-6 border border-green-200 dark:border-green-800"
      >
        <div className="flex items-start gap-3">
          <Rocket className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              First Student Success Bonus!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Complete 5 sessions with your first student to earn a <strong>$15 bonus</strong> plus 
              <strong> 100 extra points</strong>!
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-4"
      >
        {steps.map((step, index) => (
          <motion.div
            key={step.number}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className={`relative rounded-lg border-2 p-5 ${getColorClasses(step.color)}`}
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center font-bold text-lg text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700">
                  {step.number}
                </div>
                <div className={`p-2 rounded-lg ${getIconColorClasses(step.color)}`}>
                  {step.icon}
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {step.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {step.description}
                </p>
                <div className="space-y-1">
                  {step.tips.map((tip, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                      <ArrowRight className="w-3 h-3" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-6 border border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-start gap-3">
          <Star className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
              Pro Tip: Look for High Match Scores
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Opportunities with 90%+ match scores are based on your expertise, availability, and preferences. 
              These students are most likely to be a great fit for your teaching style!
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-3">
          Quick Start Checklist
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            Profile 100% complete
          </label>
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            Teaching preferences set
          </label>
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            Availability calendar updated
          </label>
          <label className="flex items-center gap-2 text-gray-700 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" className="rounded border-gray-300 text-purple-600 focus:ring-purple-500" />
            Tech setup tested
          </label>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        {!isCompleted && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Ready to start browsing opportunities and finding your perfect student match?
            </p>
            <Button
              onClick={onComplete}
              size="lg"
              variant="gradient"
              gradientType="green"
              className="min-w-[200px]"
              rightIcon={<Rocket className="w-5 h-5" />}
            >
              Complete Onboarding!
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
} 