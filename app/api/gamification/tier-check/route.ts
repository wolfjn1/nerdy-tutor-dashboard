import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
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

    // Check if user is a tutor
    const userRole = user.user_metadata?.role;
    if (userRole !== 'tutor') {
      return NextResponse.json(
        { error: 'Only tutors can access tier information' },
        { status: 403 }
      );
    }

    // Check and potentially promote tier
    const tierSystem = new TierSystem();
    const result = await tierSystem.checkAndPromote(user.id);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error checking tier:', error);
    return NextResponse.json(
      { error: 'Failed to check tier status' },
      { status: 500 }
    );
  }
}

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
        { error: 'Only tutors can access tier information' },
        { status: 403 }
      );
    }

    // Get tier progress
    const tierSystem = new TierSystem();
    const progress = await tierSystem.getTierProgress(user.id);

    return NextResponse.json({ progress });
  } catch (error) {
    console.error('Error getting tier progress:', error);
    return NextResponse.json(
      { error: 'Failed to get tier progress' },
      { status: 500 }
    );
  }
} 