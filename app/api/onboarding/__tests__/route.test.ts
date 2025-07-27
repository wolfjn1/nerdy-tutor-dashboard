import { NextRequest, NextResponse } from 'next/server'
import { POST as completeStep } from '../complete-step/route'
import { GET as getStatus } from '../status/[tutorId]/route'

// Mock Supabase
jest.mock('@/utils/supabase/server', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    },
    from: jest.fn()
  }))
}))

// Mock OnboardingService
jest.mock('@/lib/onboarding', () => ({
  OnboardingService: jest.fn().mockImplementation(() => ({
    completeStep: jest.fn(),
    getOnboardingStatus: jest.fn(),
    isOnboardingComplete: jest.fn(),
    trackProgress: jest.fn()
  }))
}))

describe('Onboarding API Routes', () => {
  const mockUser = { id: 'test-user-123', email: 'test@example.com' }
  
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/onboarding/complete-step', () => {
    it('should complete a step successfully', async () => {
      const { createClient } = require('@/utils/supabase/server')
      const { OnboardingService } = require('@/lib/onboarding')
      
      // Mock authenticated user
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        }
      })

      // Mock service methods
      const mockService = {
        completeStep: jest.fn().mockResolvedValue(undefined),
        getOnboardingStatus: jest.fn().mockResolvedValue({
          completedSteps: ['welcome'],
          currentStep: 'profile_setup',
          startedAt: new Date(),
          totalSteps: 5,
          percentComplete: 20
        }),
        isOnboardingComplete: jest.fn().mockResolvedValue(false)
      }
      OnboardingService.mockImplementation(() => mockService)

      // Create request
      const request = new NextRequest('http://localhost:3000/api/onboarding/complete-step', {
        method: 'POST',
        body: JSON.stringify({ stepId: 'welcome' })
      })

      const response = await completeStep(request)
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.message).toContain('completed successfully')
      expect(mockService.completeStep).toHaveBeenCalledWith(mockUser.id, 'welcome')
    })

    it('should return 401 if not authenticated', async () => {
      const { createClient } = require('@/utils/supabase/server')
      
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: null }, error: new Error('Not authenticated') })
        }
      })

      const request = new NextRequest('http://localhost:3000/api/onboarding/complete-step', {
        method: 'POST',
        body: JSON.stringify({ stepId: 'welcome' })
      })

      const response = await completeStep(request)
      const data = await response.json()

      expect(response.status).toBe(401)
      expect(data.error).toBe('Unauthorized')
    })

    it('should return 400 for invalid step ID', async () => {
      const { createClient } = require('@/utils/supabase/server')
      const { OnboardingService } = require('@/lib/onboarding')
      
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        }
      })

      const mockService = {
        completeStep: jest.fn().mockRejectedValue(new Error('Invalid step ID: invalid_step'))
      }
      OnboardingService.mockImplementation(() => mockService)

      const request = new NextRequest('http://localhost:3000/api/onboarding/complete-step', {
        method: 'POST',
        body: JSON.stringify({ stepId: 'invalid_step' })
      })

      const response = await completeStep(request)
      const data = await response.json()

      expect(response.status).toBe(400)
      expect(data.error).toBe('Bad Request')
    })
  })

  describe('GET /api/onboarding/status/[tutorId]', () => {
    it('should return onboarding status successfully', async () => {
      const { createClient } = require('@/utils/supabase/server')
      const { OnboardingService } = require('@/lib/onboarding')
      
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'tutor' } })
            })
          })
        })
      })

      const mockStatus = {
        completedSteps: ['welcome'],
        currentStep: 'profile_setup',
        startedAt: new Date(),
        totalSteps: 5,
        percentComplete: 20
      }

      const mockProgress = {
        currentStep: { id: 'profile_setup', title: 'Profile Setup' },
        completedSteps: [{ id: 'welcome' }],
        remainingSteps: [{ id: 'profile_setup' }, { id: 'best_practices' }],
        percentComplete: 20,
        estimatedTimeRemaining: 20
      }

      const mockService = {
        getOnboardingStatus: jest.fn().mockResolvedValue(mockStatus),
        isOnboardingComplete: jest.fn().mockResolvedValue(false),
        trackProgress: jest.fn().mockResolvedValue(mockProgress)
      }
      OnboardingService.mockImplementation(() => mockService)

      const request = new NextRequest('http://localhost:3000/api/onboarding/status/test-user-123')
      const response = await getStatus(request, { params: { tutorId: 'test-user-123' } })
      const data = await response.json()

      expect(response.status).toBe(200)
      expect(data.success).toBe(true)
      expect(data.status).toEqual({
        ...mockStatus,
        startedAt: mockStatus.startedAt.toISOString()
      })
      expect(data.isComplete).toBe(false)
    })

    it('should return 403 when accessing another user\'s status', async () => {
      const { createClient } = require('@/utils/supabase/server')
      
      createClient.mockReturnValue({
        auth: {
          getUser: jest.fn().mockResolvedValue({ data: { user: mockUser }, error: null })
        },
        from: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: { role: 'tutor' } })
            })
          })
        })
      })

      const request = new NextRequest('http://localhost:3000/api/onboarding/status/other-user-id')
      const response = await getStatus(request, { params: { tutorId: 'other-user-id' } })
      const data = await response.json()

      expect(response.status).toBe(403)
      expect(data.error).toBe('Forbidden')
    })
  })
}) 