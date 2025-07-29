'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { TrendingUp, Award, Star } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface PointsDisplayProps {
  tutorId: string;
}

interface PointsData {
  totalPoints: number;
  level: string;
  recentTransactions: Array<{
    id: string;
    points: number;
    reason: string;
    created_at: string;
  }>;
}

export default function PointsDisplay({ tutorId }: PointsDisplayProps) {
  const [pointsData, setPointsData] = useState<PointsData>({
    totalPoints: 0,
    level: 'Beginner',
    recentTransactions: []
  });
  const [loading, setLoading] = useState(true);

  // Debug logging
  console.log('[PointsDisplay] Rendering with tutorId:', tutorId);

  useEffect(() => {
    if (!tutorId) {
      console.error('[PointsDisplay] No tutorId provided!');
      setLoading(false);
      return;
    }
    console.log('[PointsDisplay] useEffect triggered, fetching data for tutorId:', tutorId);
    fetchPointsData();
  }, [tutorId]);

  const fetchPointsData = async () => {
    try {
      console.log('[PointsDisplay] Starting fetchPointsData for tutorId:', tutorId);
      const supabase = createClient();
      
      // Fetch total points
      const { data: points, error: pointsError } = await supabase
        .from('gamification_points')
        .select('points')
        .eq('tutor_id', tutorId);

      console.log('[PointsDisplay] Points query result:', { points, pointsError });

      if (pointsError) throw pointsError;

      const totalPoints = points?.reduce((sum, p) => sum + p.points, 0) || 0;

      // Fetch recent transactions
      const { data: recent, error: recentError } = await supabase
        .from('gamification_points')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false })
        .limit(5);

      console.log('[PointsDisplay] Recent transactions:', { recent, recentError });

      if (recentError) throw recentError;

      // Calculate level
      const level = calculateLevel(totalPoints);

      console.log('[PointsDisplay] Setting state:', { totalPoints, level, transactions: recent?.length });

      setPointsData({
        totalPoints,
        level,
        recentTransactions: recent || []
      });
    } catch (error) {
      console.error('[PointsDisplay] Error fetching points data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateLevel = (points: number): string => {
    if (points >= 10001) return 'Master';
    if (points >= 5001) return 'Expert';
    if (points >= 2001) return 'Advanced';
    if (points >= 501) return 'Proficient';
    return 'Beginner';
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Master':
        return <Star className="w-6 h-6 text-purple-500" />;
      case 'Expert':
        return <Star className="w-6 h-6 text-yellow-500" />;
      case 'Advanced':
        return <Award className="w-6 h-6 text-blue-500" />;
      case 'Proficient':
        return <Award className="w-6 h-6 text-green-500" />;
      default:
        return <Award className="w-6 h-6 text-gray-500" />;
    }
  };

  const formatReason = (reason: string): string => {
    return reason
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Points
        </h2>
        <TrendingUp className="w-5 h-5 text-green-500" />
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="text-4xl font-bold text-gray-900 dark:text-white">
            {pointsData.totalPoints.toLocaleString()}
          </div>
          {getLevelIcon(pointsData.level)}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Level: <span className="font-semibold">{pointsData.level}</span>
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Recent Activity
        </h3>
        {pointsData.recentTransactions.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No points earned yet. Complete sessions to start earning!
          </p>
        ) : (
          <div className="space-y-2">
            {pointsData.recentTransactions.map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {formatReason(transaction.reason)}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(transaction.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                  +{transaction.points}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
} 