'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, FileText, BarChart3, Zap, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface AIToolsIntroStepProps {
  onComplete: () => void
  isCompleted: boolean
}

interface AITool {
  id: string
  name: string
  description: string
  features: string[]
  icon: React.ReactNode
  color: string
  bonusPoints: number
}

export function AIToolsIntroStep({ onComplete, isCompleted }: AIToolsIntroStepProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null)

  const aiTools: AITool[] = [
    {
      id: 'lesson_planner',
      name: 'AI Lesson Planner',
      description: 'Generate personalized lesson plans based on student goals and learning style',
      features: [
        'Customized to each student\'s level',
        'Includes practice problems',
        'Adapts based on progress'
      ],
      icon: <FileText className="w-6 h-6" />,
      color: 'purple',
      bonusPoints: 10
    },
    {
      id: 'student_insights',
      name: 'Student Analytics',
      description: 'Get AI-powered insights on student performance and engagement',
      features: [
        'Progress tracking dashboard',
        'Identify learning gaps',
        'Engagement metrics'
      ],
      icon: <BarChart3 className="w-6 h-6" />,
      color: 'blue',
      bonusPoints: 15
    },
    {
      id: 'smart_materials',
      name: 'Smart Practice Generator',
      description: 'Create targeted practice materials that adapt to student needs',
      features: [
        'Auto-generates exercises',
        'Difficulty adjustment',
        'Instant feedback system'
      ],
      icon: <Brain className="w-6 h-6" />,
      color: 'green',
      bonusPoints: 10
    },
    {
      id: 'quick_tips',
      name: 'AI Teaching Assistant',
      description: 'Get real-time suggestions during sessions to improve engagement',
      features: [
        'Live teaching tips',
        'Engagement boosters',
        'Alternative explanations'
      ],
      icon: <Zap className="w-6 h-6" />,
      color: 'orange',
      bonusPoints: 5
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
          AI Tools to Supercharge Your Tutoring 🚀
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Leverage cutting-edge AI to save time and improve student outcomes.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-start gap-3">
          <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
              Earn Points for Using AI Tools!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Each time you use these tools to improve student outcomes, you'll earn bonus points 
              toward rewards and tier advancement.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {aiTools.map((tool, index) => (
          <motion.div
            key={tool.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className={`
              relative rounded-lg border-2 p-5 cursor-pointer transition-all duration-200
              ${selectedTool === tool.id 
                ? 'ring-2 ring-purple-500 border-purple-500' 
                : `${getColorClasses(tool.color)} hover:shadow-lg`
              }
            `}
            onClick={() => setSelectedTool(tool.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${getIconColorClasses(tool.color)}`}>
                {tool.icon}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {tool.name}
                  </h3>
                  <span className="text-xs font-medium text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">
                    +{tool.bonusPoints} pts
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {tool.description}
                </p>
                <ul className="space-y-1">
                  {tool.features.map((feature, i) => (
                    <li key={i} className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1.5">
                      <ChevronRight className="w-3 h-3" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-yellow-100 dark:bg-yellow-800/50 rounded-lg">
            <Sparkles className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
              Coming Soon: Advanced AI Features
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We're constantly adding new AI capabilities including automated progress reports, 
              parent communication assistance, and personalized curriculum planning.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
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
            Explore AI Tools
          </Button>
        )}
      </motion.div>
    </div>
  )
} 