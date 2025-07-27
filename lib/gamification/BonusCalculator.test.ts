import { BonusCalculator } from './BonusCalculator';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => {
    const mockFrom = jest.fn(() => {
      const chainableMethods = {
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        update: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        gte: jest.fn().mockReturnThis(),
        lte: jest.fn().mockReturnThis(),
        order: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      };
      return chainableMethods;
    });
    
    return {
      from: mockFrom,
    };
  }),
}));

describe('BonusCalculator', () => {
  let bonusCalculator: BonusCalculator;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createClientComponentClient();
    bonusCalculator = new BonusCalculator(mockSupabase);
  });

  describe('Student Retention Bonus', () => {
    it('should calculate $10 per student per month after month 3', async () => {
      const tutorId = 'test-tutor-123';
      const studentId = 'test-student-123';
      const monthsRetained = 5; // 2 months beyond month 3

      const bonus = await bonusCalculator.calculateRetentionBonus(
        tutorId,
        studentId,
        monthsRetained
      );

      expect(bonus.amount).toBe(20); // $10 * 2 months
      expect(bonus.type).toBe('student_retention');
      expect(bonus.metadata.monthsRetained).toBe(5);
      expect(bonus.metadata.bonusMonths).toBe(2);
    });

    it('should return $0 for retention of 3 months or less', async () => {
      const tutorId = 'test-tutor-123';
      const studentId = 'test-student-123';

      const bonus = await bonusCalculator.calculateRetentionBonus(
        tutorId,
        studentId,
        3
      );

      expect(bonus.amount).toBe(0);
      expect(bonus.metadata.bonusMonths).toBe(0);
    });

    it('should check for existing retention bonuses to avoid duplicates', async () => {
      const tutorId = 'test-tutor-123';
      const studentId = 'test-student-123';

      // Mock existing bonus
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            eq: jest.fn().mockReturnValueOnce({
              gte: jest.fn().mockResolvedValueOnce({
                data: [{ id: 'existing-bonus' }],
                error: null,
              }),
            }),
          }),
        }),
      });

      const bonus = await bonusCalculator.calculateRetentionBonus(
        tutorId,
        studentId,
        5
      );

      expect(bonus.amount).toBe(0);
      expect(bonus.isDuplicate).toBe(true);
    });
  });

  describe('Session Milestone Bonus', () => {
    it('should calculate $25 per 5 completed sessions', async () => {
      const tutorId = 'test-tutor-123';
      const completedSessions = 15;

      const bonus = await bonusCalculator.calculateMilestoneBonus(
        tutorId,
        completedSessions
      );

      expect(bonus.amount).toBe(75); // $25 * 3 milestones
      expect(bonus.type).toBe('session_milestone');
      expect(bonus.metadata.milestonesAchieved).toBe(3);
    });

    it('should only award for new milestones not previously paid', async () => {
      const tutorId = 'test-tutor-123';
      
      // Mock 2 existing milestone bonuses
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [
              { metadata: { milestone: 5 } },
              { metadata: { milestone: 10 } },
            ],
            error: null,
          }),
        }),
      });

      const bonus = await bonusCalculator.calculateMilestoneBonus(
        tutorId,
        15 // Should only get bonus for milestone 15
      );

      expect(bonus.amount).toBe(25); // Only 1 new milestone
      expect(bonus.metadata.newMilestones).toEqual([15]);
    });

    it('should return $0 for sessions less than 5', async () => {
      const tutorId = 'test-tutor-123';

      const bonus = await bonusCalculator.calculateMilestoneBonus(
        tutorId,
        4
      );

      expect(bonus.amount).toBe(0);
      expect(bonus.metadata.milestonesAchieved).toBe(0);
    });
  });

  describe('Review Bonus', () => {
    it('should calculate $5 per 5-star review', async () => {
      const tutorId = 'test-tutor-123';
      const reviewId = 'test-review-123';

      const bonus = await bonusCalculator.calculateReviewBonus(
        tutorId,
        reviewId,
        5 // 5-star rating
      );

      expect(bonus.amount).toBe(5);
      expect(bonus.type).toBe('five_star_review');
    });

    it('should return $0 for ratings below 5 stars', async () => {
      const tutorId = 'test-tutor-123';
      const reviewId = 'test-review-123';

      const bonus = await bonusCalculator.calculateReviewBonus(
        tutorId,
        reviewId,
        4
      );

      expect(bonus.amount).toBe(0);
    });

    it('should check for duplicate review bonuses', async () => {
      const tutorId = 'test-tutor-123';
      const reviewId = 'test-review-123';

      // Mock existing bonus for this review
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [{ id: 'existing-bonus' }],
            error: null,
          }),
        }),
      });

      const bonus = await bonusCalculator.calculateReviewBonus(
        tutorId,
        reviewId,
        5
      );

      expect(bonus.amount).toBe(0);
      expect(bonus.isDuplicate).toBe(true);
    });
  });

  describe('Referral Bonus', () => {
    it('should calculate $50 for referred student completing 5+ sessions', async () => {
      const tutorId = 'test-tutor-123';
      const referredStudentId = 'referred-student-123';
      const sessionsCompleted = 5;

      const bonus = await bonusCalculator.calculateReferralBonus(
        tutorId,
        referredStudentId,
        sessionsCompleted
      );

      expect(bonus.amount).toBe(50);
      expect(bonus.type).toBe('student_referral');
    });

    it('should return $0 if referred student has less than 5 sessions', async () => {
      const tutorId = 'test-tutor-123';
      const referredStudentId = 'referred-student-123';

      const bonus = await bonusCalculator.calculateReferralBonus(
        tutorId,
        referredStudentId,
        4
      );

      expect(bonus.amount).toBe(0);
      expect(bonus.metadata.reason).toBe('Minimum 5 sessions required');
    });

    it('should prevent duplicate referral bonuses', async () => {
      const tutorId = 'test-tutor-123';
      const referredStudentId = 'referred-student-123';

      // Mock existing referral bonus
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [{ id: 'existing-bonus' }],
            error: null,
          }),
        }),
      });

      const bonus = await bonusCalculator.calculateReferralBonus(
        tutorId,
        referredStudentId,
        5
      );

      expect(bonus.amount).toBe(0);
      expect(bonus.isDuplicate).toBe(true);
    });
  });

  describe('Bonus Recording', () => {
    it('should record bonus with pending status', async () => {
      const bonus = {
        tutor_id: 'test-tutor-123',
        bonus_type: 'session_milestone',
        amount: 25,
        reference_id: 'session-123',
        reference_type: 'session',
        status: 'pending' as const,
        metadata: { milestone: 5 },
      };

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: { id: 'bonus-123', ...bonus },
        error: null,
      });

      const result = await bonusCalculator.recordBonus(bonus);

      expect(result.id).toBe('bonus-123');
      expect(mockSupabase.from).toHaveBeenCalledWith('tutor_bonuses');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(bonus);
    });

    it('should handle recording errors gracefully', async () => {
      const bonus = {
        tutor_id: 'test-tutor-123',
        bonus_type: 'session_milestone',
        amount: 25,
        reference_id: 'session-123',
        reference_type: 'session',
        status: 'pending' as const,
      };

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: null,
        error: new Error('Database error'),
      });

      await expect(bonusCalculator.recordBonus(bonus)).rejects.toThrow(
        'Database error'
      );
    });
  });

  describe('Bonus Approval Workflow', () => {
    it('should approve pending bonus', async () => {
      const bonusId = 'bonus-123';

      mockSupabase.from().update.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          data: { id: bonusId, status: 'approved' },
          error: null,
        }),
      });

      const result = await bonusCalculator.approveBonus(bonusId);

      expect(result.status).toBe('approved');
      expect(mockSupabase.from).toHaveBeenCalledWith('tutor_bonuses');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'approved',
        approved_at: expect.any(String),
      });
    });

    it('should mark bonus as paid', async () => {
      const bonusId = 'bonus-123';
      const paymentId = 'payment-123';

      mockSupabase.from().update.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          data: { id: bonusId, status: 'paid' },
          error: null,
        }),
      });

      const result = await bonusCalculator.markBonusAsPaid(bonusId, paymentId);

      expect(result.status).toBe('paid');
      expect(mockSupabase.from().update).toHaveBeenCalledWith({
        status: 'paid',
        paid_at: expect.any(String),
        payment_reference: paymentId,
      });
    });
  });

  describe('Bonus Summary', () => {
    it('should calculate total pending bonuses', async () => {
      const tutorId = 'test-tutor-123';

      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [
              { amount: 25, status: 'pending' },
              { amount: 50, status: 'pending' },
              { amount: 10, status: 'pending' },
            ],
            error: null,
          }),
        }),
      });

      const summary = await bonusCalculator.getBonusSummary(tutorId);

      expect(summary.pendingTotal).toBe(85);
      expect(summary.pendingCount).toBe(3);
    });

    it('should calculate total approved bonuses', async () => {
      const tutorId = 'test-tutor-123';

      // First call for pending
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
        }),
      });

      // Second call for approved
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [
              { amount: 100, status: 'approved' },
              { amount: 75, status: 'approved' },
            ],
            error: null,
          }),
        }),
      });

      const summary = await bonusCalculator.getBonusSummary(tutorId);

      expect(summary.approvedTotal).toBe(175);
      expect(summary.approvedCount).toBe(2);
    });

    it('should calculate monthly bonus totals', async () => {
      const tutorId = 'test-tutor-123';

      // Mock calls for pending and approved
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
        }),
      });

      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
        }),
      });

      // Third call for paid
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            gte: jest.fn().mockReturnValueOnce({
              lte: jest.fn().mockResolvedValueOnce({
                data: [
                  { amount: 50, status: 'paid' },
                  { amount: 25, status: 'paid' },
                ],
                error: null,
              }),
            }),
          }),
        }),
      });

      const summary = await bonusCalculator.getBonusSummary(tutorId);

      expect(summary.paidThisMonth).toBe(75);
    });
  });

  describe('Tier-based Bonus Multipliers', () => {
    it('should apply tier multipliers to bonuses', async () => {
      const tutorId = 'test-tutor-123';
      const baseBonusAmount = 100;

      // Test for each tier
      const multipliers = {
        standard: 1.0,
        silver: 1.1,   // 10% bonus
        gold: 1.2,     // 20% bonus
        elite: 1.5,    // 50% bonus
      };

      for (const [tier, multiplier] of Object.entries(multipliers)) {
        const adjustedAmount = bonusCalculator.applyTierMultiplier(
          baseBonusAmount,
          tier as any
        );
        expect(adjustedAmount).toBe(baseBonusAmount * multiplier);
      }
    });
  });
}); 