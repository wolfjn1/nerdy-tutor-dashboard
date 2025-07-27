import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

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

    // Check if user is an admin
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'date';

    // Build query
    let query = supabase
      .from('tutor_bonuses')
      .select(`
        *,
        profiles!tutor_id (
          full_name,
          email
        ),
        tutor_tiers!tutor_id (
          current_tier
        )
      `);

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    // Apply search
    if (search) {
      query = query.or(`profiles.full_name.ilike.%${search}%,profiles.email.ilike.%${search}%`);
    }

    // Apply sorting
    if (sort === 'amount') {
      query = query.order('amount', { ascending: false });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // Execute query
    const { data: bonuses, error: bonusError } = await query.limit(100);

    if (bonusError) {
      console.error('Error fetching bonuses:', bonusError);
      return NextResponse.json(
        { error: 'Failed to fetch bonuses' },
        { status: 500 }
      );
    }

    // Transform data
    const transformedBonuses = bonuses?.map(bonus => ({
      ...bonus,
      tutor_name: bonus.profiles?.full_name || 'Unknown',
      tutor_email: bonus.profiles?.email || 'Unknown',
      tutor_tier: bonus.tutor_tiers?.current_tier || 'standard',
    })) || [];

    // Get statistics
    const stats = await getBonusStatistics(supabase);

    return NextResponse.json({
      bonuses: transformedBonuses,
      stats,
    });
  } catch (error) {
    console.error('Error in admin bonuses GET:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    // Check if user is an admin
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, bonusIds, reason, paymentReference } = body;

    if (!action || !bonusIds || !Array.isArray(bonusIds) || bonusIds.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request parameters' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'approve':
        updateData = {
          status: 'approved',
          approved_at: new Date().toISOString(),
        };
        break;

      case 'reject':
        // First get the existing bonus to merge metadata
        const { data: existingBonus } = await supabase
          .from('tutor_bonuses')
          .select('metadata')
          .eq('id', bonusIds[0])
          .single();
        
        updateData = {
          status: 'cancelled',
          metadata: {
            ...(existingBonus?.metadata || {}),
            rejection_reason: reason,
            rejected_at: new Date().toISOString(),
            rejected_by: user.id,
          },
        };
        break;

      case 'pay':
        updateData = {
          status: 'paid',
          paid_at: new Date().toISOString(),
          payment_reference: paymentReference,
        };
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    // Update bonuses
    const { data, error } = await supabase
      .from('tutor_bonuses')
      .update(updateData)
      .in('id', bonusIds)
      .eq('status', action === 'approve' ? 'pending' : action === 'pay' ? 'approved' : 'pending')
      .select();

    if (error) {
      console.error('Error updating bonuses:', error);
      return NextResponse.json(
        { error: 'Failed to update bonuses' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      updated: data?.length || 0,
    });
  } catch (error) {
    console.error('Error in admin bonuses POST:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function getBonusStatistics(supabase: any) {
  try {
    // Get pending stats
    const { data: pendingBonuses } = await supabase
      .from('tutor_bonuses')
      .select('amount')
      .eq('status', 'pending');
    
    const pendingCount = pendingBonuses?.length || 0;
    const pendingTotal = pendingBonuses?.reduce((sum: number, b: any) => sum + Number(b.amount), 0) || 0;

    // Get approved stats
    const { data: approvedBonuses } = await supabase
      .from('tutor_bonuses')
      .select('amount')
      .eq('status', 'approved');
    
    const approvedCount = approvedBonuses?.length || 0;
    const approvedTotal = approvedBonuses?.reduce((sum: number, b: any) => sum + Number(b.amount), 0) || 0;

    // Get paid stats
    const { data: paidBonuses } = await supabase
      .from('tutor_bonuses')
      .select('amount')
      .eq('status', 'paid');
    
    const paidCount = paidBonuses?.length || 0;
    const paidTotal = paidBonuses?.reduce((sum: number, b: any) => sum + Number(b.amount), 0) || 0;

    // Get this month's total
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: thisMonthBonuses } = await supabase
      .from('tutor_bonuses')
      .select('amount')
      .gte('created_at', startOfMonth.toISOString());
    
    const thisMonthTotal = thisMonthBonuses?.reduce((sum: number, b: any) => sum + Number(b.amount), 0) || 0;

    // Get last month's total
    const startOfLastMonth = new Date();
    startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
    startOfLastMonth.setDate(1);
    startOfLastMonth.setHours(0, 0, 0, 0);
    
    const endOfLastMonth = new Date(startOfMonth);
    endOfLastMonth.setMilliseconds(-1);

    const { data: lastMonthBonuses } = await supabase
      .from('tutor_bonuses')
      .select('amount')
      .gte('created_at', startOfLastMonth.toISOString())
      .lte('created_at', endOfLastMonth.toISOString());
    
    const lastMonthTotal = lastMonthBonuses?.reduce((sum: number, b: any) => sum + Number(b.amount), 0) || 0;

    return {
      pendingCount,
      pendingTotal,
      approvedCount,
      approvedTotal,
      paidCount,
      paidTotal,
      thisMonthTotal,
      lastMonthTotal,
    };
  } catch (error) {
    console.error('Error getting bonus statistics:', error);
    return {
      pendingCount: 0,
      pendingTotal: 0,
      approvedCount: 0,
      approvedTotal: 0,
      paidCount: 0,
      paidTotal: 0,
      thisMonthTotal: 0,
      lastMonthTotal: 0,
    };
  }
} 