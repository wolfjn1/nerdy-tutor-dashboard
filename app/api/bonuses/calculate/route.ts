import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BonusCalculator } from '@/lib/gamification/BonusCalculator';
import { TierSystem } from '@/lib/gamification/TierSystem';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is a tutor
    const userRole = user.user_metadata?.role;
    if (userRole !== 'tutor') {
      return NextResponse.json(
        { error: 'Only tutors can calculate bonuses' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { type, ...params } = body;

    const bonusCalculator = new BonusCalculator();
    let bonusCalculation;

    // Calculate bonus based on type
    switch (type) {
      case 'retention':
        bonusCalculation = await bonusCalculator.calculateRetentionBonus(
          user.id,
          params.studentId,
          params.monthsRetained
        );
        break;

      case 'milestone':
        bonusCalculation = await bonusCalculator.calculateMilestoneBonus(
          user.id,
          params.completedSessions
        );
        break;

      case 'review':
        bonusCalculation = await bonusCalculator.calculateReviewBonus(
          user.id,
          params.reviewId,
          params.rating
        );
        break;

      case 'referral':
        bonusCalculation = await bonusCalculator.calculateReferralBonus(
          user.id,
          params.referredStudentId,
          params.sessionsCompleted
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid bonus type' },
          { status: 400 }
        );
    }

    // Apply tier multiplier if bonus amount > 0
    let finalAmount = bonusCalculation.amount;
    if (finalAmount > 0) {
      // Get current tier
      const tierSystem = new TierSystem();
      const tierProgress = await tierSystem.getTierProgress(user.id);
      finalAmount = bonusCalculator.applyTierMultiplier(
        bonusCalculation.amount,
        tierProgress.currentTier
      );
    }

    // Record bonus if amount > 0 and not duplicate
    let recorded = false;
    if (finalAmount > 0 && !bonusCalculation.isDuplicate) {
      const bonus = await bonusCalculator.recordBonus({
        tutor_id: user.id,
        bonus_type: bonusCalculation.type,
        amount: finalAmount,
        reference_id: params.studentId || params.reviewId || params.referredStudentId,
        reference_type: type === 'retention' ? 'student' : 
                       type === 'review' ? 'review' : 
                       type === 'referral' ? 'student' : 'session',
        status: 'pending',
        metadata: {
          ...bonusCalculation.metadata,
          baseAmount: bonusCalculation.amount,
          appliedMultiplier: finalAmount / bonusCalculation.amount,
        },
      });
      recorded = true;
    }

    return NextResponse.json({
      bonus: {
        ...bonusCalculation,
        amount: finalAmount,
      },
      recorded,
    });
  } catch (error) {
    console.error('Error calculating bonus:', error);
    return NextResponse.json(
      { error: 'Failed to calculate bonus' },
      { status: 500 }
    );
  }
} 