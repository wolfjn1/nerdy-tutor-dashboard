'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, Zap, TrendingUp } from 'lucide-react';

interface GamificationSummaryProps {
  totalPoints: number;
  currentLevel: string;
  currentStreak: number;
  weeklyPoints: number;
}

export default function GamificationSummaryCard({ 
  totalPoints, 
  currentLevel, 
  currentStreak,
  weeklyPoints 
}: GamificationSummaryProps) {
  const getLevelColor = () => {
    switch (currentLevel) {
      case 'Master':
        return 'text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30';
      case 'Expert':
        return 'text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30';
      case 'Advanced':
        return 'text-green-600 bg-green-100 dark:text-green-400 dark:bg-green-900/30';
      case 'Proficient':
        return 'text-yellow-600 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30';
      default:
        return 'text-gray-600 bg-gray-100 dark:text-gray-400 dark:bg-gray-900/30';
    }
  };

  return (
    <Link href="/achievements" className="block">
      <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Progress</h3>
          <Trophy className="w-5 h-5 text-purple-500" />
        </div>
        
        <div className="space-y-3">
          {/* Level Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Level</span>
            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getLevelColor()}`}>
              {currentLevel}
            </span>
          </div>

          {/* Total Points */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Total Points</span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              {totalPoints.toLocaleString()}
            </span>
          </div>

          {/* Current Streak */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-orange-500" />
              <span className="text-sm font-bold text-gray-900 dark:text-white">
                {currentStreak} days
              </span>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
            <div className="flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                +{weeklyPoints}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-purple-600 dark:text-purple-400 font-medium">
            View All Achievements →
          </p>
        </div>
      </div>
    </Link>
  );
} 