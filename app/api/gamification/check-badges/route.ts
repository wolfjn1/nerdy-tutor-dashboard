import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BadgeManager } from '@/lib/gamification/BadgeManager';

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

    // Parse request body
    const body = await request.json();
    const { tutorId } = body;

    // Use the authenticated user's ID if no tutorId provided
    const targetTutorId = tutorId || user.id;

    // Check if the user has permission (admin or the tutor themselves)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (user.id !== targetTutorId && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: You can only check your own badges or be an admin' },
        { status: 403 }
      );
    }

    // Initialize badge manager
    const badgeManager = new BadgeManager(supabase as any);
    
    // Check and award badges
    const awardedBadges = await badgeManager.checkAndAwardBadges(targetTutorId);
    
    // Get badge progress
    const progress = await badgeManager.getBadgeProgress(targetTutorId);
    
    // Get all current badges
    const { data: currentBadges } = await supabase
      .from('tutor_badges')
      .select('*')
      .eq('tutor_id', targetTutorId)
      .order('earned_at', { ascending: false });
    
    return NextResponse.json({
      success: true,
      newBadges: awardedBadges,
      currentBadges: currentBadges || [],
      progress,
      message: awardedBadges.length > 0 
        ? `Congratulations! You earned ${awardedBadges.length} new badge(s)!` 
        : 'No new badges earned at this time.'
    });
  } catch (error) {
    console.error('Error checking badges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

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

    // Get tutorId from query params or use authenticated user
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId') || user.id;

    // Check permission
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (user.id !== tutorId && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own badges or be an admin' },
        { status: 403 }
      );
    }

    // Get current badges
    const { data: badges, error: badgesError } = await supabase
      .from('tutor_badges')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('earned_at', { ascending: false });

    if (badgesError) throw badgesError;

    // Get badge progress
    const badgeManager = new BadgeManager(supabase as any);
    const progress = await badgeManager.getBadgeProgress(tutorId);

    return NextResponse.json({
      badges: badges || [],
      progress,
      totalBadges: badges?.length || 0
    });
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 