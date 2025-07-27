'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, Star, TrendingUp, Trophy, Zap, Gift } from 'lucide-react';

export interface Achievement {
  id: string;
  type: 'points' | 'milestone' | 'streak' | 'bonus' | 'level_up' | 'tier_promotion';
  title: string;
  description: string;
  points?: number;
  icon?: React.ReactNode;
}

interface AchievementToastProps {
  achievement: Achievement | null;
  onClose: () => void;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  duration?: number;
}

export default function AchievementToast({ 
  achievement, 
  onClose, 
  position = 'bottom-right',
  duration = 5000 
}: AchievementToastProps) {
  const [show, setShow] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    if (achievement) {
      setShow(true);
      setProgress(100);
      
      // Start progress countdown
      const interval = setInterval(() => {
        setProgress(prev => Math.max(0, prev - (100 / (duration / 100))));
      }, 100);

      // Auto-close timer
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [achievement, duration]);

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  if (!achievement) return null;

  const getIcon = () => {
    if (achievement.icon) return achievement.icon;
    
    switch (achievement.type) {
      case 'points':
        return <Star className="w-6 h-6" />;
      case 'milestone':
        return <Trophy className="w-6 h-6" />;
      case 'streak':
        return <Zap className="w-6 h-6" />;
      case 'bonus':
        return <Gift className="w-6 h-6" />;
      case 'level_up':
        return <TrendingUp className="w-6 h-6" />;
      case 'tier_promotion':
        return <Award className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getColorScheme = () => {
    switch (achievement.type) {
      case 'points':
        return 'from-green-500 to-emerald-500';
      case 'milestone':
        return 'from-purple-500 to-pink-500';
      case 'streak':
        return 'from-orange-500 to-red-500';
      case 'bonus':
        return 'from-yellow-500 to-amber-500';
      case 'level_up':
        return 'from-blue-500 to-indigo-500';
      case 'tier_promotion':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

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

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: position.includes('top') ? -50 : 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: position.includes('top') ? -50 : 50, scale: 0.9 }}
          className={`fixed ${getPositionClasses()} z-50 max-w-sm w-full sm:w-auto`}
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden">
            <div className="p-4">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg bg-gradient-to-br ${getColorScheme()} text-white flex-shrink-0`}>
                  {getIcon()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {achievement.title}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                    {achievement.description}
                  </p>
                  {achievement.points && achievement.points > 0 && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-sm font-bold text-green-600 dark:text-green-400">
                        +{achievement.points} points
                      </span>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-1 bg-gray-200 dark:bg-gray-700">
              <motion.div
                className={`h-full bg-gradient-to-r ${getColorScheme()}`}
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 