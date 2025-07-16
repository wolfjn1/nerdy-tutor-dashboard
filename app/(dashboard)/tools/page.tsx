'use client'

import React from 'react'
import { BookOpen, Layers, Calculator, Brain, PenTool, MessageSquare, ArrowRight, Clock } from 'lucide-react'
import { Card } from '@/components/ui'
import { useRouter } from 'next/navigation'

export default function ToolsPage() {
  const router = useRouter()
  
  const availableTools = [
    {
      id: 'lesson-builder',
      name: 'AI Lesson Builder',
      description: 'Generate complete lesson plans in seconds with AI assistance',
      icon: BookOpen,
      iconBg: 'bg-purple-500',
      iconColor: 'text-white',
      time: '2 min setup'
    },
    {
      id: 'flashcards',
      name: 'Flashcards',
      description: 'Create interactive study decks to help students memorize key concepts',
      icon: Layers,
      iconBg: 'bg-orange-500',
      iconColor: 'text-white',
      time: '5 min setup'
    }
  ]

  const comingSoonTools = [
    {
      name: 'Problem Generator',
      description: 'Auto-generate practice problems',
      icon: Calculator,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      name: 'Study Assistant',
      description: 'AI chatbot for homework help',
      icon: Brain,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600'
    },
    {
      name: 'Quiz Maker',
      description: 'Create auto-graded quizzes',
      icon: PenTool,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      name: 'Explanation Helper',
      description: 'Multiple ways to explain concepts',
      icon: MessageSquare,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600'
    }
  ]

  return (
    <div className="max-w-5xl mx-auto px-4">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          AI Teaching Tools
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300">
          Save hours on lesson planning and create engaging learning experiences
        </p>
      </div>

      {/* Available Tools */}
      <section className="mb-16">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Available Tools
          </h2>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Click to open
          </span>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {availableTools.map((tool) => {
            const Icon = tool.icon
            return (
              <Card
                key={tool.id}
                className="p-6 cursor-pointer bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-200"
                onClick={() => router.push(`/tools/${tool.id}`)}
              >
                <div className="flex gap-4">
                  {/* Icon with solid background */}
                  <div className={`${tool.iconBg} p-3 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-6 h-6 ${tool.iconColor}`} />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1">
                      {tool.name}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-3">
                      {tool.description}
                    </p>
                    
                    {/* Meta info */}
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4" />
                        {tool.time}
                      </span>
                      <ArrowRight className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </section>

      {/* Coming Soon */}
      <section>
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
          Coming Soon
        </h2>
        
        <div className="grid sm:grid-cols-2 gap-3">
          {comingSoonTools.map((tool, index) => {
            const Icon = tool.icon
            return (
              <div
                key={index}
                className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 opacity-70"
              >
                <div className="flex items-start gap-3">
                  <div className={`${tool.iconBg} p-2 rounded-lg flex-shrink-0`}>
                    <Icon className={`w-5 h-5 ${tool.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-800 dark:text-gray-200 mb-0.5">
                      {tool.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {tool.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Footer message */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-8">
          New tools are added regularly based on tutor feedback
        </p>
      </section>
    </div>
  )
} 