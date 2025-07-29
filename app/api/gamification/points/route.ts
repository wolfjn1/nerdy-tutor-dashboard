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

    // Fetch all points
    const { data: allPoints, error: pointsError } = await supabase
      .from('gamification_points')
      .select('points')
      .eq('tutor_id', tutor.id);

    if (pointsError) {
      console.error('Error fetching points:', pointsError);
      throw pointsError;
    }

    // Calculate total
    const totalPoints = allPoints?.reduce((sum, p) => sum + p.points, 0) || 0;

    // Fetch recent transactions
    const { data: recentTransactions, error: recentError } = await supabase
      .from('gamification_points')
      .select('*')
      .eq('tutor_id', tutor.id)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentError) {
      console.error('Error fetching recent transactions:', recentError);
      throw recentError;
    }

    // Calculate level based on total points
    const calculateLevel = (points: number): string => {
      if (points >= 10001) return 'Master';
      if (points >= 5001) return 'Expert';
      if (points >= 2001) return 'Advanced';
      if (points >= 501) return 'Proficient';
      return 'Beginner';
    };

    return NextResponse.json({
      totalPoints,
      level: calculateLevel(totalPoints),
      recentTransactions: recentTransactions || [],
    });
  } catch (error) {
    console.error('Error getting points data:', error);
    return NextResponse.json(
      { error: 'Failed to get points data' },
      { status: 500 }
    );
  }
} 