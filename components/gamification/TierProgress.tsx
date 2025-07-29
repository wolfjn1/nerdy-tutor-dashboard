'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { Trophy, TrendingUp, Star, Crown, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Check, X } from 'lucide-react';
import { useGameification } from '@/lib/hooks/useGameification';
import { cn } from '@/lib/utils/cn';
import { TutorTier } from '@/lib/gamification/TierSystem';

const tierConfigs = {
  standard: {
    name: 'Standard',
    color: 'gray',
    icon: Trophy,
    glowClass: '',
  },
  silver: {
    name: 'Silver',
    color: 'gray',
    icon: Star,
    glowClass: '',
  },
  gold: {
    name: 'Gold',
    color: 'yellow',
    icon: Crown,
    glowClass: '',
  },
  elite: {
    name: 'Elite',
    color: 'purple',
    icon: Crown,
    glowClass: 'elite-glow',
  }
};

export function TierProgress() {
  const { stats, loading, error, refetch } = useGameification();
  const [showBenefits, setShowBenefits] = useState(false);

  if (loading) {
    return (
      <Card className="p-6" data-testid="tier-progress-skeleton">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-12 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <button
            onClick={refetch}
            className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </Card>
    );
  }

  if (!stats) return null;

  const { currentTier } = stats;
  const config = tierConfigs[currentTier as TutorTier];
  const Icon = config.icon;

  const getTierName = (tier: TutorTier | null) => {
    if (!tier) return '';
    return tierConfigs[tier].name;
  };

  const renderProgressBar = (value: number, testId: string) => (
    <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
      <div 
        data-testid={testId}
        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${value}%` }}
      />
    </div>
  );

  const renderCheckmark = (isMet: boolean, testId: string) => (
    <div data-testid={testId} className={cn("w-5 h-5", isMet ? "text-green-500" : "text-gray-300")}>
      {isMet ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
    </div>
  );

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Your Tier
        </h2>
        <div 
          data-testid={currentTier === 'elite' ? 'elite-badge' : 'tier-badge'}
          className={cn(
            "p-2 rounded-full",
            config.glowClass,
            config.color === 'yellow' ? 'text-yellow-500' :
            config.color === 'purple' ? 'text-purple-500' :
            'text-gray-500'
          )}
        >
          <Icon className="w-8 h-8" />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
            {getTierName(currentTier as TutorTier)} Tier
          </h3>
        </div>

        {stats?.nextTier ? (
          <>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                              Next: {getTierName(stats.nextTier)} Tier
            </p>

            <div className="space-y-4">
              {/* Sessions Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {renderCheckmark(
                      stats.sessionsToNext === 0,
                      'sessions-check'
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Sessions
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.completedSessions}/{stats.completedSessions + (stats.sessionsToNext || 0)} sessions
                  </span>
                </div>
                {renderProgressBar(stats.sessionsProgress || 0, 'sessions-progress-bar')}
              </div>

              {/* Rating Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {renderCheckmark(
                      stats.ratingToNext === 0,
                      'rating-check'
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Rating
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.averageRating}/{stats.averageRating + (stats.ratingToNext || 0)} rating
                  </span>
                </div>
                {renderProgressBar(stats.ratingProgress || 0, 'rating-progress-bar')}
              </div>

              {/* Retention Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {renderCheckmark(
                      stats.retentionToNext === 0,
                      'retention-check'
                    )}
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Retention
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {stats.retentionRate}%/{stats.retentionRate + (stats.retentionToNext || 0)}% retention
                  </span>
                </div>
                {renderProgressBar(stats.retentionProgress || 0, 'retention-progress-bar')}
              </div>
            </div>

            {stats.isCloseToPromotion && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                  You're close to {getTierName(stats.nextTier)} tier! Keep up the great work!
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-200">
              Maximum tier achieved!
            </p>
          </div>
        )}

        {/* Rate Increase Display */}
        {stats.currentRateIncrease !== undefined && (
          <div className="mt-4 space-y-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Current rate bonus: +{stats.currentRateIncrease}%
            </p>
            {stats.nextTierRateIncrease !== undefined && stats?.nextTier && (
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {getTierName(stats.nextTier)} tier bonus: +{stats.nextTierRateIncrease}%
              </p>
            )}
          </div>
        )}

        {/* Tier Benefits */}
        {stats.tierBenefits && stats.tierBenefits.length > 0 && (
          <div className="mt-4">
            <button
              onClick={() => setShowBenefits(!showBenefits)}
              className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
            >
              View Benefits
              {showBenefits ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            
            {showBenefits && (
              <ul className="mt-2 space-y-1">
                {stats.tierBenefits.map((benefit, index) => (
                  <li key={index} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default TierProgress; 