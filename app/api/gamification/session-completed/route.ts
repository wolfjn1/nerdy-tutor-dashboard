import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { PointsTriggers } from '@/lib/gamification/PointsTriggers';

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
    const { sessionId, tutorId } = body;

    // Validate required fields
    if (!sessionId || !tutorId) {
      return NextResponse.json(
        { error: 'Missing required fields: sessionId and tutorId' },
        { status: 400 }
      );
    }

    // Verify the session exists and belongs to the tutor
    const { data: session, error: sessionError } = await supabase
      .from('tutoring_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('tutor_id', tutorId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json(
        { error: 'Session not found or does not belong to this tutor' },
        { status: 404 }
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
        { error: 'Forbidden: You can only complete your own sessions or be an admin' },
        { status: 403 }
      );
    }

    // Initialize points triggers
    const triggers = new PointsTriggers(supabase as any);
    
    // Award points for session completion
    const result = await triggers.onSessionCompleted(sessionId, tutorId);
    
    return NextResponse.json({
      success: true,
      message: 'Session completion processed',
      result
    });
  } catch (error) {
    console.error('Error processing session completion:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 