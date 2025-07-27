'use client';

import React from 'react';
import Link from 'next/link';
import { Trophy, TrendingUp, Award, Star, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui';
import { TUTOR_LEVELS } from '@/lib/gamification/constants';

interface GamificationData {
  totalPoints: number;
  currentLevel: string;
  levelProgress: number;
  currentTier: string;
  recentAchievements: Array<{
    id: string;
    type: string;
    title: string;
    earned_at: string;
    points?: number;
  }>;
  badges: Array<{
    badge_type: string;
    earned_at: string;
  }>;
  nextMilestone: {
    type: string;
    target: number;
    current: number;
    reward: string;
  };
}

interface GamificationWidgetProps {
  data: GamificationData;
  tutorId: string;
}

export default function GamificationWidget({ data, tutorId }: GamificationWidgetProps) {
  const getLevelIcon = () => {
    if (data.totalPoints >= 10001) return '👑';
    if (data.totalPoints >= 5001) return '🏆';
    if (data.totalPoints >= 2001) return '⭐';
    if (data.totalPoints >= 501) return '🎯';
    return '🌟';
  };

  const getLevelColor = () => {
    switch (data.currentLevel) {
      case 'Master':
        return 'from-purple-600 to-pink-600';
      case 'Expert':
        return 'from-blue-600 to-purple-600';
      case 'Advanced':
        return 'from-green-600 to-blue-600';
      case 'Proficient':
        return 'from-yellow-600 to-green-600';
      default:
        return 'from-gray-600 to-yellow-600';
    }
  };

  const getProgressToNextLevel = () => {
    const levels = [
      { name: 'Beginner', min: 0, max: 500 },
      { name: 'Proficient', min: 501, max: 2000 },
      { name: 'Advanced', min: 2001, max: 5000 },
      { name: 'Expert', min: 5001, max: 10000 },
      { name: 'Master', min: 10001, max: Infinity }
    ];

    const currentLevelData = levels.find(l => l.name === data.currentLevel);
    if (!currentLevelData || currentLevelData.max === Infinity) return 100;

    const progress = ((data.totalPoints - currentLevelData.min) / (currentLevelData.max - currentLevelData.min + 1)) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  return (
    <div className="space-y-6">
      {/* Main Gamification Card */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Your Progress {getLevelIcon()}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Keep earning to unlock rewards
              </p>
            </div>
            <Link href="/achievements">
              <button className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 text-sm font-medium">
                View All
                <ChevronRight className="w-4 h-4" />
              </button>
            </Link>
          </div>

          {/* Level and Points */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Current Level</span>
                <Trophy className="w-5 h-5 text-purple-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.currentLevel}
              </p>
              <div className="mt-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>{data.totalPoints.toLocaleString()} points</span>
                  <span>{Math.round(getProgressToNextLevel())}%</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${getLevelColor()} transition-all duration-500`}
                    style={{ width: `${getProgressToNextLevel()}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Performance Tier</span>
                <Award className="w-5 h-5 text-yellow-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white capitalize">
                {data.currentTier || 'Standard'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {data.badges.length} badges earned
              </p>
            </div>
          </div>

          {/* Next Milestone */}
          {data.nextMilestone && (
            <div className="bg-purple-100 dark:bg-purple-900/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
                    Next Milestone: {data.nextMilestone.type}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                    {data.nextMilestone.current} / {data.nextMilestone.target} - Earn {data.nextMilestone.reward}
                  </p>
                </div>
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div className="mt-2 h-1.5 bg-purple-200 dark:bg-purple-800 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-purple-600 dark:bg-purple-400 transition-all duration-500"
                  style={{ width: `${(data.nextMilestone.current / data.nextMilestone.target) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Recent Achievements */}
          {data.recentAchievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                Recent Achievements
              </h3>
              <div className="space-y-2">
                {data.recentAchievements.slice(0, 3).map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {achievement.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(achievement.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    {achievement.points && (
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        +{achievement.points}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
} 