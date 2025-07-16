'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, BookOpen, Sparkles, Clock, Target, Users, Lightbulb } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useRouter } from 'next/navigation'

export default function LessonBuilderPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    subject: '',
    gradeLevel: '',
    topic: '',
    duration: '45',
    objectives: '',
    studentLevel: 'intermediate'
  })
  const [generatedLesson, setGeneratedLesson] = useState<any>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  const subjects = [
    'Mathematics', 'Science', 'English', 'History', 'Geography',
    'Computer Science', 'Physics', 'Chemistry', 'Biology', 'Literature'
  ]

  const gradeLevels = [
    'K-2', '3-5', '6-8', '9-10', '11-12', 'College', 'Adult'
  ]

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Simulate AI generation (replace with actual API call)
    setTimeout(() => {
      setGeneratedLesson({
        title: `${formData.subject}: ${formData.topic}`,
        duration: formData.duration,
        objectives: formData.objectives.split('\n').filter(obj => obj.trim()),
        warmUp: {
          duration: '5-10 minutes',
          activities: [
            'Quick review of previous lesson',
            'Engaging question or problem to spark curiosity',
            'Brief discussion to activate prior knowledge'
          ]
        },
        mainContent: {
          duration: `${parseInt(formData.duration) - 20} minutes`,
          sections: [
            {
              title: 'Introduction & Explanation',
              duration: '10 minutes',
              activities: [
                'Present key concepts with visual aids',
                'Use real-world examples',
                'Check for understanding with quick questions'
              ]
            },
            {
              title: 'Guided Practice',
              duration: '15 minutes',
              activities: [
                'Work through examples together',
                'Students solve problems with support',
                'Peer collaboration opportunities'
              ]
            },
            {
              title: 'Independent Practice',
              duration: '10 minutes',
              activities: [
                'Students work on practice problems',
                'Differentiated tasks for various levels',
                'Teacher provides individual support'
              ]
            }
          ]
        },
        closure: {
          duration: '5-10 minutes',
          activities: [
            'Summarize key learning points',
            'Quick assessment or exit ticket',
            'Preview next lesson'
          ]
        },
        materials: [
          'Whiteboard/Digital presentation',
          'Practice worksheets',
          'Visual aids and manipulatives',
          'Assessment tools'
        ],
        differentiation: [
          'Provide scaffolded worksheets for struggling students',
          'Offer extension activities for advanced learners',
          'Use varied teaching methods (visual, auditory, kinesthetic)'
        ]
      })
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/tools')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Tools
          </Button>
          
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">AI Lesson Builder</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Sparkles className="w-4 h-4" />
          Powered by AI
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="p-6 bg-white dark:bg-gray-800">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Lesson Details</h2>
            
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Subject</label>
                <select
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                >
                  <option value="">Select a subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>

              {/* Grade Level */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Grade Level</label>
                <select
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.gradeLevel}
                  onChange={(e) => setFormData({...formData, gradeLevel: e.target.value})}
                >
                  <option value="">Select grade level</option>
                  {gradeLevels.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>

              {/* Topic */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Topic</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="e.g., Introduction to Fractions"
                  value={formData.topic}
                  onChange={(e) => setFormData({...formData, topic: e.target.value})}
                />
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Duration (minutes)
                </label>
                <input
                  type="number"
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.duration}
                  onChange={(e) => setFormData({...formData, duration: e.target.value})}
                />
              </div>

              {/* Learning Objectives */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Target className="w-4 h-4 inline mr-1" />
                  Learning Objectives
                </label>
                <textarea
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter each objective on a new line..."
                  value={formData.objectives}
                  onChange={(e) => setFormData({...formData, objectives: e.target.value})}
                />
              </div>

              {/* Student Level */}
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  <Users className="w-4 h-4 inline mr-1" />
                  Student Level
                </label>
                <select
                  className="w-full p-2 border rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  value={formData.studentLevel}
                  onChange={(e) => setFormData({...formData, studentLevel: e.target.value})}
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="mixed">Mixed Abilities</option>
                </select>
              </div>

              {/* Generate Button */}
              <Button
                variant="gradient"
                gradientType="nerdy"
                className="w-full"
                onClick={handleGenerate}
                disabled={!formData.subject || !formData.topic || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                    Generating Lesson Plan...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Generate Lesson Plan
                  </>
                )}
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Generated Lesson */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {generatedLesson ? (
            <Card className="p-6 h-full bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Generated Lesson Plan</h2>
                <Button variant="outline" size="sm" className="dark:border-gray-600 dark:text-gray-300">
                  Save to Library
                </Button>
              </div>
              
              <div className="space-y-6 text-sm">
                {/* Title & Duration */}
                <div>
                  <h3 className="font-semibold text-lg text-purple-600 dark:text-purple-400 mb-1">
                    {generatedLesson.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">Duration: {generatedLesson.duration} minutes</p>
                </div>

                {/* Objectives */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2 text-gray-900 dark:text-white">
                    <Target className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    Learning Objectives
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {generatedLesson.objectives.map((obj: string, i: number) => (
                      <li key={i}>{obj}</li>
                    ))}
                  </ul>
                </div>

                {/* Warm Up */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">🌟 Warm-Up ({generatedLesson.warmUp.duration})</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {generatedLesson.warmUp.activities.map((activity: string, i: number) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                </div>

                {/* Main Content */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">📚 Main Content ({generatedLesson.mainContent.duration})</h4>
                  {generatedLesson.mainContent.sections.map((section: any, i: number) => (
                    <div key={i} className="mb-3 pl-4">
                      <h5 className="font-medium text-purple-600 dark:text-purple-400">{section.title} ({section.duration})</h5>
                      <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 mt-1">
                        {section.activities.map((activity: string, j: number) => (
                          <li key={j}>{activity}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Closure */}
                <div>
                  <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">🎯 Closure ({generatedLesson.closure.duration})</h4>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300">
                    {generatedLesson.closure.activities.map((activity: string, i: number) => (
                      <li key={i}>{activity}</li>
                    ))}
                  </ul>
                </div>

                {/* Materials & Differentiation */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">📋 Materials Needed</h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                      {generatedLesson.materials.map((material: string, i: number) => (
                        <li key={i}>{material}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-gray-900 dark:text-white">
                      <Lightbulb className="w-4 h-4 inline text-yellow-500" />
                      Differentiation
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-gray-700 dark:text-gray-300 text-xs">
                      {generatedLesson.differentiation.map((strategy: string, i: number) => (
                        <li key={i}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="p-6 h-full flex items-center justify-center bg-gray-50 dark:bg-gray-800/50">
              <div className="text-center">
                <BookOpen className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">Your generated lesson plan will appear here</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">Fill out the form and click generate</p>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
} 