'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { TrendingUp, Award, Star, AlertCircle } from 'lucide-react';
import { usePoints } from '@/lib/hooks/usePoints';

interface PointsDisplayProps {
  tutorId: string;
}

export default function PointsDisplay({ tutorId }: PointsDisplayProps) {
  // Now using API route instead of direct Supabase queries
  const { pointsData, loading, error } = usePoints();

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

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-3 text-red-600">
          <AlertCircle className="w-5 h-5" />
          <div>
            <p className="font-medium">Failed to load points</p>
            <p className="text-sm text-red-500">{error}</p>
          </div>
        </div>
      </Card>
    );
  }

  if (!pointsData) {
    return null;
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