import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { tutorId: string } }
) {
  try {
    const supabase = await createClient();
    const { tutorId } = params;

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if the user has permission (admin or the tutor themselves)
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (user.id !== tutorId && profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden: You can only view your own stats or be an admin' },
        { status: 403 }
      );
    }

    // Fetch gamification stats
    const [
      pointsResponse,
      badgesResponse,
      tierResponse,
      bonusesResponse
    ] = await Promise.all([
      // Total points
      supabase
        .from('gamification_points')
        .select('points')
        .eq('tutor_id', tutorId),
      
      // Badges
      supabase
        .from('tutor_badges')
        .select('*')
        .eq('tutor_id', tutorId),
      
      // Tier info
      supabase
        .from('tutor_tiers')
        .select('*')
        .eq('tutor_id', tutorId)
        .single(),
      
      // Bonus summary
      supabase
        .from('tutor_bonuses')
        .select('amount, status')
        .eq('tutor_id', tutorId)
    ]);

    // Calculate total points
    const totalPoints = pointsResponse.data?.reduce((sum, p) => sum + p.points, 0) || 0;

    // Calculate level
    const level = calculateLevel(totalPoints);

    // Calculate bonus totals
    let pendingBonuses = 0;
    let approvedBonuses = 0;
    let paidBonuses = 0;

    bonusesResponse.data?.forEach(bonus => {
      const amount = Number(bonus.amount);
      switch (bonus.status) {
        case 'pending':
          pendingBonuses += amount;
          break;
        case 'approved':
          approvedBonuses += amount;
          break;
        case 'paid':
          paidBonuses += amount;
          break;
      }
    });

    // Build response
    const stats = {
      totalPoints,
      level,
      badges: badgesResponse.data || [],
      badgeCount: badgesResponse.data?.length || 0,
      tier: {
        current: tierResponse.data?.current_tier || 'standard',
        totalSessions: tierResponse.data?.total_sessions || 0,
        averageRating: tierResponse.data?.average_rating || 0,
        retentionRate: tierResponse.data?.retention_rate || 0
      },
      bonuses: {
        pending: pendingBonuses,
        approved: approvedBonuses,
        paid: paidBonuses,
        total: pendingBonuses + approvedBonuses + paidBonuses
      },
      // Recent activity summary
      recentActivity: {
        lastPointsEarned: await getLastPointsEarned(supabase, tutorId),
        lastBadgeEarned: await getLastBadgeEarned(supabase, tutorId),
        currentStreak: await getCurrentStreak(supabase, tutorId)
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching gamification stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function calculateLevel(points: number): string {
  if (points >= 10001) return 'Master';
  if (points >= 5001) return 'Expert';
  if (points >= 2001) return 'Advanced';
  if (points >= 501) return 'Proficient';
  return 'Beginner';
}

async function getLastPointsEarned(supabase: any, tutorId: string) {
  const { data } = await supabase
    .from('gamification_points')
    .select('points, reason, created_at')
    .eq('tutor_id', tutorId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();
  
  return data || null;
}

async function getLastBadgeEarned(supabase: any, tutorId: string) {
  const { data } = await supabase
    .from('tutor_badges')
    .select('badge_type, earned_at')
    .eq('tutor_id', tutorId)
    .order('earned_at', { ascending: false })
    .limit(1)
    .single();
  
  return data || null;
}

async function getCurrentStreak(supabase: any, tutorId: string) {
  // This is a simplified streak calculation
  // In production, you'd want a more sophisticated approach
  const { data } = await supabase
    .from('tutoring_sessions')
    .select('session_date')
    .eq('tutor_id', tutorId)
    .eq('status', 'completed')
    .order('session_date', { ascending: false })
    .limit(30);
  
  if (!data || data.length === 0) return 0;
  
  // Count consecutive days with sessions
  let streak = 1;
  const dates = data.map((d: { session_date: string }) => new Date(d.session_date).toDateString());
  const uniqueDates: string[] = Array.from(new Set(dates));
  
  for (let i = 1; i < uniqueDates.length; i++) {
    const current = new Date(uniqueDates[i]);
    const previous = new Date(uniqueDates[i - 1]);
    const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
} 