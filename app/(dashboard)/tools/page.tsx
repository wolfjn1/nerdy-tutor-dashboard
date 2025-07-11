'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Zap, BookOpen, PenTool, Calculator, MessageSquare } from 'lucide-react'
import { Card, Button } from '@/components/ui'

export default function ToolsPage() {
  const tools = [
    {
      id: 'lesson-builder',
      name: 'AI Lesson Builder',
      description: 'Create personalized lesson plans with AI assistance',
      icon: BookOpen,
      color: 'bg-purple-100',
      iconColor: 'text-purple-600',
      xpReward: 25
    },
    {
      id: 'problem-generator',
      name: 'Problem Generator',
      description: 'Generate practice problems for any subject',
      icon: Calculator,
      color: 'bg-blue-100',
      iconColor: 'text-blue-600',
      xpReward: 15
    },
    {
      id: 'study-assistant',
      name: 'Study Assistant',
      description: 'AI-powered study guide and homework help',
      icon: Brain,
      color: 'bg-pink-100',
      iconColor: 'text-pink-600',
      xpReward: 20
    },
    {
      id: 'quiz-maker',
      name: 'Quiz Maker',
      description: 'Create custom quizzes and assessments',
      icon: PenTool,
      color: 'bg-green-100',
      iconColor: 'text-green-600',
      xpReward: 18
    },
    {
      id: 'explanation-helper',
      name: 'Explanation Helper',
      description: 'Get multiple ways to explain difficult concepts',
      icon: MessageSquare,
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      xpReward: 22
    },
    {
      id: 'ai-tutor',
      name: 'AI Tutor Chat',
      description: 'Chat with AI for instant teaching assistance',
      icon: Zap,
      color: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      xpReward: 30
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          AI Tutoring Tools 🧠
        </h1>
        <p className="text-gray-600">
          Supercharge your teaching with AI-powered tools
        </p>
      </motion.div>

      {/* Tools Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {tools.map((tool, index) => {
          const Icon = tool.icon
          return (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -4 }}
            >
              <Card className="h-full hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                <div className="p-6">
                  <div className={`w-12 h-12 ${tool.color} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {tool.name}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 text-sm">
                    {tool.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <Button 
                      variant="gradient" 
                      gradientType="nerdy" 
                      size="sm"
                      className="flex-1"
                    >
                      Launch Tool
                    </Button>
                    <div className="ml-3 text-xs text-gray-500">
                      +{tool.xpReward} XP
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">🚀</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">More Tools Coming Soon!</h2>
        <p className="text-gray-600">
          We're constantly adding new AI-powered tools to help you teach better
        </p>
      </motion.div>
    </div>
  )
} 