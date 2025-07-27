'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, X } from 'lucide-react';
import { Badge } from '@/components/ui';
import { BadgeType } from '@/lib/types/gamification';
import { BADGE_DEFINITIONS } from '@/lib/gamification/constants';

interface BadgeNotificationProps {
  badge: BadgeType | null;
  onClose: () => void;
}

export default function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (badge) {
      setShow(true);
      // Auto-close after 8 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 8000);
      return () => clearTimeout(timer);
    }
  }, [badge]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation to complete
  };

  if (!badge) return null;

  const definition = BADGE_DEFINITIONS[badge];
  if (!definition) return null;

  const getBadgeIcon = () => {
    // You could map specific icons to badge types here
    return <Award className="w-12 h-12" />;
  };

  const getBadgeColor = () => {
    switch (definition.tier) {
      case 'platinum':
        return 'from-purple-400 to-pink-400';
      case 'gold':
        return 'from-yellow-400 to-orange-400';
      case 'silver':
        return 'from-gray-300 to-gray-400';
      default:
        return 'from-orange-400 to-red-400';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          className="fixed top-4 right-4 z-50 max-w-sm"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-6 border border-gray-200 dark:border-gray-700">
            <button
              onClick={handleClose}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -180, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className={`p-3 rounded-full bg-gradient-to-br ${getBadgeColor()} text-white`}
              >
                {getBadgeIcon()}
              </motion.div>

              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                  New Badge Earned!
                </h3>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {definition.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {definition.description}
                </p>
              </div>
            </div>

            <motion.div
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 8, ease: 'linear' }}
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-b-lg"
            />
          </div>

          {/* Celebration particles */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ 
                  x: 0, 
                  y: 0, 
                  scale: 0,
                  opacity: 1 
                }}
                animate={{ 
                  x: (Math.random() - 0.5) * 200,
                  y: (Math.random() - 0.5) * 200,
                  scale: Math.random() * 1.5 + 0.5,
                  opacity: 0
                }}
                transition={{ 
                  duration: 1.5,
                  delay: i * 0.1,
                  ease: 'easeOut'
                }}
                className="absolute top-1/2 left-1/2"
              >
                <div className={`w-2 h-2 rounded-full bg-gradient-to-br ${getBadgeColor()}`} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 