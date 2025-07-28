import { createClient } from '@/utils/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';

export type TutorTier = 'standard' | 'silver' | 'gold' | 'elite';

export interface TierCriteria {
  sessions: number;
  rating: number;
  retention: number;
}

export interface TutorStats {
  completedSessions: number;
  averageRating: number;
  retentionRate: number;
}

export interface TierProgress extends TutorStats {
  currentTier: TutorTier;
  nextTier: TutorTier | null;
  sessionsToNext?: number;
  ratingToNext?: number;
  retentionToNext?: number;
  sessionsProgress?: number;
  ratingProgress?: number;
  retentionProgress?: number;
  isCloseToPromotion?: boolean;
}

export interface TierCheckResult {
  promoted: boolean;
  currentTier?: TutorTier;
  previousTier?: TutorTier;
  newTier?: TutorTier;
  stats?: TutorStats;
}

const TIER_CRITERIA: Record<TutorTier, TierCriteria> = {
  standard: { sessions: 0, rating: 0, retention: 0 },
  silver: { sessions: 50, rating: 4.5, retention: 80 },
  gold: { sessions: 150, rating: 4.7, retention: 85 },
  elite: { sessions: 300, rating: 4.8, retention: 90 },
};

const TIER_RATE_INCREASES: Record<TutorTier, number> = {
  standard: 0,
  silver: 5,
  gold: 10,
  elite: 15,
};

const TIER_BENEFITS: Record<TutorTier, string[]> = {
  standard: [
    'Access to basic platform features',
    'Standard student matching',
  ],
  silver: [
    '5% base rate increase',
    'Priority in search results',
    'Silver badge on profile',
    'Access to advanced scheduling tools',
  ],
  gold: [
    '10% base rate increase',
    'Featured tutor badge',
    'Priority student matching',
    'Advanced analytics access',
    'Gold badge on profile',
  ],
  elite: [
    '15% base rate increase',
    'Access to specialized program',
    'Quarterly performance bonuses',
    'Professional development opportunities',
    'Elite badge on profile',
    'Dedicated support team',
  ],
};

const TIER_POINTS: Record<TutorTier, number> = {
  standard: 0,
  silver: 200,
  gold: 500,
  elite: 1000,
};

export class TierSystem {
  private supabase: SupabaseClient;

  constructor(supabaseClient?: SupabaseClient) {
    this.supabase = supabaseClient || createClient();
  }

  async calculateTier(stats: TutorStats): Promise<TutorTier> {
    const { completedSessions, averageRating, retentionRate } = stats;

    // Check tiers from highest to lowest
    if (
      completedSessions >= TIER_CRITERIA.elite.sessions &&
      averageRating >= TIER_CRITERIA.elite.rating &&
      retentionRate >= TIER_CRITERIA.elite.retention
    ) {
      return 'elite';
    }

    if (
      completedSessions >= TIER_CRITERIA.gold.sessions &&
      averageRating >= TIER_CRITERIA.gold.rating &&
      retentionRate >= TIER_CRITERIA.gold.retention
    ) {
      return 'gold';
    }

    if (
      completedSessions >= TIER_CRITERIA.silver.sessions &&
      averageRating >= TIER_CRITERIA.silver.rating &&
      retentionRate >= TIER_CRITERIA.silver.retention
    ) {
      return 'silver';
    }

    return 'standard';
  }

  async getTutorStats(tutorId: string): Promise<TutorStats> {
    try {
      // Get completed sessions count
      const { data: sessions, error: sessionsError } = await this.supabase
        .from('tutoring_sessions')
        .select('id, status')
        .eq('tutor_id', tutorId)
        .eq('status', 'completed');

      if (sessionsError) throw sessionsError;

      const completedSessions = sessions?.length || 0;

      // Get average rating
      const { data: reviews, error: reviewsError } = await this.supabase
        .from('session_reviews')
        .select('rating')
        .eq('tutor_id', tutorId);

      if (reviewsError) throw reviewsError;

      const averageRating = reviews && reviews.length > 0
        ? reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length
        : 0;

      // Calculate retention rate
      const { data: studentSessions, error: retentionError } = await this.supabase
        .from('tutoring_sessions')
        .select('student_id, created_at')
        .eq('tutor_id', tutorId)
        .eq('status', 'completed')
        .order('created_at', { ascending: true });

      if (retentionError) throw retentionError;

      const retentionRate = this.calculateRetentionRate(studentSessions || []);

      return {
        completedSessions,
        averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimals
        retentionRate: Math.round(retentionRate * 100) / 100,
      };
    } catch (error) {
      console.error('Error fetching tutor stats:', error);
      throw error;
    }
  }

  private calculateRetentionRate(sessions: Array<{ student_id: string; created_at: string }>): number {
    if (sessions.length === 0) return 0;

    const studentSessionMap = new Map<string, Date[]>();
    
    // Group sessions by student
    sessions.forEach(session => {
      const studentId = session.student_id;
      const sessionDate = new Date(session.created_at);
      
      if (!studentSessionMap.has(studentId)) {
        studentSessionMap.set(studentId, []);
      }
      studentSessionMap.get(studentId)!.push(sessionDate);
    });

    // Calculate retention: students with sessions spanning 3+ months
    let retainedStudents = 0;
    const threeMonthsMs = 90 * 24 * 60 * 60 * 1000;

    studentSessionMap.forEach(sessionDates => {
      if (sessionDates.length < 2) return;
      
      const firstSession = Math.min(...sessionDates.map(d => d.getTime()));
      const lastSession = Math.max(...sessionDates.map(d => d.getTime()));
      
      if (lastSession - firstSession >= threeMonthsMs) {
        retainedStudents++;
      }
    });

    const totalStudents = studentSessionMap.size;
    return totalStudents > 0 ? (retainedStudents / totalStudents) * 100 : 0;
  }

