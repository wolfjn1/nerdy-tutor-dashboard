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