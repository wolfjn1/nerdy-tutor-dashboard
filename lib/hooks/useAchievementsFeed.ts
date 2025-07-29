import { useState, useEffect } from 'react';

export interface Achievement {
  id: string;
  type: string;
  title: string;
  description: string;
  points?: number;
  timestamp: string;
  icon: React.ReactNode;
}

interface UseAchievementsFeedReturn {
  achievements: Achievement[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useAchievementsFeed = (): UseAchievementsFeedReturn => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTitle = (reason: string): string => {
    const titles: Record<string, string> = {
      session_completed: 'Session Completed',
      student_retention: 'Student Retained',
      positive_review: 'Positive Review',
      milestone_reached: 'Milestone Reached',
      onboarding_complete: 'Onboarding Complete',
      referral_bonus: 'Referral Bonus',
      streak_maintained: 'Streak Maintained',
      profile_complete: 'Profile Completed',
      first_session: 'First Session!',
      five_star_review: '5-Star Review',
      session_milestone: 'Session Milestone',
      tier_upgrade: 'Tier Upgraded',
    };
    return titles[reason] || reason.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ');
  };

  const formatDescription = (reason: string, metadata?: any): string => {
    switch (reason) {
      case 'session_completed':
        return 'Successfully completed a tutoring session';
      case 'student_retention':
        return metadata?.studentName ? `${metadata.studentName} continues learning with you` : 'Student continues learning with you';
      case 'positive_review':
      case 'five_star_review':
        return 'Received a 5-star review';
      case 'onboarding_complete':
        return 'Welcome to the platform!';
      case 'profile_complete':
        return 'Your profile is now complete';
      case 'first_session':
        return 'Congratulations on your first session!';
      case 'session_milestone':
        return metadata?.milestone ? `Reached ${metadata.milestone} sessions!` : 'Session milestone reached';
      case 'tier_upgrade':
        return 'Upgraded to a new tier!';
      default:
        return 'Great work!';
    }
  };

  const formatBadgeName = (badgeType: string): string => {
    const names: Record<string, string> = {
      first_session: 'First Steps Badge',
      session_master: 'Session Master Badge',
      retention_expert: 'Retention Expert Badge',
      five_star_hero: '5-Star Hero Badge',
      top_earner: 'Top Earner Badge',
      consistency_champion: 'Consistency Champion Badge',
      subject_specialist: 'Subject Specialist Badge',
      elite_tutor: 'Elite Tutor Badge'
    };
    return names[badgeType] || badgeType.split('_').map(w => 
      w.charAt(0).toUpperCase() + w.slice(1)
    ).join(' ') + ' Badge';
  };

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both points and badges data
      const [pointsResponse, badgesResponse] = await Promise.all([
        fetch('/api/gamification/points', { credentials: 'include' }),
        fetch('/api/gamification/badges', { credentials: 'include' })
      ]);

      if (!pointsResponse.ok || !badgesResponse.ok) {
        throw new Error('Failed to fetch achievements');
      }

      const pointsData = await pointsResponse.json();
      const badgesData = await badgesResponse.json();

      const formattedAchievements: Achievement[] = [];

      // Add recent point achievements (limit to last 10)
      pointsData.recentTransactions?.slice(0, 10).forEach((point: any) => {
        const achievement: Achievement = {
          id: `point-${point.id}`,
          type: point.reason,
          title: formatTitle(point.reason),
          description: formatDescription(point.reason, point.metadata),
          points: point.points,
          timestamp: point.created_at,
          icon: null // Icon will be rendered by component
        };
        formattedAchievements.push(achievement);
      });

      // Add recent badge achievements (limit to last 5)
      badgesData.badges?.slice(0, 5).forEach((badge: any) => {
        const achievement: Achievement = {
          id: `badge-${badge.id}`,
          type: 'badge_earned',
          title: 'New Badge Earned!',
          description: formatBadgeName(badge.badge_type),
          timestamp: badge.earned_at,
          icon: null // Icon will be rendered by component
        };
        formattedAchievements.push(achievement);
      });

      // Sort by timestamp
      formattedAchievements.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setAchievements(formattedAchievements.slice(0, 10));
    } catch (err) {
      console.error('Error fetching achievements:', err);
      setError('Failed to load achievements');
      setAchievements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  return {
    achievements,
    loading,
    error,
    refetch: fetchAchievements,
  };
}; 