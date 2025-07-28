import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BonusCalculator } from '@/lib/gamification/BonusCalculator';

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

    // Check if user is a tutor by looking up in tutors table
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('id')
      .eq('auth_user_id', user.id)
      .single();
    
    if (tutorError || !tutor) {
      return NextResponse.json(
        { error: 'Only tutors can view bonus summary' },
        { status: 403 }
      );
    }

    const bonusCalculator = new BonusCalculator();
    const summary = await bonusCalculator.getBonusSummary(user.id);

    // Get recent bonuses
    const { data: recentBonuses, error: bonusError } = await supabase
      .from('tutor_bonuses')
      .select('*')
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10);

    if (bonusError) {
      console.error('Error fetching recent bonuses:', bonusError);
    }

    return NextResponse.json({
      summary,
      recentBonuses: recentBonuses || [],
    });
  } catch (error) {
    console.error('Error getting bonus summary:', error);
    return NextResponse.json(
      { error: 'Failed to get bonus summary' },
      { status: 500 }
    );
  }
} 