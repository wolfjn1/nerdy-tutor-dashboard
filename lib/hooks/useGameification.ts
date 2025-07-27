import { useTutorStore } from '@/lib/stores/tutorStore'
import { formatXP, formatLevel } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { TierSystem, TierProgress, TutorTier } from '@/lib/gamification/TierSystem'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const useGameification = () => {
  const {
    totalXP,
    level,
    levelProgress,
    xpForNextLevel,
    streak,
    achievements,
    xpActivities,
    addXP,
    updateStreak,
    unlockAchievement,
    getUnlockedAchievements
  } = useTutorStore()

  const [tierData, setTierData] = useState<{
    stats: {
      currentTier: TutorTier;
      tierProgress: TierProgress | null;
      tierBenefits?: string[];
      currentRateIncrease?: number;
      nextTierRateIncrease?: number;
    } | null;
    loading: boolean;
    error: string | null;
  }>({
    stats: null,
    loading: true,
    error: null
  })

  const supabase = createClientComponentClient()

  const fetchTierData = async () => {
    try {
      setTierData(prev => ({ ...prev, loading: true, error: null }))
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const tierSystem = new TierSystem()
      const progress = await tierSystem.getTierProgress(user.id)
      
      // Get tier benefits
      const benefits = tierSystem.getTierBenefits(progress.currentTier)
      
      // Calculate rate increases
      const tierRates: Record<TutorTier, number> = {
        standard: 0,
        silver: 5,
        gold: 10,
        elite: 15
      }
      
      setTierData({
        stats: {
          currentTier: progress.currentTier,
          tierProgress: progress,
          tierBenefits: benefits,
          currentRateIncrease: tierRates[progress.currentTier],
          nextTierRateIncrease: progress.nextTier ? tierRates[progress.nextTier] : undefined
        },
        loading: false,
        error: null
      })
    } catch (error) {
      console.error('Error fetching tier data:', error)
      setTierData({
        stats: null,
        loading: false,
        error: 'Failed to load tier information'
      })
    }
  }

  useEffect(() => {
    fetchTierData()
  }, [])

  const earnXP = (amount: number, source: string, studentId?: string, sessionId?: string) => {
    addXP(amount, source, studentId, sessionId)
  }

  const refreshStreak = () => {
    updateStreak()
  }

  const unlockNewAchievement = (id: string) => {
    unlockAchievement(id)
  }

  const getRecentXPActivities = (count: number = 10) => {
    return xpActivities.slice(0, count)
  }

  const getXPThisWeek = () => {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    return xpActivities
      .filter(activity => activity.timestamp >= oneWeekAgo)
      .reduce((total, activity) => total + activity.amount, 0)
  }

  const getXPThisMonth = () => {
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    
    return xpActivities
      .filter(activity => activity.timestamp >= oneMonthAgo)
      .reduce((total, activity) => total + activity.amount, 0)
  }

  const getXPProgress = () => {
    const currentLevelXP = totalXP - (level - 1) * 100
    const progress = (currentLevelXP / xpForNextLevel) * 100
    return Math.min(100, Math.max(0, progress))
  }

  const getNextLevelXP = () => {
    return xpForNextLevel - (totalXP - (level - 1) * 100)
  }

  const getStreakText = () => {
    if (streak === 0) return 'Start your streak!'
    if (streak === 1) return '1 day streak'
    return `${streak} days streak`
  }

  const getStreakEmoji = () => {
    if (streak === 0) return '🔥'
    if (streak < 7) return '🔥'
    if (streak < 30) return '🔥🔥'
    return '🔥🔥🔥'
  }

  const getLevelTitle = () => {
    if (level < 10) return 'Novice Tutor'
    if (level < 25) return 'Skilled Tutor'
    if (level < 50) return 'Expert Tutor'
    if (level < 75) return 'Master Tutor'
    return 'Legendary Tutor'
  }

  const getUnlockedAchievementsList = () => {
    return getUnlockedAchievements()
  }

  const getAchievementProgress = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId)
    if (!achievement) return 0
    return (achievement.progress / achievement.maxProgress) * 100
  }

  const canLevelUp = () => {
    return levelProgress >= 100
  }

  const getXPToNextLevel = () => {
    return xpForNextLevel - Math.floor((levelProgress / 100) * xpForNextLevel)
  }

  return {
    // State
    totalXP,
    level,
    levelProgress,
    xpForNextLevel,
    streak,
    achievements,
    xpActivities,
    
    // Tier data
    stats: tierData.stats,
    loading: tierData.loading,
    error: tierData.error,
    refetch: fetchTierData,
    
    // Actions
    earnXP,
    refreshStreak,
    unlockNewAchievement,
    
    // Computed values
    formattedXP: formatXP(totalXP),
    formattedLevel: formatLevel(level),
    xpProgress: getXPProgress(),
    nextLevelXP: getNextLevelXP(),
    streakText: getStreakText(),
    streakEmoji: getStreakEmoji(),
    levelTitle: getLevelTitle(),
    xpThisWeek: getXPThisWeek(),
    xpThisMonth: getXPThisMonth(),
    xpToNextLevel: getXPToNextLevel(),
    
    // Helpers
    getRecentXPActivities,
    getUnlockedAchievementsList,
    getAchievementProgress,
    canLevelUp
  }
} 