'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui';
import { Award, Lock, Trophy, Star, Target, Users, Clock, Zap } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

interface BadgeShowcaseProps {
  tutorId: string;
}

interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  requirement?: string;
}

const badgeDefinitions = [
  {
    type: 'onboarding_complete',
    name: 'Welcome Aboard',
    description: 'Complete the onboarding process',
    icon: <Award className="w-8 h-8" />,
    requirement: 'Complete all onboarding steps'
  },
  {
    type: 'session_milestone_50',
    name: 'Session Hero',
    description: 'Complete 50 tutoring sessions',
    icon: <Target className="w-8 h-8" />,
    requirement: '50 sessions completed'
  },
  {
    type: 'session_milestone_100',
    name: 'Century Mark',
    description: 'Complete 100 tutoring sessions',
    icon: <Trophy className="w-8 h-8" />,
    requirement: '100 sessions completed'
  },
  {
    type: 'session_milestone_250',
    name: 'Quarter Master',
    description: 'Complete 250 tutoring sessions',
    icon: <Star className="w-8 h-8" />,
    requirement: '250 sessions completed'
  },
  {
    type: 'retention_star',
    name: 'Retention Star',
    description: '10+ students retained for 3+ months',
    icon: <Users className="w-8 h-8" />,
    requirement: '10 long-term students'
  },
  {
    type: 'five_star_tutor',
    name: 'Five-Star Tutor',
    description: 'Maintain 4.8+ rating with 20+ reviews',
    icon: <Star className="w-8 h-8" />,
    requirement: '4.8+ rating, 20+ reviews'
  },
  {
    type: 'quick_starter',
    name: 'Quick Starter',
    description: 'Complete 10 sessions in first month',
    icon: <Zap className="w-8 h-8" />,
    requirement: '10 sessions in first month'
  },
  {
    type: 'marathon_tutor',
    name: 'Marathon Tutor',
    description: '100+ hours of tutoring completed',
    icon: <Clock className="w-8 h-8" />,
    requirement: '100+ tutoring hours'
  }
];

export default function BadgeShowcase({ tutorId }: BadgeShowcaseProps) {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!tutorId) {
      setError('No tutor ID provided');
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      console.error('[BadgeShowcase] Query timeout after 5s');
      setError('Loading timeout - please refresh the page');
      setLoading(false);
    }, 5000);

    fetchBadges().finally(() => {
      clearTimeout(timeoutId);
    });

    return () => clearTimeout(timeoutId);
  }, [tutorId]);

  const fetchBadges = async () => {
    try {
      const supabase = createClient();
      
      // Fetch earned badges
      const { data: earnedBadges, error } = await supabase
        .from('tutor_badges')
        .select('*')
        .eq('tutor_id', tutorId);

      if (error) {
        console.error('[BadgeShowcase] Query error:', error);
        throw error;
      }

      // Map badge definitions with earned status
      const allBadges: Badge[] = badgeDefinitions.map(def => {
        const earned = earnedBadges?.find(b => b.badge_type === def.type);
        return {
          id: def.type,
          type: def.type,
          name: def.name,
          description: def.description,
          icon: def.icon,
          requirement: def.requirement,
          earned: !!earned,
          earnedAt: earned?.earned_at
        };
      });

      setBadges(allBadges);
      setError(null);
    } catch (error: any) {
      console.error('[BadgeShowcase] Error fetching badges:', error);
      setError(error.message || 'Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-500">
        <p>{error}</p>
      </Card>
    );
  }

  const earnedBadges = badges.filter(b => b.earned);
  const availableBadges = badges.filter(b => !b.earned);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Badge Collection
      </h2>

      {earnedBadges.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Earned Badges ({earnedBadges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {earnedBadges.map((badge) => (
              <div
                key={badge.id}
                className="relative group cursor-pointer"
              >
                <div className="flex flex-col items-center p-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg hover:shadow-lg transition-all duration-200">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    {badge.icon}
                  </div>
                  <p className="text-xs font-medium text-center text-gray-900 dark:text-white">
                    {badge.name}
                  </p>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg py-2 px-3 max-w-xs">
                    <p className="font-semibold mb-1">{badge.name}</p>
                    <p className="text-gray-300">{badge.description}</p>
                    {badge.earnedAt && (
                      <p className="text-gray-400 mt-1">
                        Earned: {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {availableBadges.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Available Badges ({availableBadges.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {availableBadges.map((badge) => (
              <div
                key={badge.id}
                className="relative group cursor-pointer"
              >
                <div className="flex flex-col items-center p-4 bg-gray-100 dark:bg-gray-800 rounded-lg opacity-60 hover:opacity-80 transition-all duration-200">
                  <div className="text-gray-400 dark:text-gray-600 mb-2 relative">
                    {badge.icon}
                    <Lock className="w-4 h-4 absolute -bottom-1 -right-1 bg-gray-100 dark:bg-gray-800 rounded-full" />
                  </div>
                  <p className="text-xs font-medium text-center text-gray-600 dark:text-gray-400">
                    {badge.name}
                  </p>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                  <div className="bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg py-2 px-3 max-w-xs">
                    <p className="font-semibold mb-1">{badge.name}</p>
                    <p className="text-gray-300">{badge.description}</p>
                    {badge.requirement && (
                      <p className="text-gray-400 mt-1">
                        Requirement: {badge.requirement}
                      </p>
                    )}
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-800"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {badges.length === 0 && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
          No badges available yet. Complete your onboarding to earn your first badge!
        </p>
      )}
    </Card>
  );
} 