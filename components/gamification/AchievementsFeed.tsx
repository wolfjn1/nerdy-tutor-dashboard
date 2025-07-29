'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { Award, Star, Target, Users, Clock, TrendingUp } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface AchievementsFeedProps {
  tutorId: string;
}

interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  points: number;
  timestamp: string;
  icon: React.ReactNode;
}

const achievementIcons: Record<string, React.ReactNode> = {
  session_completed: <Target className="w-5 h-5" />,
  student_retention: <Users className="w-5 h-5" />,
  positive_review: <Star className="w-5 h-5" />,
  milestone_reached: <Award className="w-5 h-5" />,
  streak_maintained: <Clock className="w-5 h-5" />,
  onboarding_complete: <Award className="w-5 h-5" />,
  default: <TrendingUp className="w-5 h-5" />
};

export default function AchievementsFeed({ tutorId }: AchievementsFeedProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorId) {
      setError('No tutor ID provided');
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.error('[AchievementsFeed] Query timeout after 5s');
      setError('Loading timeout - please refresh the page');
      setLoading(false);
    }, 5000);

    fetchAchievements().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [tutorId]);

  const fetchAchievements = async () => {
    try {
      const supabase = createClient();
      
      // Fetch recent points transactions
      const { data: pointsData, error: pointsError } = await supabase
        .from('gamification_points')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (pointsError) {
        console.error('[AchievementsFeed] Points query error:', pointsError);
        throw pointsError;
      }

      // Fetch recent badges
      const { data: badgesData, error: badgesError } = await supabase
        .from('tutor_badges')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('earned_at', { ascending: false })
        .limit(5);

      if (badgesError) {
        console.error('[AchievementsFeed] Badges query error:', badgesError);
        throw badgesError;
      }

      // Combine and format achievements
      const formattedAchievements: Achievement[] = [];

      // Add point achievements
      pointsData?.forEach(point => {
        const achievement: Achievement = {
          id: `point-${point.id}`,
          type: point.reason,
          title: formatTitle(point.reason),
          description: formatDescription(point.reason, point.metadata),
          points: point.points,
          timestamp: point.created_at,
          icon: achievementIcons[point.reason] || achievementIcons.default
        };
        formattedAchievements.push(achievement);
      });

      // Add badge achievements
      badgesData?.forEach(badge => {
        const achievement: Achievement = {
          id: `badge-${badge.id}`,
          type: 'badge_earned',
          title: 'New Badge Earned!',
          description: formatBadgeName(badge.badge_type),
          points: 0, // Badges might not have points
          timestamp: badge.earned_at,
          icon: <Award className="w-5 h-5" />
        };
        formattedAchievements.push(achievement);
      });

      // Sort by timestamp
      formattedAchievements.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAchievements(formattedAchievements.slice(0, 10));
      setError(null);
    } catch (error: any) {
      console.error('[AchievementsFeed] Error fetching achievements:', error);
      setError(error.message || 'Failed to load achievements');
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  const formatTitle = (reason: string): string => {
    const titles: Record<string, string> = {
      session_completed: 'Session Completed',
      student_retention: 'Student Retained',
      positive_review: 'Positive Review',
      milestone_reached: 'Milestone Reached',
      onboarding_complete: 'Onboarding Complete',
      referral_bonus: 'Referral Bonus',
      streak_maintained: 'Streak Maintained'
    };
    return titles[reason] || reason.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const formatDescription = (reason: string, metadata?: any): string => {
    // Add contextual descriptions based on the reason
    switch (reason) {
      case 'session_completed':
        return 'Successfully completed a tutoring session';
      case 'student_retention':
        return 'Student continues learning with you';
      case 'positive_review':
        return 'Received a 5-star review';
      case 'onboarding_complete':
        return 'Welcome to the platform!';
      default:
        return 'Great work!';
    }
  };

  const formatBadgeName = (badgeType: string): string => {
    const names: Record<string, string> = {
      onboarding_complete: 'Welcome Aboard',
      session_milestone_50: 'Session Hero',
      session_milestone_100: 'Century Mark',
      retention_star: 'Retention Star',
      five_star_tutor: 'Five-Star Tutor'
    };
    return names[badgeType] || badgeType.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const getTimeAgo = (timestamp: string): string => {
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return then.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
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
                {achievement.icon}
              </div>
              <div className="flex-grow min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    {achievement.title}
                  </h4>
                  {achievement.points > 0 && (
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

      {achievements.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
            View All Achievements →
          </button>
        </div>
      )}
    </Card>
  );
} 