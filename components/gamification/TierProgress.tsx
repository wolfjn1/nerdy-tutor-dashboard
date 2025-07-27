'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { Trophy, TrendingUp, Star, Crown } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface TierProgressProps {
  tutorId: string;
}

interface TierData {
  currentTier: 'standard' | 'silver' | 'gold' | 'elite';
  totalSessions: number;
  averageRating: number;
  retentionRate: number;
  tierStartedAt: string;
  nextTierRequirements: {
    sessions: number;
    rating: number;
    retention: number;
  };
}

const tierConfigs = {
  standard: {
    name: 'Standard',
    color: 'gray',
    icon: Trophy,
    benefits: 'Base rate',
    next: 'silver' as const,
    requirements: { sessions: 50, rating: 4.5, retention: 80 }
  },
  silver: {
    name: 'Silver',
    color: 'gray',
    icon: Star,
    benefits: '5% rate increase',
    next: 'gold' as const,
    requirements: { sessions: 150, rating: 4.7, retention: 85 }
  },
  gold: {
    name: 'Gold',
    color: 'yellow',
    icon: Crown,
    benefits: '10% rate increase',
    next: 'elite' as const,
    requirements: { sessions: 300, rating: 4.8, retention: 90 }
  },
  elite: {
    name: 'Elite',
    color: 'purple',
    icon: Crown,
    benefits: '15% rate increase + specialized program',
    next: null,
    requirements: { sessions: 0, rating: 0, retention: 0 }
  }
};

export default function TierProgress({ tutorId }: TierProgressProps) {
  const [tierData, setTierData] = useState<TierData>({
    currentTier: 'standard',
    totalSessions: 0,
    averageRating: 0,
    retentionRate: 0,
    tierStartedAt: new Date().toISOString(),
    nextTierRequirements: tierConfigs.standard.requirements
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTierData();
  }, [tutorId]);

  const fetchTierData = async () => {
    try {
      const supabase = createClient();
      
      // Fetch tier data
      const { data: tierInfo, error: tierError } = await supabase
        .from('tutor_tiers')
        .select('*')
        .eq('tutor_id', tutorId)
        .single();

      if (tierError && tierError.code !== 'PGRST116') throw tierError;

      const currentTier = tierInfo?.current_tier || 'standard';
      const config = tierConfigs[currentTier as keyof typeof tierConfigs];
      
      setTierData({
        currentTier: currentTier as TierData['currentTier'],
        totalSessions: tierInfo?.total_sessions || 0,
        averageRating: tierInfo?.average_rating || 0,
        retentionRate: tierInfo?.retention_rate || 0,
        tierStartedAt: tierInfo?.tier_started_at || new Date().toISOString(),
        nextTierRequirements: config.next ? tierConfigs[config.next].requirements : { sessions: 0, rating: 0, retention: 0 }
      });
    } catch (error) {
      console.error('Error fetching tier data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateProgress = () => {
    if (tierData.currentTier === 'elite') return 100;

    const requirements = tierData.nextTierRequirements;
    const sessionProgress = Math.min((tierData.totalSessions / requirements.sessions) * 100, 100);
    const ratingProgress = Math.min((tierData.averageRating / requirements.rating) * 100, 100);
    const retentionProgress = Math.min((tierData.retentionRate / requirements.retention) * 100, 100);

    return Math.floor((sessionProgress + ratingProgress + retentionProgress) / 3);
  };

  const getTierIcon = () => {
    const config = tierConfigs[tierData.currentTier];
    const Icon = config.icon;
    const colorClass = config.color === 'yellow' ? 'text-yellow-500' :
                      config.color === 'purple' ? 'text-purple-500' :
                      'text-gray-500';
    return <Icon className={`w-8 h-8 ${colorClass}`} />;
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

  const progress = calculateProgress();
  const config = tierConfigs[tierData.currentTier];

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Tier
        </h2>
        {getTierIcon()}
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {config.name} Tier
          </h3>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {config.benefits}
        </p>

        {tierData.currentTier !== 'elite' && (
          <>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">
                  Progress to {tierConfigs[config.next!].name}
                </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sessions</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tierData.totalSessions} / {tierData.nextTierRequirements.sessions}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tierData.averageRating.toFixed(1)} / {tierData.nextTierRequirements.rating}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {tierData.retentionRate.toFixed(0)}% / {tierData.nextTierRequirements.retention}%
                </span>
              </div>
            </div>
          </>
        )}

        {tierData.currentTier === 'elite' && (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
              🎉 Congratulations! You've reached the highest tier and are part of our specialized program.
            </p>
          </div>
        )}
      </div>
    </Card>
  );
} 