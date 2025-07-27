'use client';

import React from 'react';
import { Card } from '@/components/ui';
import PointsDisplay from './PointsDisplay';
import TierProgress from './TierProgress';
import BadgeShowcase from './BadgeShowcase';
import AchievementsFeed from './AchievementsFeed';
import BonusTracker from './BonusTracker';

interface GamificationCenterProps {
  tutorId: string;
}

export default function GamificationCenter({ tutorId }: GamificationCenterProps) {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Your Achievements
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Track your progress, earn rewards, and unlock new opportunities
        </p>
      </div>

      {/* Top Row - Points and Tier */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PointsDisplay tutorId={tutorId} />
        <TierProgress tutorId={tutorId} />
      </div>

      {/* Middle Section - Badges */}
      <BadgeShowcase tutorId={tutorId} />

      {/* Bottom Row - Achievements and Bonuses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AchievementsFeed tutorId={tutorId} />
        <BonusTracker tutorId={tutorId} />
      </div>
    </div>
  );
} 