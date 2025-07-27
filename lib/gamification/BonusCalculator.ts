import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TutorTier } from './TierSystem';

export type BonusType = 'student_retention' | 'session_milestone' | 'five_star_review' | 'student_referral';
export type BonusStatus = 'pending' | 'approved' | 'paid' | 'cancelled';

export interface BonusCalculation {
  amount: number;
  type: BonusType;
  isDuplicate?: boolean;
  metadata?: Record<string, any>;
}

export interface Bonus {
  id?: string;
  tutor_id: string;
  bonus_type: BonusType;
  amount: number;
  reference_id?: string;
  reference_type?: string;
  status: BonusStatus;
  metadata?: Record<string, any>;
  created_at?: string;
  approved_at?: string;
  paid_at?: string;
  payment_reference?: string;
}

export interface BonusSummary {
  pendingTotal: number;
  pendingCount: number;
  approvedTotal: number;
  approvedCount: number;
  paidTotal: number;
  paidThisMonth: number;
  lifetimeEarnings?: number;
}

const BONUS_AMOUNTS = {
  retention_per_month: 10,
  milestone_per_5_sessions: 25,
  five_star_review: 5,
  referral_completion: 50,
};

const TIER_MULTIPLIERS: Record<TutorTier, number> = {
  standard: 1.0,
  silver: 1.1,
  gold: 1.2,
  elite: 1.5,
};

