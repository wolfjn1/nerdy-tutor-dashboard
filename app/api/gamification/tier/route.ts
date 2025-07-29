import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { TierSystem } from '@/lib/gamification/TierSystem';

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

    return NextResponse.json({
      tierProgress: progress,
    });
  } catch (error) {
    console.error('Error getting tier data:', error);
    return NextResponse.json(
      { error: 'Failed to get tier data' },
      { status: 500 }
    );
  }
} 