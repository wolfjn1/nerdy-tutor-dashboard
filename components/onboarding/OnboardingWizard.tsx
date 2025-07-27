'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ONBOARDING_STEPS } from '@/lib/onboarding'
import { useRouter } from 'next/navigation'

// Import step components
import { WelcomeStep } from './WelcomeStep'
import { ProfileSetupStep } from './ProfileSetupStep'
import { BestPracticesStep } from './BestPracticesStep'
import { AIToolsIntroStep } from './AIToolsIntroStep'
import { FirstStudentGuide } from './FirstStudentGuide'

interface OnboardingWizardProps {
  tutorId: string
  className?: string
}

const stepComponents = {
  welcome: WelcomeStep,
  profile_setup: ProfileSetupStep,
  best_practices: BestPracticesStep,
  ai_tools_intro: AIToolsIntroStep,
  first_student_guide: FirstStudentGuide,
}

export function OnboardingWizard({ tutorId, className }: OnboardingWizardProps) {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load onboarding status on mount
  useEffect(() => {
    loadOnboardingStatus()
  }, [tutorId])

  const loadOnboardingStatus = async () => {
    try {
      // Use the API endpoint to get status
      const response = await fetch(`/api/onboarding/status/${tutorId}`)
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to load status')
      }

      const data = await response.json()
      setCompletedSteps(data.status.completedSteps)
      
      // Find the index of the current step
      const currentIndex = ONBOARDING_STEPS.findIndex(
        step => step.id === data.status.currentStep
      )
      setCurrentStepIndex(currentIndex >= 0 ? currentIndex : 0)
    } catch (err: any) {
      console.error('Failed to load onboarding status:', err)
      setError(err.message || 'Failed to load your progress. Please refresh the page.')
    }
  }

  const currentStep = ONBOARDING_STEPS[currentStepIndex]
  const StepComponent = stepComponents[currentStep.id as keyof typeof stepComponents]
  const isLastStep = currentStepIndex === ONBOARDING_STEPS.length - 1
  const canGoBack = currentStepIndex > 0
  const canGoNext = completedSteps.includes(currentStep.id)

  const completeCurrentStep = async () => {
    if (completedSteps.includes(currentStep.id)) {
      return // Already completed
    }

    setIsLoading(true)
    setError(null)

    try {
      // Use the API endpoint instead of direct service call
      const response = await fetch('/api/onboarding/complete-step', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stepId: currentStep.id })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to complete step')
      }

      const data = await response.json()
      setCompletedSteps([...completedSteps, currentStep.id])
      
      // Auto-advance to next step after a short delay
      if (!isLastStep) {
        setTimeout(() => {
          setCurrentStepIndex(currentStepIndex + 1)
        }, 500)
      }
    } catch (err: any) {
      console.error('Failed to complete step:', err)
      setError(err.message || 'Failed to save your progress. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleNext = () => {
    if (canGoNext && !isLastStep) {
      setCurrentStepIndex(currentStepIndex + 1)
    }
  }

  const handleBack = () => {
    if (canGoBack) {
      setCurrentStepIndex(currentStepIndex - 1)
    }
  }

  const handleFinish = async () => {
    setIsLoading(true)
    try {
      // If the last step isn't completed yet, complete it
      if (!completedSteps.includes(currentStep.id)) {
        const response = await fetch('/api/onboarding/complete-step', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ stepId: currentStep.id })
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.message || 'Failed to complete final step')
        }
      }
      
      // Redirect to dashboard
      router.push('/dashboard')
    } catch (err: any) {
      console.error('Failed to finish onboarding:', err)
      setError(err.message || 'Failed to complete onboarding. Please try again.')
      setIsLoading(false)
    }
  }

  const progressPercentage = (completedSteps.length / ONBOARDING_STEPS.length) * 100

  return (
    <div className={cn('min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 p-4', className)}>
      <div className="max-w-4xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Step {currentStepIndex + 1} of {ONBOARDING_STEPS.length}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>
          
          {/* Step Indicators */}
          <div className="flex items-center justify-between mt-6">
            {ONBOARDING_STEPS.map((step, index) => {
              const isCompleted = completedSteps.includes(step.id)
              const isCurrent = index === currentStepIndex
              const isPast = index < currentStepIndex

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <button
                    onClick={() => {
                      if (isPast || isCompleted) {
                        setCurrentStepIndex(index)
                      }
                    }}
                    disabled={!isPast && !isCompleted}
                    className={cn(
                      'relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200',
                      'focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2',
                      isCompleted && 'bg-purple-600 text-white cursor-pointer',
                      isCurrent && !isCompleted && 'bg-white dark:bg-gray-800 border-2 border-purple-600 text-purple-600',
                      !isCurrent && !isCompleted && 'bg-gray-200 dark:bg-gray-700 text-gray-400',
                      (isPast || isCompleted) && 'cursor-pointer hover:scale-110'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </button>
                  {index < ONBOARDING_STEPS.length - 1 && (
                    <div
                      className={cn(
                        'flex-1 h-1 mx-2 transition-colors duration-300',
                        isCompleted ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="glass-effect border-white/30 p-8">
              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
                  {error}
                </div>
              )}

              <StepComponent
                onComplete={completeCurrentStep}
                isCompleted={completedSteps.includes(currentStep.id)}
              />
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={!canGoBack}
            leftIcon={<ChevronLeft className="w-4 h-4" />}
            className={cn(
              'transition-opacity',
              !canGoBack && 'opacity-0 pointer-events-none'
            )}
          >
            Previous
          </Button>

          <div className="flex items-center gap-4">
            {!isLastStep ? (
              <Button
                variant="gradient"
                gradientType="purple"
                onClick={handleNext}
                disabled={!canGoNext}
                rightIcon={<ChevronRight className="w-4 h-4" />}
                isLoading={isLoading}
              >
                Next Step
              </Button>
            ) : (
              <Button
                variant="gradient"
                gradientType="green"
                onClick={handleFinish}
                disabled={!completedSteps.includes(currentStep.id)}
                isLoading={isLoading}
                rightIcon={<Check className="w-4 h-4" />}
              >
                Complete Onboarding
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 