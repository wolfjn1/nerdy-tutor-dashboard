'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AchievementToast, { Achievement } from './AchievementToast';
import BadgeNotification from './BadgeNotification';
import { useAchievementNotifications, useBadgeNotifications } from '@/lib/hooks';
import { BadgeType } from '@/lib/types/gamification';

interface AchievementNotificationContainerProps {
  tutorId: string;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  maxVisible?: number;
  showBadges?: boolean;
  showAchievements?: boolean;
  achievementDuration?: number;
}

export default function AchievementNotificationContainer({
  tutorId,
  position = 'bottom-right',
  maxVisible = 3,
  showBadges = true,
  showAchievements = true,
  achievementDuration = 5000
}: AchievementNotificationContainerProps) {
  // Achievement notifications
  const {
    currentAchievement,
    achievementQueue,
    closeAchievement
  } = useAchievementNotifications(tutorId, {
    showPointNotifications: showAchievements,
    showBonusNotifications: showAchievements
  });

  // Badge notifications
  const {
    currentBadge,
    closeBadgeNotification,
    badgeQueue
  } = useBadgeNotifications(tutorId);

  // Calculate stacked achievements for visual preview
  const visibleAchievements = achievementQueue.slice(0, maxVisible - 1);
  const remainingCount = Math.max(0, achievementQueue.length - (maxVisible - 1));

  const getPositionClasses = () => {
    switch (position) {
      case 'top-right':
        return 'top-4 right-4';
      case 'top-center':
        return 'top-4 left-1/2 -translate-x-1/2';
      case 'bottom-right':
        return 'bottom-4 right-4';
      case 'bottom-center':
        return 'bottom-4 left-1/2 -translate-x-1/2';
      default:
        return 'bottom-4 right-4';
    }
  };

  const getStackDirection = () => {
    return position.includes('top') ? 'down' : 'up';
  };

  return (
    <>
      {/* Badge Notification (separate positioning) */}
      {showBadges && (
        <BadgeNotification
          badge={currentBadge}
          onClose={closeBadgeNotification}
        />
      )}

      {/* Achievement Notifications */}
      {showAchievements && (
        <div className={`fixed ${getPositionClasses()} z-40`}>
          <AnimatePresence mode="sync">
            {/* Stacked preview of queued achievements */}
            {visibleAchievements.map((achievement: Achievement, index: number) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0.5 - (index * 0.1),
                  scale: 0.95 - (index * 0.05),
                  y: getStackDirection() === 'up' 
                    ? -(index + 1) * 15 
                    : (index + 1) * 15
                }}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: -index - 1 }}
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1 animate-pulse" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Remaining count indicator */}
            {remainingCount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 0.3,
                  scale: 0.9,
                  y: getStackDirection() === 'up' 
                    ? -(maxVisible) * 15 
                    : (maxVisible) * 15
                }}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: -maxVisible }}
              >
                <div className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow-lg p-3 text-center">
                  <p className="text-white text-sm font-medium">
                    +{remainingCount} more
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Current Achievement */}
          <AchievementToast
            achievement={currentAchievement}
            onClose={closeAchievement}
            position={position}
            duration={achievementDuration}
          />
        </div>
      )}

      {/* Queue indicator */}
      {(achievementQueue.length > 0 || badgeQueue.length > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`fixed ${position.includes('bottom') ? 'bottom-20' : 'top-20'} ${
            position.includes('center') ? 'left-1/2 -translate-x-1/2' : position.includes('right') ? 'right-4' : 'left-4'
          } text-sm text-gray-500 dark:text-gray-400`}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            <span>
              {achievementQueue.length + badgeQueue.length} notifications pending
            </span>
          </div>
        </motion.div>
      )}
    </>
  );
} 