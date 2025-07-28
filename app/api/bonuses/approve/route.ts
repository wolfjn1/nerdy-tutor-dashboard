import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { BonusCalculator } from '@/lib/gamification/BonusCalculator';

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

    // Check if user is an admin
    const userRole = user.user_metadata?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { bonusId } = body;

    if (!bonusId) {
      return NextResponse.json(
        { error: 'Bonus ID is required' },
        { status: 400 }
      );
    }

    const bonusCalculator = new BonusCalculator();
    const bonus = await bonusCalculator.approveBonus(bonusId);

    return NextResponse.json({ bonus });
  } catch (error) {
    console.error('Error approving bonus:', error);
    return NextResponse.json(
      { error: 'Failed to approve bonus' },
      { status: 500 }
    );
  }
} 