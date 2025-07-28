import { useEffect, useState } from 'react';
import { useGamificationRealtime } from './useGamificationRealtime';
import { BadgeType } from '../types/gamification';

export function useBadgeNotifications(tutorId: string) {
  const [currentBadge, setCurrentBadge] = useState<BadgeType | null>(null);
  const [badgeQueue, setBadgeQueue] = useState<BadgeType[]>([]);
  const { updates } = useGamificationRealtime(tutorId);

  useEffect(() => {
    // Listen for badge updates
    const badgeUpdates = updates.filter(update => update.type === 'badge');
    
    badgeUpdates.forEach(update => {
      const badgeType = update.data.badge_type as BadgeType;
      if (badgeType && !badgeQueue.includes(badgeType)) {
        setBadgeQueue(prev => [...prev, badgeType]);
      }
    });
  }, [updates]);

  useEffect(() => {
    // Show badges from queue one at a time
    if (!currentBadge && badgeQueue.length > 0) {
      const [nextBadge, ...remainingBadges] = badgeQueue;
      setCurrentBadge(nextBadge);
      setBadgeQueue(remainingBadges);
    }
  }, [currentBadge, badgeQueue]);

  const closeBadgeNotification = () => {
    setCurrentBadge(null);
  };

  const checkForNewBadges = async () => {
    try {
      const response = await fetch('/api/gamification/check-badges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ tutorId })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.newBadges && data.newBadges.length > 0) {
          setBadgeQueue(prev => [...prev, ...data.newBadges]);
        }
        return data;
      }
    } catch (error) {
      console.error('Error checking badges:', error);
    }
    return null;
  };

  return {
    currentBadge,
    closeBadgeNotification,
    checkForNewBadges,
    badgeQueue
  };
} 