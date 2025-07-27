import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { RateAdjustmentService } from '@/lib/gamification/RateAdjustmentService';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
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

    // Get current rate
    const rate = await rateService.getCurrentRate(user.id);

    // Get rate history
    const history = await rateService.getRateHistory(user.id);

    // Get tutor's tier
    const { data: tierData } = await supabase
      .from('tutor_tiers')
      .select('current_tier')
      .eq('tutor_id', user.id)
      .single();

    return NextResponse.json({
      rate,
      history,
      tier: tierData?.current_tier || 'standard',
    });
  } catch (error) {
    console.error('Error in rates GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rate information' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = createServerComponentClient({ cookies });
    
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

    const body = await request.json();
    const { baseRate, customAdjustment } = body;

    if (baseRate === undefined && customAdjustment === undefined) {
      return NextResponse.json(
        { error: 'Either baseRate or customAdjustment is required' },
        { status: 400 }
      );
    }

    const rateService = new RateAdjustmentService(supabase);
    let updatedRate;

    try {
      if (baseRate !== undefined) {
        updatedRate = await rateService.updateBaseRate(user.id, baseRate);
      } else if (customAdjustment !== undefined) {
        updatedRate = await rateService.applyCustomAdjustment(user.id, customAdjustment);
      }

      return NextResponse.json({
        rate: updatedRate,
      });
    } catch (validationError: any) {
      // Handle validation errors (rate limits, adjustment limits)
      return NextResponse.json(
        { error: validationError.message },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error in rates PUT:', error);
    return NextResponse.json(
      { error: 'Failed to update rate' },
      { status: 500 }
    );
  }
} 