import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { GamificationEngine } from '@/lib/gamification/GamificationEngine';

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
    const { tutorId, reason, referenceId, metadata } = body;

    // Validate required fields
    if (!tutorId || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields: tutorId and reason' },
        { status: 400 }
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
        { error: 'Forbidden: You can only award points to yourself or be an admin' },
        { status: 403 }
      );
    }

    // Initialize gamification engine with type casting
    const engine = new GamificationEngine(supabase as any);
    
    // Award points
    await engine.awardPoints(tutorId, reason, referenceId, metadata);
    
    // Get updated stats
    const stats = await engine.getTutorStats(tutorId);
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error awarding points:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 