export class BonusCalculator {
  private supabase: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClientComponentClient();
  }

  async calculateRetentionBonus(
    tutorId: string,
    studentId: string,
    monthsRetained: number
  ): Promise<BonusCalculation> {
    // Only pay bonus for months beyond month 3
    const bonusMonths = Math.max(0, monthsRetained - 3);
    
    if (bonusMonths === 0) {
      return {
        amount: 0,
        type: 'student_retention',
        metadata: { monthsRetained, bonusMonths: 0 },
      };
    }

    // Check for existing retention bonus for this period
    const isDuplicate = await this.checkDuplicateRetentionBonus(tutorId, studentId, monthsRetained);
    
    if (isDuplicate) {
      return {
        amount: 0,
        type: 'student_retention',
        isDuplicate: true,
        metadata: { reason: 'Bonus already claimed for this period' },
      };
    }

    const amount = bonusMonths * BONUS_AMOUNTS.retention_per_month;

    return {
      amount,
      type: 'student_retention',
      metadata: {
        monthsRetained,
        bonusMonths,
        studentId,
      },
    };
  }

  async calculateMilestoneBonus(
    tutorId: string,
    completedSessions: number
  ): Promise<BonusCalculation> {
    const milestonesAchieved = Math.floor(completedSessions / 5);
    
    if (milestonesAchieved === 0) {
      return {
        amount: 0,
        type: 'session_milestone',
        metadata: { milestonesAchieved: 0 },
      };
    }

    // Check which milestones have already been paid
    const paidMilestones = await this.getPaidMilestones(tutorId);
    const newMilestones = [];
    
    for (let i = 1; i <= milestonesAchieved; i++) {
      const milestone = i * 5;
      if (!paidMilestones.includes(milestone)) {
        newMilestones.push(milestone);
      }
    }

    const amount = newMilestones.length * BONUS_AMOUNTS.milestone_per_5_sessions;

    return {
      amount,
      type: 'session_milestone',
      metadata: {
        milestonesAchieved: newMilestones.length,
        newMilestones,
        totalSessions: completedSessions,
      },
    };
  }

  async calculateReviewBonus(
    tutorId: string,
    reviewId: string,
    rating: number
  ): Promise<BonusCalculation> {
    if (rating < 5) {
      return {
        amount: 0,
        type: 'five_star_review',
        metadata: { rating, reason: 'Only 5-star reviews qualify' },
      };
    }

    // Check for duplicate review bonus
    const isDuplicate = await this.checkDuplicateReviewBonus(tutorId, reviewId);
    
    if (isDuplicate) {
      return {
        amount: 0,
        type: 'five_star_review',
        isDuplicate: true,
        metadata: { reason: 'Bonus already claimed for this review' },
      };
    }

    return {
      amount: BONUS_AMOUNTS.five_star_review,
      type: 'five_star_review',
      metadata: { reviewId, rating },
    };
  }

  async calculateReferralBonus(
    tutorId: string,
    referredStudentId: string,
    sessionsCompleted: number
  ): Promise<BonusCalculation> {
    if (sessionsCompleted < 5) {
      return {
        amount: 0,
        type: 'student_referral',
        metadata: { 
          sessionsCompleted,
          reason: 'Minimum 5 sessions required',
        },
      };
    }

    // Check for duplicate referral bonus
    const isDuplicate = await this.checkDuplicateReferralBonus(tutorId, referredStudentId);
    
    if (isDuplicate) {
      return {
        amount: 0,
        type: 'student_referral',
        isDuplicate: true,
        metadata: { reason: 'Referral bonus already claimed' },
      };
    }

    return {
      amount: BONUS_AMOUNTS.referral_completion,
      type: 'student_referral',
      metadata: { 
        referredStudentId,
        sessionsCompleted,
      },
    };
  }

  async recordBonus(bonus: Omit<Bonus, 'id' | 'created_at'>): Promise<Bonus> {
    try {
      const { data, error } = await this.supabase
        .from('tutor_bonuses')
        .insert(bonus)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error recording bonus:', error);
      throw error;
    }
  }

  async approveBonus(bonusId: string): Promise<Bonus> {
    try {
      const { data, error } = await this.supabase
        .from('tutor_bonuses')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
        })
        .eq('id', bonusId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error approving bonus:', error);
      throw error;
    }
  }

  async markBonusAsPaid(bonusId: string, paymentReference: string): Promise<Bonus> {
    try {
      const { data, error } = await this.supabase
        .from('tutor_bonuses')
        .update({
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_reference: paymentReference,
        })
        .eq('id', bonusId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error marking bonus as paid:', error);
      throw error;
    }
  }

  async getBonusSummary(tutorId: string): Promise<BonusSummary> {
    try {
      // Get pending bonuses
      const { data: pendingBonuses } = await this.supabase
        .from('tutor_bonuses')
        .select('amount')
        .eq('tutor_id', tutorId)
        .eq('status', 'pending');

      // Get approved bonuses
      const { data: approvedBonuses } = await this.supabase
        .from('tutor_bonuses')
        .select('amount')
        .eq('tutor_id', tutorId)
        .eq('status', 'approved');

      // Get paid bonuses this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: paidThisMonth } = await this.supabase
        .from('tutor_bonuses')
        .select('amount')
        .eq('tutor_id', tutorId)
        .eq('status', 'paid')
        .gte('paid_at', startOfMonth.toISOString());

      // Calculate totals
      const pendingTotal = (pendingBonuses || []).reduce((sum: number, b: any) => sum + b.amount, 0);
      const approvedTotal = (approvedBonuses || []).reduce((sum: number, b: any) => sum + b.amount, 0);
      const paidThisMonthTotal = (paidThisMonth || []).reduce((sum: number, b: any) => sum + b.amount, 0);

      // Get all paid bonuses for lifetime earnings
      const { data: allPaidBonuses } = await this.supabase
        .from('tutor_bonuses')
        .select('amount')
        .eq('tutor_id', tutorId)
        .eq('status', 'paid');

      const paidTotal = (allPaidBonuses || []).reduce((sum: number, b: any) => sum + b.amount, 0);

      return {
        pendingTotal,
        pendingCount: (pendingBonuses || []).length,
        approvedTotal,
        approvedCount: (approvedBonuses || []).length,
        paidTotal,
        paidThisMonth: paidThisMonthTotal,
        lifetimeEarnings: pendingTotal + approvedTotal + paidTotal,
      };
    } catch (error) {
      console.error('Error getting bonus summary:', error);
      throw error;
    }
  }

  applyTierMultiplier(baseAmount: number, tier: TutorTier): number {
    const multiplier = TIER_MULTIPLIERS[tier] || 1.0;
    return Math.round(baseAmount * multiplier * 100) / 100; // Round to 2 decimals
  }

  // Private helper methods
  private async checkDuplicateRetentionBonus(
    tutorId: string,
    studentId: string,
    monthsRetained: number
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('tutor_bonuses')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('reference_id', studentId)
      .eq('bonus_type', 'student_retention')
      .gte('metadata->>monthsRetained', monthsRetained);

    return (data && data.length > 0) || false;
  }

  private async checkDuplicateReviewBonus(
    tutorId: string,
    reviewId: string
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('tutor_bonuses')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('reference_id', reviewId);

    return (data && data.length > 0) || false;
  }

  private async checkDuplicateReferralBonus(
    tutorId: string,
    referredStudentId: string
  ): Promise<boolean> {
    const { data } = await this.supabase
      .from('tutor_bonuses')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('reference_id', referredStudentId)
      .eq('bonus_type', 'student_referral');

    return (data && data.length > 0) || false;
  }

  private async getPaidMilestones(tutorId: string): Promise<number[]> {
    const { data } = await this.supabase
      .from('tutor_bonuses')
      .select('metadata')
      .eq('tutor_id', tutorId)
      .eq('bonus_type', 'session_milestone');

    if (!data) return [];

    const milestones: number[] = [];
    data.forEach((bonus: any) => {
      if (bonus.metadata?.milestone) {
        milestones.push(bonus.metadata.milestone);
      }
      if (bonus.metadata?.newMilestones) {
        milestones.push(...bonus.metadata.newMilestones);
      }
    });

    return milestones;
  }
} 