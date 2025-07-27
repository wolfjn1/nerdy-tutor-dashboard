import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { OnboardingService } from '@/lib/onboarding'

/**
 * POST /api/onboarding/complete-step
 * Marks an onboarding step as completed for the authenticated user
 * 
 * Request body:
 * {
 *   "stepId": string - The ID of the step to complete
 * }
 * 
 * Response:
 * - 200: Success with updated onboarding status
 * - 400: Invalid request (missing stepId or invalid step)
 * - 401: Unauthorized (not authenticated)
 * - 500: Server error
 */
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'You must be logged in to complete onboarding steps' },
        { status: 401 }
      )
    }

    // Parse request body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Invalid JSON in request body' },
        { status: 400 }
      )
    }

    const { stepId } = body

    if (!stepId || typeof stepId !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request', message: 'Missing or invalid stepId' },
        { status: 400 }
      )
    }

    // Initialize onboarding service
    const onboardingService = new OnboardingService(supabase)

    // Complete the step
    try {
      await onboardingService.completeStep(user.id, stepId)
    } catch (error: any) {
      // Handle specific errors from the service
      if (error.message.includes('Invalid step ID')) {
        return NextResponse.json(
          { error: 'Bad Request', message: error.message },
          { status: 400 }
        )
      }
      if (error.message.includes('already completed')) {
        return NextResponse.json(
          { error: 'Conflict', message: error.message },
          { status: 409 }
        )
      }
      if (error.message.includes('must be completed in order')) {
        return NextResponse.json(
          { error: 'Bad Request', message: error.message },
          { status: 400 }
        )
      }
      // Re-throw other errors
      throw error
    }

    // Get updated status to return
    const updatedStatus = await onboardingService.getOnboardingStatus(user.id)

    // Check if onboarding is complete to return additional info
    const isComplete = await onboardingService.isOnboardingComplete(user.id)

    return NextResponse.json({
      success: true,
      status: updatedStatus,
      isComplete,
      message: isComplete 
        ? 'Congratulations! You have completed onboarding.' 
        : `Step '${stepId}' completed successfully.`
    })

  } catch (error) {
    console.error('[API] Error completing onboarding step:', error)
    return NextResponse.json(
      { 
        error: 'Internal Server Error', 
        message: 'An unexpected error occurred while completing the step' 
      },
      { status: 500 }
    )
  }
} 