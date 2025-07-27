'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface OnboardingCompletionBannerProps {
  justCompletedOnboarding?: boolean
}

export function OnboardingCompletionBanner({ justCompletedOnboarding = false }: OnboardingCompletionBannerProps) {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Check if user just completed onboarding (came from /onboarding)
    const referrer = document.referrer
    const fromOnboarding = referrer.includes('/onboarding') || justCompletedOnboarding
    
    // Check if we've already shown the banner
    const bannerShown = localStorage.getItem('onboarding_completion_banner_shown')
    
    if (fromOnboarding && !bannerShown) {
      setShowBanner(true)
      localStorage.setItem('onboarding_completion_banner_shown', 'true')
    }
  }, [justCompletedOnboarding])

  const handleClose = () => {
    setShowBanner(false)
  }

  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="relative mb-6"
        >
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white shadow-lg">
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <Trophy className="w-8 h-8" />
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1 flex items-center gap-2">
                  Congratulations! You've Completed Onboarding 
                  <Sparkles className="w-6 h-6" />
                </h2>
                <p className="text-white/90">
                  You've earned the <strong>Quick Learner</strong> badge and <strong>100 points</strong>! 
                  You're now ready to start your tutoring journey.
                </p>
              </div>
              
              <div className="hidden md:block">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="text-6xl"
                >
                  🎉
                </motion.div>
              </div>
            </div>
            
            <div className="mt-4 flex items-center gap-4">
              <Button
                variant="solid"
                size="sm"
                className="bg-white text-purple-600 hover:bg-gray-100"
                onClick={() => window.location.href = '/students'}
              >
                Add Your First Student
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
                onClick={() => window.location.href = '/achievements'}
              >
                View Your Achievements
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 