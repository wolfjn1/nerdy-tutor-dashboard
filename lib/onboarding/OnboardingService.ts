import { SupabaseClient } from '@supabase/supabase-js'
import { OnboardingStatus, OnboardingStep } from '../types/gamification'

// Define onboarding steps in order
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 'welcome',
    title: 'Welcome & Platform Overview',
    description: 'Get introduced to the platform and understand how it works',
    order: 1,
    isCompleted: false
  },
  {
    id: 'profile_setup',
    title: 'Profile Completion',
    description: 'Set up your tutor profile with all necessary information',
    order: 2,
    isCompleted: false
  },
  {
    id: 'best_practices',
    title: 'Best Practices Tutorial',
    description: 'Learn proven strategies for successful tutoring',
    order: 3,
    isCompleted: false
  },
  {
    id: 'ai_tools_intro',
    title: 'AI Tools Introduction',
    description: 'Discover AI-powered tools to enhance your tutoring',
    order: 4,
    isCompleted: false
  },
  {
    id: 'first_student_guide',
    title: 'First Student Setup Guide',
    description: 'Learn how to onboard and work with your first student',
    order: 5,
    isCompleted: false
  }
]

export class OnboardingService {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Get the current onboarding status for a tutor
   * Creates initial onboarding record if none exists (lazy initialization)
   */
  async getOnboardingStatus(tutorId: string): Promise<OnboardingStatus> {
    try {
      // Fetch completed steps from database
      const { data: completedSteps, error } = await this.supabase
        .from('tutor_onboarding')
        .select('step_completed, completed_at')
        .eq('tutor_id', tutorId)
        .order('completed_at', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch onboarding status: ${error.message}`)
      }

      const completedStepIds = completedSteps?.map(s => s.step_completed) || []
      
      // Calculate current step (next uncompleted step in order)
      let currentStep = ONBOARDING_STEPS[0].id
      for (const step of ONBOARDING_STEPS) {
        if (!completedStepIds.includes(step.id)) {
          currentStep = step.id
          break
        }
      }

      // Calculate progress
      const percentComplete = (completedStepIds.length / ONBOARDING_STEPS.length) * 100
      const isComplete = completedStepIds.length === ONBOARDING_STEPS.length

      // Get timestamps
      const startedAt = completedSteps?.[0]?.completed_at 
        ? new Date(completedSteps[0].completed_at) 
        : new Date()
      
      const completedAt = isComplete && completedSteps?.length 
        ? new Date(completedSteps[completedSteps.length - 1].completed_at)
        : undefined

      return {
        completedSteps: completedStepIds,
        currentStep,
        startedAt,
        completedAt,
        totalSteps: ONBOARDING_STEPS.length,
        percentComplete
      }
    } catch (error) {
      console.error('Error in getOnboardingStatus:', error)
      throw error
    }
  }

  /**
   * Complete a specific onboarding step
   * Validates step order and prevents duplicate completions
   */
  async completeStep(tutorId: string, stepId: string): Promise<void> {
    try {
      // Validate step exists
      const step = ONBOARDING_STEPS.find(s => s.id === stepId)
      if (!step) {
        throw new Error(`Invalid step ID: ${stepId}`)
      }

      // Get current status to check prerequisites
      const currentStatus = await this.getOnboardingStatus(tutorId)

      // Check if step is already completed
      if (currentStatus.completedSteps.includes(stepId)) {
        throw new Error(`Step '${stepId}' is already completed`)
      }

      // Enforce sequential completion
      const stepIndex = ONBOARDING_STEPS.findIndex(s => s.id === stepId)
      const expectedIndex = currentStatus.completedSteps.length

      if (stepIndex !== expectedIndex) {
        const expectedStep = ONBOARDING_STEPS[expectedIndex]
        throw new Error(
          `Steps must be completed in order. Next step should be '${expectedStep.id}'`
        )
      }

      // Record step completion
      const { error } = await this.supabase
        .from('tutor_onboarding')
        .insert({
          tutor_id: tutorId,
          step_completed: stepId,
          metadata: {
            step_title: step.title,
            step_order: step.order
          }
        })

      if (error) {
        // Handle unique constraint violation (duplicate step)
        if (error.code === '23505') {
          throw new Error(`Step '${stepId}' is already completed`)
        }
        throw new Error(`Failed to complete step: ${error.message}`)
      }

      // Award initial badges if onboarding is complete
      if (currentStatus.completedSteps.length + 1 === ONBOARDING_STEPS.length) {
        await this.awardOnboardingCompletionBadge(tutorId)
      }
    } catch (error) {
      console.error('Error in completeStep:', error)
      throw error
    }
  }

  /**
   * Track progress for analytics
   * Returns detailed progress information
   */
  async trackProgress(tutorId: string): Promise<{
    currentStep: OnboardingStep
    completedSteps: OnboardingStep[]
    remainingSteps: OnboardingStep[]
    percentComplete: number
    estimatedTimeRemaining: number // in minutes
  }> {
    try {
      const status = await this.getOnboardingStatus(tutorId)
      
      const completedSteps = ONBOARDING_STEPS.filter(
        step => status.completedSteps.includes(step.id)
      ).map(step => ({ ...step, isCompleted: true }))
      
      const remainingSteps = ONBOARDING_STEPS.filter(
        step => !status.completedSteps.includes(step.id)
      )
      
      const currentStep = ONBOARDING_STEPS.find(
        step => step.id === status.currentStep
      ) || ONBOARDING_STEPS[0]

      // Estimate 5 minutes per remaining step
      const estimatedTimeRemaining = remainingSteps.length * 5

      return {
        currentStep,
        completedSteps,
        remainingSteps,
        percentComplete: status.percentComplete,
        estimatedTimeRemaining
      }
    } catch (error) {
      console.error('Error in trackProgress:', error)
      throw error
    }
  }

  /**
   * Check if onboarding is complete for a tutor
   */
  async isOnboardingComplete(tutorId: string): Promise<boolean> {
    try {
      const status = await this.getOnboardingStatus(tutorId)
      return status.completedSteps.length === ONBOARDING_STEPS.length
    } catch (error) {
      console.error('Error in isOnboardingComplete:', error)
      throw error
    }
  }

  /**
   * Award initial badge upon onboarding completion
   * This is called internally when the last step is completed
   */
  private async awardOnboardingCompletionBadge(tutorId: string): Promise<void> {
    try {
      // Check if badge already exists
      const { data: existingBadge } = await this.supabase
        .from('tutor_badges')
        .select('id')
        .eq('tutor_id', tutorId)
        .eq('badge_type', 'onboarding_complete')
        .single()

      if (existingBadge) {
        return // Badge already awarded
      }

      // Award the badge
      const { error } = await this.supabase
        .from('tutor_badges')
        .insert({
          tutor_id: tutorId,
          badge_type: 'onboarding_complete',
          metadata: {
            badge_name: 'Quick Learner',
            description: 'Completed platform onboarding',
            icon: '🎓'
          }
        })

      if (error) {
        console.error('Failed to award onboarding badge:', error)
        // Don't throw - this is a non-critical operation
      }

      // Award points for completing onboarding
      const { error: pointsError } = await this.supabase
        .from('gamification_points')
        .insert({
          tutor_id: tutorId,
          points: 100,
          reason: 'onboarding_complete',
          metadata: {
            description: 'Completed platform onboarding'
          }
        })

      if (pointsError) {
        console.error('Failed to award onboarding points:', pointsError)
      }
    } catch (error) {
      console.error('Error in awardOnboardingCompletionBadge:', error)
      // Don't throw - this is a non-critical operation
    }
  }

  /**
   * Reset onboarding for a tutor (mainly for testing)
   */
  async resetOnboarding(tutorId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('tutor_onboarding')
        .delete()
        .eq('tutor_id', tutorId)

      if (error) {
        throw new Error(`Failed to reset onboarding: ${error.message}`)
      }
    } catch (error) {
      console.error('Error in resetOnboarding:', error)
      throw error
    }
  }
} 