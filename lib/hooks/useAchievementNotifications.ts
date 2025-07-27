import { useEffect, useState, useRef } from 'react';
import { useGamificationRealtime } from './useGamificationRealtime';
import { Achievement } from '@/components/gamification/AchievementToast';
import { AchievementManager } from '@/lib/gamification/AchievementManager';
import { createClient } from '@/utils/supabase/client';

interface UseAchievementNotificationsOptions {
  maxQueueSize?: number;
  showBadgeNotifications?: boolean;
  showPointNotifications?: boolean;
  showBonusNotifications?: boolean;
}

export function useAchievementNotifications(
  tutorId: string,
  options: UseAchievementNotificationsOptions = {}
) {
  const {
    maxQueueSize = 5,
    showBadgeNotifications = false, // Use BadgeNotification component for badges
    showPointNotifications = true,
    showBonusNotifications = true
  } = options;

  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<Achievement[]>([]);
  const { updates } = useGamificationRealtime(tutorId);
  const managerRef = useRef<AchievementManager | null>(null);

  // Initialize achievement manager
  useEffect(() => {
    const supabase = createClient();
    const manager = new AchievementManager(supabase as any);
    managerRef.current = manager;

    // Subscribe to achievement notifications
    const unsubscribe = manager.subscribe((achievement) => {
      addToQueue(achievement);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!managerRef.current) return;

    updates.forEach(update => {
      switch (update.type) {
        case 'points':
          if (showPointNotifications && update.data.points > 0) {
            managerRef.current?.createPointsAchievement(
              tutorId,
              update.data.points,
              update.data.reason
            );
          }
          break;

        case 'bonus':
          if (showBonusNotifications) {
            managerRef.current?.createBonusAchievement(
              tutorId,
              update.data.bonus_type,
              Number(update.data.amount)
            );
          }
          break;

        case 'tier':
          if (update.data.current_tier) {
            const tierNames: Record<string, string> = {
              silver: 'Silver',
              gold: 'Gold',
              elite: 'Elite'
            };
            const tierBenefits: Record<string, string> = {
              silver: '5% rate increase',
              gold: '10% rate increase',
              elite: '15% rate increase + specialized program'
            };
            
            managerRef.current?.createTierPromotionAchievement(
              tutorId,
              tierNames[update.data.current_tier] || update.data.current_tier,
              tierBenefits[update.data.current_tier] || ''
            );
          }
          break;

        // Badge notifications are handled separately if showBadgeNotifications is false
      }
    });
  }, [updates, tutorId, showPointNotifications, showBonusNotifications]);

  // Process achievement queue
  useEffect(() => {
    if (!currentAchievement && achievementQueue.length > 0) {
      const [next, ...remaining] = achievementQueue;
      setCurrentAchievement(next);
      setAchievementQueue(remaining);
    }
  }, [currentAchievement, achievementQueue]);

  const addToQueue = (achievement: Achievement) => {
    setAchievementQueue(prev => {
      const newQueue = [...prev, achievement];
      // Limit queue size
      if (newQueue.length > maxQueueSize) {
        return newQueue.slice(-maxQueueSize);
      }
      return newQueue;
    });
  };

  const closeAchievement = () => {
    setCurrentAchievement(null);
  };

  const clearQueue = () => {
    setAchievementQueue([]);
    setCurrentAchievement(null);
  };

  // Manual achievement creation methods
  const showPointsAchievement = async (points: number, reason: string) => {
    managerRef.current?.createPointsAchievement(tutorId, points, reason);
  };

  const showMilestoneAchievement = async (type: string, value: number) => {
    managerRef.current?.createMilestoneAchievement(tutorId, type, value);
  };

  const showStreakAchievement = async (days: number) => {
    managerRef.current?.createStreakAchievement(tutorId, days);
  };

  const showCustomAchievement = (achievement: Achievement) => {
    addToQueue(achievement);
  };

  // Check for achievements based on current stats
  const checkForAchievements = async (eventType: string, eventData: any) => {
    managerRef.current?.checkAchievements(tutorId, eventType, eventData);
  };

  return {
    currentAchievement,
    achievementQueue,
    closeAchievement,
    clearQueue,
    showPointsAchievement,
    showMilestoneAchievement,
    showStreakAchievement,
    showCustomAchievement,
    checkForAchievements,
    queueLength: achievementQueue.length
  };
} 