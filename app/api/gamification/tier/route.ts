import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TierSystem, TutorTier } from '@/lib/gamification/TierSystem';

export async function GET(request: NextRequest) {
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

    // Get tutor record
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    if (tutorError || !tutor) {
      return NextResponse.json(
        { error: 'Tutor not found' },
        { status: 404 }
      );
    }

    // Use TierSystem to get tier progress
    const tierSystem = new TierSystem();
    const progress = await tierSystem.getTierProgress(tutor.id);
    
    // Get tier benefits
    const benefits = tierSystem.getTierBenefits(progress.currentTier);
    
    // Calculate rate increases
    const tierRates: Record<TutorTier, number> = {
      standard: 0,
      silver: 5,
      gold: 10,
      elite: 15
    };
    
    // Enhance the progress object with additional properties
    const enhancedProgress = {
      ...progress,
      tierBenefits: benefits,
      currentRateIncrease: tierRates[progress.currentTier],
      nextTierRateIncrease: progress.nextTier ? tierRates[progress.nextTier] : undefined
    };

    return NextResponse.json({
      tierProgress: enhancedProgress,
    });
  } catch (error) {
    console.error('Error getting tier data:', error);
    return NextResponse.json(
      { error: 'Failed to get tier data' },
      { status: 500 }
    );
  }
} 