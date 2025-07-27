import { OnboardingService, ONBOARDING_STEPS } from './OnboardingService'
import { SupabaseClient } from '@supabase/supabase-js'

// Mock Supabase client
type MockSupabase = SupabaseClient & {
  _mocks: {
    from: jest.Mock
    select: jest.Mock
    eq: jest.Mock
    order: jest.Mock
    insert: jest.Mock
    delete: jest.Mock
    single: jest.Mock
  }
}

const createMockSupabase = (): MockSupabase => {
  const mockFrom = jest.fn()
  const mockSelect = jest.fn()
  const mockEq = jest.fn()
  const mockOrder = jest.fn()
  const mockInsert = jest.fn()
  const mockDelete = jest.fn()
  const mockSingle = jest.fn()

  // Chain methods together
  mockFrom.mockReturnValue({ 
    select: mockSelect,
    insert: mockInsert,
    delete: mockDelete
  })
  mockSelect.mockReturnValue({ 
    eq: mockEq,
    single: mockSingle 
  })
  mockEq.mockReturnValue({ 
    order: mockOrder,
    single: mockSingle 
  })
  mockOrder.mockReturnValue({ 
    data: [],
    error: null 
  })
  mockInsert.mockReturnValue({ 
    error: null 
  })
  mockDelete.mockReturnValue({ 
    eq: mockEq 
  })
  mockSingle.mockReturnValue({ 
    data: null,
    error: null 
  })

  return {
    from: mockFrom,
    // Store references to mock functions for assertions
    _mocks: {
      from: mockFrom,
      select: mockSelect,
      eq: mockEq,
      order: mockOrder,
      insert: mockInsert,
      delete: mockDelete,
      single: mockSingle
    }
  } as unknown as MockSupabase
}

