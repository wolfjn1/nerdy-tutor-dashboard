'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { Award, Star, Target, Users, Clock, TrendingUp } from 'lucide-react';
import { useAchievementsFeed } from '@/lib/hooks/useAchievementsFeed';

interface AchievementsFeedProps {
  tutorId: string;
}

const achievementIcons: Record<string, React.ReactNode> = {
  session_completed: <Target className="w-5 h-5" />,
  student_retention: <Users className="w-5 h-5" />,
  positive_review: <Star className="w-5 h-5" />,
  five_star_review: <Star className="w-5 h-5" />,
  milestone_reached: <Award className="w-5 h-5" />,
  streak_maintained: <Clock className="w-5 h-5" />,
  onboarding_complete: <Award className="w-5 h-5" />,
  profile_complete: <Award className="w-5 h-5" />,
  first_session: <Target className="w-5 h-5" />,
  session_milestone: <Award className="w-5 h-5" />,
  tier_upgrade: <TrendingUp className="w-5 h-5" />,
  badge_earned: <Award className="w-5 h-5" />,
  default: <TrendingUp className="w-5 h-5" />
};

export default function AchievementsFeed({ tutorId }: AchievementsFeedProps) {
  const { achievements, loading, error } = useAchievementsFeed();

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-6"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Recent Achievements
      </h2>

      {error && (
        <div className="text-center py-8 text-red-500">
          <p>{error}</p>
        </div>
      )}

      {achievements.length === 0 && !error ? (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No achievements yet. Start tutoring to earn points and badges!
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {achievements.map((achievement) => (
            <div
              key={achievement.id}
              className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5 text-blue-600 dark:text-blue-400">
                {achievementIcons[achievement.type] || achievementIcons.default}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </h4>
                  {achievement.points && achievement.points > 0 && (
                    <span className="flex-shrink-0 text-sm font-semibold text-green-600 dark:text-green-400">
                      +{achievement.points}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                  {achievement.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {getTimeAgo(achievement.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
} 