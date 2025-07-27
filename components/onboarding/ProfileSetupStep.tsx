'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Briefcase, Check, AlertCircle, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useRouter } from 'next/navigation'

interface ProfileSetupStepProps {
  onComplete: () => void
  isCompleted: boolean
}

interface ProfileField {
  id: string
  label: string
  icon: React.ReactNode
  description: string
  completed: boolean
  actionLabel?: string
}

export function ProfileSetupStep({ onComplete, isCompleted }: ProfileSetupStepProps) {
  const router = useRouter()
  const [showAlert, setShowAlert] = useState(false)
  
  // In a real implementation, these would be fetched from the user's profile
  const [profileFields] = useState<ProfileField[]>([
    {
      id: 'basic_info',
      label: 'Basic Information',
      icon: <User className="w-5 h-5" />,
      description: 'Name, bio, and profile photo',
      completed: true, // Assuming they signed up with basic info
    },
    {
      id: 'contact',
      label: 'Contact Details',
      icon: <Mail className="w-5 h-5" />,
      description: 'Email and phone number for students to reach you',
      completed: true, // Assuming they have email from signup
    },
    {
      id: 'location',
      label: 'Location & Availability',
      icon: <MapPin className="w-5 h-5" />,
      description: 'Time zone and available hours',
      completed: false,
      actionLabel: 'Set Location',
    },
    {
      id: 'expertise',
      label: 'Subjects & Expertise',
      icon: <Briefcase className="w-5 h-5" />,
      description: 'Subjects you teach and experience level',
      completed: false,
      actionLabel: 'Add Subjects',
    },
  ])

  const allFieldsCompleted = profileFields.every(field => field.completed)
  const completedCount = profileFields.filter(field => field.completed).length

  const handleFieldAction = (fieldId: string) => {
    // Show a temporary alert that this would navigate to profile
    setShowAlert(true)
    setTimeout(() => setShowAlert(false), 3000)
    
    // In a real app, this would navigate to the profile page with the specific section
    // For now, we'll just log it
    console.log(`Would navigate to profile section: ${fieldId}`)
    
    // Uncomment this to actually navigate to the profile page:
    // router.push(`/profile?section=${fieldId}`)
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Complete Your Profile 📝
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          A complete profile helps students find and connect with you.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Tutors with complete profiles are 3x more likely to be matched with students!
            </p>
          </div>
        </div>
      </motion.div>

      {showAlert && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 border border-amber-200 dark:border-amber-800"
        >
          <p className="text-sm text-amber-800 dark:text-amber-200">
            In a full app, this would take you to your profile page to edit this section.
          </p>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="space-y-3"
      >
        {profileFields.map((field, index) => (
          <motion.div
            key={field.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index, duration: 0.3 }}
            className={`
              relative rounded-lg border-2 p-4 transition-all duration-200
              ${field.completed 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-800' 
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer'
              }
            `}
            onClick={() => !field.completed && handleFieldAction(field.id)}
          >
            <div className="flex items-start gap-4">
              <div className={`
                p-2 rounded-lg
                ${field.completed 
                  ? 'bg-green-100 dark:bg-green-800/50 text-green-600 dark:text-green-400' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                }
              `}>
                {field.icon}
              </div>
              
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {field.label}
                  {field.completed && (
                    <Check className="w-5 h-5 text-green-600 dark:text-green-400" />
                  )}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {field.description}
                </p>
              </div>

              {!field.completed && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation() // Prevent double trigger from parent div
                    handleFieldAction(field.id)
                  }}
                  className="flex items-center gap-1"
                >
                  {field.actionLabel || 'Set Up'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-6 border border-purple-200 dark:border-purple-800"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
            Profile Completion
          </h3>
          <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {Math.round((completedCount / profileFields.length) * 100)}%
          </span>
        </div>
        
        <div className="relative h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500"
            initial={{ width: 0 }}
            animate={{ width: `${(completedCount / profileFields.length) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">
          {allFieldsCompleted 
            ? "Great job! Your profile is complete. 🎉"
            : `Complete ${profileFields.length - completedCount} more section${profileFields.length - completedCount > 1 ? 's' : ''} to finish your profile.`
          }
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex justify-center pt-4"
      >
        {!isCompleted && (
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              For this demo, we'll simulate that your profile is complete.
            </p>
            <Button
              onClick={onComplete}
              size="lg"
              variant="gradient"
              gradientType="purple"
              className="min-w-[200px]"
            >
              Continue to Next Step
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  )
} 