  async promoteTier(tutorId: string, newTier: TutorTier): Promise<void> {
    try {
      // Update tutor's tier
      const { error: tierError } = await this.supabase
        .from('tutor_tiers')
        .upsert({
          tutor_id: tutorId,
          current_tier: newTier,
          tier_started_at: new Date().toISOString(),
          last_evaluated_at: new Date().toISOString(),
        });

      if (tierError) throw tierError;

      // Award points for tier promotion
      const points = TIER_POINTS[newTier];
      if (points > 0) {
        const { error: pointsError } = await this.supabase
          .from('gamification_points')
          .insert({
            tutor_id: tutorId,
            points,
            reason: 'tier_promotion',
            metadata: { tier: newTier },
          });

        if (pointsError) throw pointsError;
      }

      // Award tier badge
      const { error: badgeError } = await this.supabase
        .from('tutor_badges')
        .upsert({
          tutor_id: tutorId,
          badge_type: `${newTier}_tier`,
          metadata: { tier: newTier },
        });

      if (badgeError) throw badgeError;
    } catch (error) {
      console.error('Error promoting tier:', error);
      throw error;
    }
  }

  calculateRateAdjustment(baseRate: number, tier: TutorTier): number {
    const increasePercentage = TIER_RATE_INCREASES[tier];
    return baseRate * (1 + increasePercentage / 100);
  }

  getTierBenefits(tier: TutorTier): string[] {
    if (!TIER_BENEFITS[tier]) {
      throw new Error(`Invalid tier: ${tier}`);
    }
    return TIER_BENEFITS[tier];
  }

  async checkAndPromote(tutorId: string): Promise<TierCheckResult> {
    try {
      // Get current tier
      const { data: currentTierData, error: tierError } = await this.supabase
        .from('tutor_tiers')
        .select('current_tier')
        .eq('tutor_id', tutorId)
        .single();

      if (tierError && tierError.code !== 'PGRST116') throw tierError;

      const currentTier = (currentTierData?.current_tier as TutorTier) || 'standard';

      // Get tutor stats
      const stats = await this.getTutorStats(tutorId);

      // Calculate eligible tier
      const eligibleTier = await this.calculateTier(stats);

      // Check if promotion is needed (never demote)
      const tierOrder: TutorTier[] = ['standard', 'silver', 'gold', 'elite'];
      const currentIndex = tierOrder.indexOf(currentTier);
      const eligibleIndex = tierOrder.indexOf(eligibleTier);

      if (eligibleIndex > currentIndex) {
        // Promote!
        await this.promoteTier(tutorId, eligibleTier);
        return {
          promoted: true,
          previousTier: currentTier,
          newTier: eligibleTier,
          stats,
        };
      }

      return {
        promoted: false,
        currentTier,
        stats,
      };
    } catch (error) {
      console.error('Error checking tier promotion:', error);
      throw error;
    }
  }

  async getTierProgress(tutorId: string): Promise<TierProgress> {
    try {
      const { data: currentTierData } = await this.supabase
        .from('tutor_tiers')
        .select('current_tier')
        .eq('tutor_id', tutorId)
        .single();

      const currentTier = (currentTierData?.current_tier as TutorTier) || 'standard';
      const stats = await this.getTutorStats(tutorId);

      // Determine next tier
      const tierOrder: TutorTier[] = ['standard', 'silver', 'gold', 'elite'];
      const currentIndex = tierOrder.indexOf(currentTier);
      const nextTier = currentIndex < tierOrder.length - 1 ? tierOrder[currentIndex + 1] : null;

      let progress: TierProgress = {
        ...stats,
        currentTier,
        nextTier,
      };

      if (nextTier) {
        const nextCriteria = TIER_CRITERIA[nextTier];
        
        // Calculate progress to next tier
        progress.sessionsToNext = Math.max(0, nextCriteria.sessions - stats.completedSessions);
        progress.ratingToNext = Math.max(0, nextCriteria.rating - stats.averageRating);
        progress.retentionToNext = Math.max(0, nextCriteria.retention - stats.retentionRate);

        // Calculate progress percentages
        const prevCriteria = TIER_CRITERIA[currentTier];
        
        progress.sessionsProgress = this.calculateProgress(
          stats.completedSessions,
          prevCriteria.sessions,
          nextCriteria.sessions
        );
        
        progress.ratingProgress = this.calculateProgress(
          stats.averageRating,
          prevCriteria.rating || 4.0, // Minimum rating baseline
          nextCriteria.rating
        );
        
        progress.retentionProgress = this.calculateProgress(
          stats.retentionRate,
          prevCriteria.retention || 0,
          nextCriteria.retention
        );

        // Check if close to promotion (90% or more on all criteria)
        progress.isCloseToPromotion = 
          progress.sessionsProgress >= 90 &&
          progress.ratingProgress >= 90 &&
          progress.retentionProgress >= 90;
      }

      return progress;
    } catch (error) {
      console.error('Error getting tier progress:', error);
      throw error;
    }
  }

  private calculateProgress(current: number, min: number, max: number): number {
    if (current >= max) return 100;
    if (current <= min) return 0;
    return Math.round(((current - min) / (max - min)) * 100);
  }
} 