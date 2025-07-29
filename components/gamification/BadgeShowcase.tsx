'use client';

import React from 'react';
import { Card } from '@/components/ui';
import { Award, Target, Users, Star, TrendingUp, Clock, CheckCircle, Lock } from 'lucide-react';
import { useBadges } from '@/lib/hooks/useBadges';

interface BadgeShowcaseProps {
  tutorId: string;
}

interface Badge {
  id: string;
  type: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  requirement: string;
  earned: boolean;
  earnedAt?: string;
}

const badgeDefinitions = [
  {
    type: 'first_session',
    name: 'First Steps',
    description: 'Complete your first tutoring session',
    icon: <Target className="w-8 h-8" />,
    requirement: '1 session completed'
  },
  {
    type: 'session_master',
    name: 'Session Master',
    description: 'Complete 100 tutoring sessions',
    icon: <Award className="w-8 h-8" />,
    requirement: '100 sessions'
  },
  {
    type: 'retention_expert',
    name: 'Retention Expert',
    description: 'Maintain 80% student retention rate',
    icon: <Users className="w-8 h-8" />,
    requirement: '80% retention'
  },
  {
    type: 'five_star_hero',
    name: '5-Star Hero',
    description: 'Maintain a 4.8+ rating',
    icon: <Star className="w-8 h-8" />,
    requirement: '4.8+ rating'
  },
  {
    type: 'top_earner',
    name: 'Top Earner',
    description: 'Earn $10,000 in total',
    icon: <TrendingUp className="w-8 h-8" />,
    requirement: '$10,000 earned'
  },
  {
    type: 'consistency_champion',
    name: 'Consistency Champion',
    description: 'Complete sessions for 30 consecutive days',
    icon: <Clock className="w-8 h-8" />,
    requirement: '30-day streak'
  },
  {
    type: 'subject_specialist',
    name: 'Subject Specialist',
    description: 'Complete 50 sessions in one subject',
    icon: <CheckCircle className="w-8 h-8" />,
    requirement: '50 sessions/subject'
  },
  {
    type: 'elite_tutor',
    name: 'Elite Tutor',
    description: 'Reach Elite tier status',
    icon: <Award className="w-8 h-8" />,
    requirement: 'Elite tier'
  }
];

export default function BadgeShowcase({ tutorId }: BadgeShowcaseProps) {
  const { badges: earnedBadges, loading, error } = useBadges();

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

  const earnedBadgesList = allBadges.filter(b => b.earned);
  const availableBadges = allBadges.filter(b => !b.earned);

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Badge Collection
      </h2>

      {earnedBadgesList.length > 0 && (
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Earned Badges ({earnedBadgesList.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {earnedBadgesList.map((badge) => (
              <div
                key={badge.id}
                className="relative group cursor-pointer"
              >
                <div className="flex flex-col items-center p-4 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all">
                  <div className="text-blue-600 dark:text-blue-400 mb-2">
                    {badge.icon}
                  </div>
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-white text-center">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 text-center mt-1">
                    {badge.requirement}
                  </p>
                  {badge.earnedAt && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {new Date(badge.earnedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {badge.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableBadges.map((badge) => (
              <div
                key={badge.id}
                className="relative group cursor-pointer"
              >
                <div className="flex flex-col items-center p-4 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 opacity-60 hover:opacity-80 transition-all">
                  <div className="text-gray-400 dark:text-gray-600 mb-2 relative">
                    {badge.icon}
                    <Lock className="absolute -bottom-1 -right-1 w-4 h-4 text-gray-500" />
                  </div>
                  <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 text-center">
                    {badge.name}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-500 text-center mt-1">
                    {badge.requirement}
                  </p>
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                  {badge.description}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {earnedBadgesList.length === 0 && availableBadges.length === 0 && (
        <div className="text-center py-8">
          <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No badges available yet. Keep tutoring to unlock badges!
          </p>
        </div>
      )}
    </Card>
  );
} 