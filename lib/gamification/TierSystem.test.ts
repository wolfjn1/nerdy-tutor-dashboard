import { TierSystem } from './TierSystem';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createClientComponentClient: jest.fn(() => {
    const mockSelect = jest.fn().mockReturnThis();
    const mockEq = jest.fn().mockReturnThis();
    const mockSingle = jest.fn();
    const mockInsert = jest.fn().mockReturnThis();
    const mockUpdate = jest.fn().mockReturnThis();
    const mockUpsert = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    
    const mockFrom = jest.fn(() => ({
      select: mockSelect,
      eq: mockEq,
      single: mockSingle,
      insert: mockInsert,
      update: mockUpdate,
      upsert: mockUpsert,
      order: mockOrder,
    }));
    
    return {
      from: mockFrom,
    };
  }),
}));

describe('TierSystem', () => {
  let tierSystem: TierSystem;
  let mockSupabase: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockSupabase = createClientComponentClient();
    tierSystem = new TierSystem();
  });

  describe('Tier Calculation', () => {
    it('should calculate Standard tier for new tutors', async () => {
      const stats = {
        completedSessions: 0,
        averageRating: 0,
        retentionRate: 0,
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('standard');
    });

    it('should calculate Silver tier when all criteria met', async () => {
      const stats = {
        completedSessions: 50,
        averageRating: 4.5,
        retentionRate: 80,
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('silver');
    });

    it('should calculate Gold tier when all criteria met', async () => {
      const stats = {
        completedSessions: 150,
        averageRating: 4.7,
        retentionRate: 85,
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('gold');
    });

    it('should calculate Elite tier when all criteria met', async () => {
      const stats = {
        completedSessions: 300,
        averageRating: 4.8,
        retentionRate: 90,
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('elite');
    });

    it('should NOT promote if only sessions criteria met', async () => {
      const stats = {
        completedSessions: 50,
        averageRating: 4.0, // Below Silver requirement
        retentionRate: 80,
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('standard');
    });

    it('should NOT promote if only rating criteria met', async () => {
      const stats = {
        completedSessions: 40, // Below Silver requirement
        averageRating: 4.5,
        retentionRate: 80,
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('standard');
    });

    it('should NOT promote if only retention criteria met', async () => {
      const stats = {
        completedSessions: 50,
        averageRating: 4.5,
        retentionRate: 75, // Below Silver requirement
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('standard');
    });

    it('should handle edge case at exact thresholds', async () => {
      const stats = {
        completedSessions: 50, // Exactly at Silver threshold
        averageRating: 4.5,    // Exactly at Silver threshold
        retentionRate: 80,     // Exactly at Silver threshold
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('silver');
    });

    it('should return highest eligible tier', async () => {
      // Tutor qualifies for Gold but not Elite
      const stats = {
        completedSessions: 200,
        averageRating: 4.7,
        retentionRate: 85,
      };

      const tier = await tierSystem.calculateTier(stats);
      expect(tier).toBe('gold');
    });
  });

  describe('Tutor Stats Retrieval', () => {
    it('should fetch and calculate tutor stats correctly', async () => {
      const tutorId = 'test-tutor-123';
      
      // Mock session data
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [
              { id: '1', status: 'completed' },
              { id: '2', status: 'completed' },
              { id: '3', status: 'completed' },
            ],
            error: null,
          }),
        }),
      });

      // Mock rating data
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          data: [
            { rating: 5 },
            { rating: 4 },
            { rating: 5 },
          ],
          error: null,
        }),
      });

      // Mock student retention data
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: [
                { student_id: '1', created_at: '2024-01-01T00:00:00Z' },
                { student_id: '1', created_at: '2024-04-01T00:00:00Z' },
                { student_id: '2', created_at: '2024-01-01T00:00:00Z' },
                { student_id: '2', created_at: '2024-04-15T00:00:00Z' },
                { student_id: '3', created_at: '2024-02-01T00:00:00Z' },
                { student_id: '3', created_at: '2024-02-15T00:00:00Z' },
              ],
              error: null,
            }),
          }),
        }),
      });

      const stats = await tierSystem.getTutorStats(tutorId);
      
      expect(stats.completedSessions).toBe(3);
      expect(stats.averageRating).toBeCloseTo(4.67, 2);
      expect(stats.retentionRate).toBeGreaterThan(0);
    });

    it('should handle tutor with no sessions', async () => {
      const tutorId = 'new-tutor-123';
      
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockResolvedValueOnce({
            data: [],
            error: null,
          }),
        }),
      });

      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockResolvedValueOnce({
          data: [],
          error: null,
        }),
      });

      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockReturnValueOnce({
            order: jest.fn().mockResolvedValueOnce({
              data: [],
              error: null,
            }),
          }),
        }),
      });

      const stats = await tierSystem.getTutorStats(tutorId);
      
      expect(stats.completedSessions).toBe(0);
      expect(stats.averageRating).toBe(0);
      expect(stats.retentionRate).toBe(0);
    });
  });

  describe('Tier Promotion', () => {
    it('should promote tutor and update database', async () => {
      const tutorId = 'test-tutor-123';
      const newTier = 'silver';

      mockSupabase.from().upsert.mockResolvedValueOnce({
        data: { tutor_id: tutorId, current_tier: newTier },
        error: null,
      });

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      mockSupabase.from().upsert.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      await tierSystem.promoteTier(tutorId, newTier);

      expect(mockSupabase.from).toHaveBeenCalledWith('tutor_tiers');
      expect(mockSupabase.from().upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          tutor_id: tutorId,
          current_tier: newTier,
        })
      );
    });

    it('should record tier promotion in gamification points', async () => {
      const tutorId = 'test-tutor-123';
      const newTier = 'gold';

      mockSupabase.from().upsert.mockResolvedValueOnce({
        data: { tutor_id: tutorId, current_tier: newTier },
        error: null,
      });

      mockSupabase.from().insert.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      mockSupabase.from().upsert.mockResolvedValueOnce({
        data: {},
        error: null,
      });

      await tierSystem.promoteTier(tutorId, newTier);

      expect(mockSupabase.from).toHaveBeenCalledWith('gamification_points');
      expect(mockSupabase.from().insert).toHaveBeenCalledWith(
        expect.objectContaining({
          tutor_id: tutorId,
          points: expect.any(Number),
          reason: 'tier_promotion',
          metadata: expect.objectContaining({ tier: newTier }),
        })
      );
    });
  });

  describe('Rate Adjustments', () => {
    it('should calculate correct rate increase for Silver tier', () => {
      const baseRate = 100;
      const newRate = tierSystem.calculateRateAdjustment(baseRate, 'silver');
      expect(newRate).toBe(105); // 5% increase
    });

    it('should calculate correct rate increase for Gold tier', () => {
      const baseRate = 100;
      const newRate = tierSystem.calculateRateAdjustment(baseRate, 'gold');
      expect(newRate).toBeCloseTo(110, 5); // 10% increase
    });

    it('should calculate correct rate increase for Elite tier', () => {
      const baseRate = 100;
      const newRate = tierSystem.calculateRateAdjustment(baseRate, 'elite');
      expect(newRate).toBeCloseTo(115, 5); // 15% increase
    });

    it('should not adjust rate for Standard tier', () => {
      const baseRate = 100;
      const newRate = tierSystem.calculateRateAdjustment(baseRate, 'standard');
      expect(newRate).toBe(100); // No increase
    });
  });

  describe('Tier Benefits', () => {
    it('should return correct benefits for each tier', () => {
      const standardBenefits = tierSystem.getTierBenefits('standard');
      expect(standardBenefits).toEqual([
        'Access to basic platform features',
        'Standard student matching',
      ]);

      const silverBenefits = tierSystem.getTierBenefits('silver');
      expect(silverBenefits).toContain('5% base rate increase');
      expect(silverBenefits).toContain('Priority in search results');

      const goldBenefits = tierSystem.getTierBenefits('gold');
      expect(goldBenefits).toContain('10% base rate increase');
      expect(goldBenefits).toContain('Featured tutor badge');

      const eliteBenefits = tierSystem.getTierBenefits('elite');
      expect(eliteBenefits).toContain('15% base rate increase');
      expect(eliteBenefits).toContain('Access to specialized program');
      expect(eliteBenefits).toContain('Quarterly performance bonuses');
    });
  });

  describe('Check and Promote', () => {
    it('should check stats and promote when eligible', async () => {
      const tutorId = 'test-tutor-123';

      // Mock current tier as standard
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: { current_tier: 'standard' },
            error: null,
          }),
        }),
      });

      // Mock stats that qualify for Silver
      jest.spyOn(tierSystem, 'getTutorStats').mockResolvedValueOnce({
        completedSessions: 60,
        averageRating: 4.6,
        retentionRate: 82,
      });

      jest.spyOn(tierSystem, 'promoteTier').mockResolvedValueOnce(undefined);

      const result = await tierSystem.checkAndPromote(tutorId);

      expect(result.promoted).toBe(true);
      expect(result.newTier).toBe('silver');
      expect(result.previousTier).toBe('standard');
      expect(tierSystem.promoteTier).toHaveBeenCalledWith(tutorId, 'silver');
    });

    it('should not promote when already at appropriate tier', async () => {
      const tutorId = 'test-tutor-123';

      // Mock current tier as silver
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: { current_tier: 'silver' },
            error: null,
          }),
        }),
      });

      // Mock stats that still only qualify for Silver
      jest.spyOn(tierSystem, 'getTutorStats').mockResolvedValueOnce({
        completedSessions: 60,
        averageRating: 4.6,
        retentionRate: 82,
      });

      const result = await tierSystem.checkAndPromote(tutorId);

      expect(result.promoted).toBe(false);
      expect(result.currentTier).toBe('silver');
    });

    it('should handle demotion prevention (tiers never go down)', async () => {
      const tutorId = 'test-tutor-123';

      // Mock current tier as gold
      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          single: jest.fn().mockResolvedValueOnce({
            data: { current_tier: 'gold' },
            error: null,
          }),
        }),
      });

      // Mock stats that would only qualify for Silver
      jest.spyOn(tierSystem, 'getTutorStats').mockResolvedValueOnce({
        completedSessions: 60,
        averageRating: 4.5,
        retentionRate: 80,
      });

      const result = await tierSystem.checkAndPromote(tutorId);

      expect(result.promoted).toBe(false);
      expect(result.currentTier).toBe('gold');
      // Should NOT demote to silver
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      const tutorId = 'test-tutor-123';

      mockSupabase.from().select.mockReturnValueOnce({
        eq: jest.fn().mockReturnValueOnce({
          eq: jest.fn().mockRejectedValueOnce(
            new Error('Database connection failed')
          ),
        }),
      });

      await expect(tierSystem.getTutorStats(tutorId)).rejects.toThrow(
        'Database connection failed'
      );
    });

    it('should handle invalid tier names', () => {
      expect(() => tierSystem.getTierBenefits('invalid' as any)).toThrow(
        'Invalid tier: invalid'
      );
    });
  });
}); 