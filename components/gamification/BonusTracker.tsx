'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { DollarSign, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface BonusTrackerProps {
  tutorId: string;
}

interface BonusData {
  pendingBonuses: number;
  approvedBonuses: number;
  paidBonuses: number;
  recentBonuses: Array<{
    id: string;
    type: string;
    amount: number;
    status: 'pending' | 'approved' | 'paid';
    created_at: string;
  }>;
  nextPayout?: string;
}

const bonusTypeLabels: Record<string, string> = {
  student_retention: 'Student Retention',
  session_milestone: 'Session Milestone',
  quality_bonus: '5-Star Review',
  referral_bonus: 'Student Referral',
  new_student_bonus: 'New Student',
  monthly_excellence: 'Monthly Excellence'
};

export default function BonusTracker({ tutorId }: BonusTrackerProps) {
  const [bonusData, setBonusData] = useState<BonusData>({
    pendingBonuses: 0,
    approvedBonuses: 0,
    paidBonuses: 0,
    recentBonuses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBonusData();
  }, [tutorId]);

  const fetchBonusData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch all bonuses for this tutor
      const { data: bonuses, error } = await supabase
        .from('tutor_bonuses')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Calculate totals by status
      let pending = 0;
      let approved = 0;
      let paid = 0;

      bonuses?.forEach(bonus => {
        switch (bonus.status) {
          case 'pending':
            pending += Number(bonus.amount);
            break;
          case 'approved':
            approved += Number(bonus.amount);
            break;
          case 'paid':
            paid += Number(bonus.amount);
            break;
        }
      });

      setBonusData({
        pendingBonuses: pending,
        approvedBonuses: approved,
        paidBonuses: paid,
        recentBonuses: bonuses?.slice(0, 5).map(b => ({
          id: b.id,
          type: b.bonus_type,
          amount: Number(b.amount),
          status: b.status,
          created_at: b.created_at
        })) || [],
        nextPayout: calculateNextPayout()
      });
    } catch (error) {
      console.error('Error fetching bonus data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateNextPayout = (): string => {
    // Calculate next Friday
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7 || 7;
    const nextFriday = new Date(today);
    nextFriday.setDate(today.getDate() + daysUntilFriday);
    return nextFriday.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'approved':
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 dark:text-yellow-400 dark:bg-yellow-900/20';
      case 'approved':
        return 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20';
      case 'paid':
        return 'text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  const totalEarnings = bonusData.pendingBonuses + bonusData.approvedBonuses + bonusData.paidBonuses;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Bonus Tracker
        </h2>
        <DollarSign className="w-5 h-5 text-green-500" />
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
            ${bonusData.pendingBonuses.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Approved</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            ${bonusData.approvedBonuses.toFixed(2)}
          </p>
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            ${bonusData.paidBonuses.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Total Earnings */}
      <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Bonus Earnings</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${totalEarnings.toFixed(2)}
            </p>
          </div>
          {bonusData.nextPayout && bonusData.approvedBonuses > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-600 dark:text-gray-400">Next payout</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {bonusData.nextPayout}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Bonuses */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Recent Bonuses
        </h3>
        {bonusData.recentBonuses.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
            No bonuses earned yet. Keep up the great work!
          </p>
        ) : (
          <div className="space-y-2">
            {bonusData.recentBonuses.map((bonus) => (
              <div
                key={bonus.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(bonus.status)}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {bonusTypeLabels[bonus.type] || bonus.type}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(bonus.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${bonus.amount.toFixed(2)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(bonus.status)}`}>
                    {bonus.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bonus Information */}
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-xs text-blue-800 dark:text-blue-300">
          💡 Earn bonuses by maintaining student retention, completing session milestones, 
          receiving 5-star reviews, and referring new students!
        </p>
      </div>
    </Card>
  );
} 