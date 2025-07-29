import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return NextResponse.json({
        error: 'Auth error',
        details: authError.message,
        authError
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({
        error: 'No authenticated user',
        user: null
      }, { status: 401 });
    }
    
    // Try to find the tutor record
    const { data: tutor, error: tutorError } = await supabase
      .from('tutors')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();
    
    // Also try by email
    const { data: tutorByEmail, error: tutorByEmailError } = await supabase
      .from('tutors')
      .select('*')
      .eq('email', user.email || '')
      .single();
    
    // Try to access bonuses
    const { data: bonuses, error: bonusError } = await supabase
      .from('tutor_bonuses')
      .select('*')
      .eq('tutor_id', tutor?.id || tutorByEmail?.id || 'none')
      .limit(5);
    
    return NextResponse.json({
      debug: true,
      user: {
        id: user.id,
        email: user.email,
        metadata: user.user_metadata
      },
      tutor: {
        byAuthId: tutor,
        byEmail: tutorByEmail,
        tutorError,
        tutorByEmailError
      },
      bonuses: {
        data: bonuses,
        error: bonusError
      },
      checks: {
        hasUser: !!user,
        hasTutorByAuthId: !!tutor,
        hasTutorByEmail: !!tutorByEmail,
        tutorIdUsed: tutor?.id || tutorByEmail?.id || 'none',
        canAccessBonuses: !bonusError && bonuses !== null
      }
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 