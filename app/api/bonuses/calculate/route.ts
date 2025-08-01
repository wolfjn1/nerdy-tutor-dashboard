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

    // Check if user is a tutor by looking up in tutors table
    let { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    // If no tutor record exists, create one
    if (tutorError && tutorError.code === 'PGRST116') {
      // Create a basic tutor record
      const { data: newTutor, error: createError } = await supabase
        .from('tutors')
        .insert({
          auth_user_id: user.id,
          email: user.email || '',
          first_name: user.user_metadata?.first_name || 'New',
          last_name: user.user_metadata?.last_name || 'Tutor',
          subjects: [],
          hourly_rate: 50,
          availability: {},
          rating: 0,
          total_earnings: 0
        })
        .select('id')
        .single();
      
      if (createError) {
        console.error('Error creating tutor record:', createError);
        return NextResponse.json(
          { error: 'Unable to create tutor profile' },
          { status: 500 }
        );
      }
      
      tutor = newTutor;
    } else if (tutorError) {
      return NextResponse.json(
        { error: 'Error checking tutor status' },
        { status: 500 }
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