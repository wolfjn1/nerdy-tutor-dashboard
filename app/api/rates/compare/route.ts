import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { RateAdjustmentService } from '@/lib/gamification/RateAdjustmentService';
import { TierSystem } from '@/lib/gamification/TierSystem';

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
        { error: 'Tutor access required' },
        { status: 403 }
      );
    }

    const rateService = new RateAdjustmentService(supabase);

    try {
      const comparison = await rateService.getRateComparison(user.id);

      return NextResponse.json({
        comparison,
      });
    } catch (error) {
      console.error('Error getting rate comparison:', error);
      return NextResponse.json(
        { error: 'Failed to get rate comparison' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in rate comparison POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 