import { NextRequest, NextResponse } from 'next/server';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const { status, amount, metadata } = body;

    if (!params.id) {
      return NextResponse.json(
        { error: 'Bonus ID is required' },
        { status: 400 }
      );
    }

    // Get existing bonus
    const { data: existingBonus, error: fetchError } = await supabase
      .from('tutor_bonuses')
      .select('*')
      .eq('id', params.id)
      .single();

    if (fetchError || !existingBonus) {
      return NextResponse.json(
        { error: 'Bonus not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: any = {};

    if (status) {
      updateData.status = status;
      
      if (status === 'approved') {
        updateData.approved_at = new Date().toISOString();
        updateData.approved_by = user.id;
      } else if (status === 'cancelled') {
        updateData.cancelled_at = new Date().toISOString();
        updateData.cancelled_by = user.id;
      }
    }

    if (amount !== undefined) {
      updateData.amount = amount;
    }

    if (metadata) {
      updateData.metadata = {
        ...(existingBonus.metadata || {}),
        ...metadata,
        last_updated_at: new Date().toISOString(),
        last_updated_by: user.id,
      };
    }

    // Update bonus
    const { data, error } = await supabase
      .from('tutor_bonuses')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bonus:', error);
      return NextResponse.json(
        { error: 'Failed to update bonus' },
        { status: 500 }
      );
    }

    // Log the update
    await supabase
      .from('bonus_audit_log')
      .insert({
        bonus_id: params.id,
        action: 'update',
        changes: updateData,
        performed_by: user.id,
        performed_at: new Date().toISOString(),
      });

    return NextResponse.json({
      bonus: data,
    });
  } catch (error) {
    console.error('Error in admin bonus PUT:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 