describe('OnboardingService', () => {
  let service: OnboardingService
  let mockSupabase: MockSupabase

  beforeEach(() => {
    jest.clearAllMocks()
    mockSupabase = createMockSupabase()
    service = new OnboardingService(mockSupabase as SupabaseClient)
  })

  describe('getOnboardingStatus', () => {
    it('should retrieve onboarding status for new tutor', async () => {
      // Mock empty response (new tutor)
      mockSupabase._mocks.order.mockReturnValue({
        data: [],
        error: null
      })

      const status = await service.getOnboardingStatus('tutor-123')

      expect(status).toEqual({
        completedSteps: [],
        currentStep: 'welcome',
        startedAt: expect.any(Date),
        completedAt: undefined,
        totalSteps: 5,
        percentComplete: 0
      })

      expect(mockSupabase._mocks.from).toHaveBeenCalledWith('tutor_onboarding')
      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith('tutor_id', 'tutor-123')
    })

    it('should retrieve onboarding status for tutor with progress', async () => {
      const mockData = [
        { 
          step_completed: 'welcome', 
          completed_at: '2024-01-01T10:00:00Z' 
        },
        { 
          step_completed: 'profile_setup', 
          completed_at: '2024-01-01T10:30:00Z' 
        }
      ]

      mockSupabase._mocks.order.mockReturnValue({
        data: mockData,
        error: null
      })

      const status = await service.getOnboardingStatus('tutor-123')

      expect(status).toEqual({
        completedSteps: ['welcome', 'profile_setup'],
        currentStep: 'best_practices',
        startedAt: new Date('2024-01-01T10:00:00Z'),
        completedAt: undefined,
        totalSteps: 5,
        percentComplete: 40
      })
    })

    it('should handle completed onboarding', async () => {
      const mockData = ONBOARDING_STEPS.map((step, index) => ({
        step_completed: step.id,
        completed_at: new Date(2024, 0, 1, 10, index * 30).toISOString()
      }))

      mockSupabase._mocks.order.mockReturnValue({
        data: mockData,
        error: null
      })

      const status = await service.getOnboardingStatus('tutor-123')

      expect(status.completedSteps).toHaveLength(5)
      expect(status.percentComplete).toBe(100)
      expect(status.completedAt).toBeDefined()
    })

    it('should handle database errors gracefully', async () => {
      mockSupabase._mocks.order.mockReturnValue({
        data: null,
        error: { message: 'Database connection failed' }
      })

      await expect(service.getOnboardingStatus('tutor-123'))
        .rejects.toThrow('Failed to fetch onboarding status: Database connection failed')
    })
  })

  describe('completeStep', () => {
    it('should complete a step successfully', async () => {
      // Mock current status - no steps completed
      mockSupabase._mocks.order.mockReturnValue({
        data: [],
        error: null
      })

      // Mock successful insert
      mockSupabase._mocks.insert.mockReturnValue({
        error: null
      })

      await service.completeStep('tutor-123', 'welcome')

      expect(mockSupabase._mocks.insert).toHaveBeenCalledWith({
        tutor_id: 'tutor-123',
        step_completed: 'welcome',
        metadata: {
          step_title: 'Welcome & Platform Overview',
          step_order: 1
        }
      })
    })

    it('should prevent duplicate step completion', async () => {
      // Mock current status - welcome already completed
      mockSupabase._mocks.order.mockReturnValue({
        data: [{ step_completed: 'welcome', completed_at: '2024-01-01T10:00:00Z' }],
        error: null
      })

      await expect(service.completeStep('tutor-123', 'welcome'))
        .rejects.toThrow("Step 'welcome' is already completed")
    })

    it('should enforce sequential completion', async () => {
      // Mock current status - only welcome completed
      mockSupabase._mocks.order.mockReturnValue({
        data: [{ step_completed: 'welcome', completed_at: '2024-01-01T10:00:00Z' }],
        error: null
      })

      // Try to complete step 3 (should require step 2 first)
      await expect(service.completeStep('tutor-123', 'best_practices'))
        .rejects.toThrow("Steps must be completed in order. Next step should be 'profile_setup'")
    })

    it('should handle invalid step IDs', async () => {
      await expect(service.completeStep('tutor-123', 'invalid_step'))
        .rejects.toThrow("Invalid step ID: invalid_step")
    })

    it('should award badge on final step completion', async () => {
      // Mock current status - 4 steps completed
      const completedSteps = ONBOARDING_STEPS.slice(0, 4).map(step => ({
        step_completed: step.id,
        completed_at: new Date().toISOString()
      }))

      mockSupabase._mocks.order.mockReturnValue({
        data: completedSteps,
        error: null
      })

      // Mock successful insert for step completion and badge/points
      mockSupabase._mocks.insert.mockReturnValue({
        error: null
      })

      // Mock badge check - no existing badge
      mockSupabase._mocks.single.mockReturnValue({
        data: null,
        error: null
      })

      await service.completeStep('tutor-123', 'first_student_guide')

      // Verify step completion was recorded
      expect(mockSupabase._mocks.insert).toHaveBeenCalledWith({
        tutor_id: 'tutor-123',
        step_completed: 'first_student_guide',
        metadata: {
          step_title: 'First Student Setup Guide',
          step_order: 5
        }
      })

      // Verify badge insert was attempted
      expect(mockSupabase._mocks.from).toHaveBeenCalledWith('tutor_badges')
    })

    it('should handle database constraint violations', async () => {
      mockSupabase._mocks.order.mockReturnValue({
        data: [],
        error: null
      })

      mockSupabase._mocks.insert.mockReturnValue({
        error: { code: '23505', message: 'Duplicate key violation' }
      })

      await expect(service.completeStep('tutor-123', 'welcome'))
        .rejects.toThrow("Step 'welcome' is already completed")
    })
  })

  describe('trackProgress', () => {
    it('should return detailed progress information', async () => {
      // Mock 2 steps completed
      mockSupabase._mocks.order.mockReturnValue({
        data: [
          { step_completed: 'welcome', completed_at: '2024-01-01T10:00:00Z' },
          { step_completed: 'profile_setup', completed_at: '2024-01-01T10:30:00Z' }
        ],
        error: null
      })

      const progress = await service.trackProgress('tutor-123')

      expect(progress).toEqual({
        currentStep: expect.objectContaining({
          id: 'best_practices',
          title: 'Best Practices Tutorial'
        }),
        completedSteps: expect.arrayContaining([
          expect.objectContaining({ id: 'welcome', isCompleted: true }),
          expect.objectContaining({ id: 'profile_setup', isCompleted: true })
        ]),
        remainingSteps: expect.arrayContaining([
          expect.objectContaining({ id: 'best_practices' }),
          expect.objectContaining({ id: 'ai_tools_intro' }),
          expect.objectContaining({ id: 'first_student_guide' })
        ]),
        percentComplete: 40,
        estimatedTimeRemaining: 15 // 3 steps * 5 minutes
      })
    })

    it('should handle fully completed onboarding', async () => {
      const allStepsCompleted = ONBOARDING_STEPS.map(step => ({
        step_completed: step.id,
        completed_at: new Date().toISOString()
      }))

      mockSupabase._mocks.order.mockReturnValue({
        data: allStepsCompleted,
        error: null
      })

      const progress = await service.trackProgress('tutor-123')

      expect(progress.completedSteps).toHaveLength(5)
      expect(progress.remainingSteps).toHaveLength(0)
      expect(progress.percentComplete).toBe(100)
      expect(progress.estimatedTimeRemaining).toBe(0)
    })
  })

  describe('isOnboardingComplete', () => {
    it('should return true when all steps are completed', async () => {
      const allStepsCompleted = ONBOARDING_STEPS.map(step => ({
        step_completed: step.id,
        completed_at: new Date().toISOString()
      }))

      mockSupabase._mocks.order.mockReturnValue({
        data: allStepsCompleted,
        error: null
      })

      const isComplete = await service.isOnboardingComplete('tutor-123')
      expect(isComplete).toBe(true)
    })

    it('should return false when steps remain', async () => {
      mockSupabase._mocks.order.mockReturnValue({
        data: [{ step_completed: 'welcome', completed_at: '2024-01-01T10:00:00Z' }],
        error: null
      })

      const isComplete = await service.isOnboardingComplete('tutor-123')
      expect(isComplete).toBe(false)
    })
  })

  describe('resetOnboarding', () => {
    it('should reset onboarding successfully', async () => {
      mockSupabase._mocks.eq.mockReturnValue({
        error: null
      })

      await service.resetOnboarding('tutor-123')

      expect(mockSupabase._mocks.delete).toHaveBeenCalled()
      expect(mockSupabase._mocks.eq).toHaveBeenCalledWith('tutor_id', 'tutor-123')
    })

    it('should handle reset errors', async () => {
      mockSupabase._mocks.eq.mockReturnValue({
        error: { message: 'Delete failed' }
      })

      await expect(service.resetOnboarding('tutor-123'))
        .rejects.toThrow('Failed to reset onboarding: Delete failed')
    })
  })
}) 