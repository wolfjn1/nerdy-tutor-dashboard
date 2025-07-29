import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

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

    // Fetch earned badges
    const { data: earnedBadges, error: badgesError } = await supabase
      .from('tutor_badges')
      .select('*')
      .eq('tutor_id', tutor.id)
      .order('earned_at', { ascending: false });

    if (badgesError) {
      console.error('Error fetching badges:', badgesError);
      throw badgesError;
    }

    return NextResponse.json({
      badges: earnedBadges || [],
    });
  } catch (error) {
    console.error('Error getting badges data:', error);
    return NextResponse.json(
      { error: 'Failed to get badges data' },
      { status: 500 }
    );
  }
} 