import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { OnboardingService } from '@/lib/onboarding'

/**
 * GET /api/onboarding/status/[tutorId]
 * Retrieves the onboarding status for a specific tutor
 * 
 * Path parameters:
 * - tutorId: The ID of the tutor to get status for
 * 
 * Response:
 * - 200: Success with onboarding status
 * - 401: Unauthorized (not authenticated)
 * - 403: Forbidden (trying to access another tutor's status)
 * - 500: Server error
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { tutorId: string } }
) {
  try {
    const { tutorId } = params

    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to view onboarding status' },
        { status: 401 }
      )
    }

    // Security check: Users can only view their own onboarding status
    // unless they have admin privileges (which we'll check via role)
    if (user.id !== tutorId) {
      // Check if user has admin role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        return NextResponse.json(
          { error: 'Forbidden', message: 'You can only view your own onboarding status' },
          { status: 403 }
        )
      }
    }

    // Initialize onboarding service
    const onboardingService = new OnboardingService(supabase)

    // Get onboarding status
    const status = await onboardingService.getOnboardingStatus(tutorId)

    // Get additional information
    const isComplete = await onboardingService.isOnboardingComplete(tutorId)
    const progress = await onboardingService.trackProgress(tutorId)

    return NextResponse.json({
      success: true,
      status,
      isComplete,
      progress: {
        currentStep: progress.currentStep,
        completedSteps: progress.completedSteps.length,
        totalSteps: progress.remainingSteps.length + progress.completedSteps.length,
        percentComplete: progress.percentComplete,
        estimatedTimeRemaining: progress.estimatedTimeRemaining
      }
    })

  } catch (error) {
    console.error('[API] Error fetching onboarding status:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'An unexpected error occurred while fetching onboarding status' 
      },
      { status: 500 }
    )
  }
} 