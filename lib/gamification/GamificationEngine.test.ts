import { GamificationEngine, PointsReason } from './GamificationEngine'
import { POINTS_VALUES } from './constants'

// Mock Supabase client
const createMockResponse = () => {
  const mockEq = jest.fn()
  mockEq.mockReturnValue({
    eq: mockEq, // Support chained .eq() calls
    single: jest.fn(() => ({ data: null, error: null })),
    gte: jest.fn(() => ({ data: [], error: null }))
  })
  
  return {
    insert: jest.fn(() => ({ error: null })),
    select: jest.fn(() => ({
      eq: mockEq,
      order: jest.fn(() => ({
        limit: jest.fn(() => ({ data: [], error: null }))
      }))
    })),
    upsert: jest.fn(() => ({ error: null })),
    update: jest.fn(() => ({
      eq: jest.fn(() => ({ error: null }))
    }))
  }
}

const mockSupabase = {
  from: jest.fn(() => createMockResponse())
}

describe('GamificationEngine', () => {
  let engine: GamificationEngine

  beforeEach(() => {
    jest.clearAllMocks()
    engine = new GamificationEngine(mockSupabase as any)
  })

  describe('calculatePoints', () => {
    it('should return correct points for each reason', () => {
      // Test each points value
      const reasons: PointsReason[] = [
        'studentMilestone',
        'monthlyRetention',
        'sessionCompletion',
        'positiveReview',
        'highAttendance',
        'referralConversion',
        'firstSession',
        'tenSessionMilestone'
      ]

      reasons.forEach(reason => {
        const points = engine.calculatePoints(reason)
        expect(points).toBe(POINTS_VALUES[reason])
      })
    })

    it('should return 0 for invalid reason', () => {
      const points = engine.calculatePoints('invalidReason' as PointsReason)
      expect(points).toBe(0)
    })
  })

  describe('recordPoints', () => {
    it('should insert points record into database', async () => {
      const mockInsert = jest.fn(() => ({ error: null }))
      mockSupabase.from.mockReturnValueOnce({
        ...createMockResponse(),
        insert: mockInsert
      })

      await engine.recordPoints(
        'tutor123',
        75,
        'studentMilestone',
        'student456',
        'student'
      )

      expect(mockSupabase.from).toHaveBeenCalledWith('gamification_points')
      expect(mockInsert).toHaveBeenCalledWith({
        tutor_id: 'tutor123',
        points: 75,
        reason: 'studentMilestone',
        reference_id: 'student456',
        reference_type: 'student',
        metadata: expect.objectContaining({
          timestamp: expect.any(String)
        })
      })
    })

    it('should throw error if database insert fails', async () => {
      const mockError = { message: 'Database error' }
      mockSupabase.from.mockReturnValueOnce({
        ...createMockResponse(),
        insert: jest.fn(() => ({ error: mockError }))
      })

      await expect(
        engine.recordPoints('tutor123', 75, 'studentMilestone')
      ).rejects.toThrow('Failed to record points')
    })
  })

  describe('awardPoints', () => {
    it('should calculate, record points and check achievements', async () => {
      const mockInsert = jest.fn(() => ({ error: null }))
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'gamification_points') {
          return {
            ...createMockResponse(),
            insert: mockInsert,
            select: jest.fn(() => ({
              eq: jest.fn(() => ({ 
                data: [{ points: 75 }], 
                error: null 
              }))
            }))
          }
        }
        return createMockResponse()
      })

      await engine.awardPoints('tutor123', 'studentMilestone', 'ref123')

      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          tutor_id: 'tutor123',
          points: 75,
          reason: 'studentMilestone',
          reference_id: 'ref123'
        })
      )
    })
  })

  describe('calculateMonetaryBonus', () => {
    it('should calculate correct bonus amounts', async () => {
      const mockInsert = jest.fn(() => ({ error: null }))
      mockSupabase.from.mockReturnValueOnce({
        ...createMockResponse(),
        insert: mockInsert
      })

      const bonusAmount = await engine.calculateMonetaryBonus(
        'tutor123',
        'student_retention',
        'student456'
      )

      expect(bonusAmount).toBe(10) // $10 for student retention
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          tutor_id: 'tutor123',
          bonus_type: 'student_retention',
          amount: 10,
          reference_id: 'student456',
          reference_type: 'student',
          status: 'pending'
        })
      )
    })
  })

  describe('Points Calculation Scenarios', () => {
    it('should award correct points for student completing milestone', async () => {
      const spy = jest.spyOn(engine, 'calculatePoints')
      
      await engine.awardPoints('tutor123', 'studentMilestone', 'student456')
      
      expect(spy).toHaveBeenCalledWith('studentMilestone')
      expect(spy).toHaveReturnedWith(75)
    })

    it('should award correct points for monthly retention', async () => {
      const spy = jest.spyOn(engine, 'calculatePoints')
      
      await engine.awardPoints('tutor123', 'monthlyRetention', 'student456')
      
      expect(spy).toHaveBeenCalledWith('monthlyRetention')
      expect(spy).toHaveReturnedWith(50)
    })

    it('should award correct points for positive review', async () => {
      const spy = jest.spyOn(engine, 'calculatePoints')
      
      await engine.awardPoints('tutor123', 'positiveReview', 'session456')
      
      expect(spy).toHaveBeenCalledWith('positiveReview')
      expect(spy).toHaveReturnedWith(50)
    })

    it('should award correct points for referral conversion', async () => {
      const spy = jest.spyOn(engine, 'calculatePoints')
      
      await engine.awardPoints('tutor123', 'referralConversion', 'referral456')
      
      expect(spy).toHaveBeenCalledWith('referralConversion')
      expect(spy).toHaveReturnedWith(100)
    })
  })

  describe('Bonus Calculation Scenarios', () => {
    const testCases = [
      { type: 'student_retention' as const, expected: 10 },
      { type: 'session_milestone' as const, expected: 25 },
      { type: 'quality_review' as const, expected: 5 },
      { type: 'referral' as const, expected: 50 },
      { type: 'new_student' as const, expected: 15 },
      { type: 'monthly_excellence' as const, expected: 50 }
    ]

    testCases.forEach(({ type, expected }) => {
      it(`should calculate $${expected} bonus for ${type}`, async () => {
        mockSupabase.from.mockReturnValueOnce({
          ...createMockResponse(),
          insert: jest.fn(() => ({ error: null }))
        })

        const amount = await engine.calculateMonetaryBonus(
          'tutor123',
          type,
          'ref123'
        )

        expect(amount).toBe(expected)
      })
    })
  })
}) 