import { createClient } from '@/lib/supabase-browser'

const supabase = createClient()

// Define today as July 14, 2025 for calendar sync
const TODAY = new Date(2025, 6, 14) // Month is 0-indexed, so 6 = July

export interface AchievementData {
  id: string
  title: string
  description: string
  icon: string
  type: string
  xp_reward: number
  condition_type: string
  condition_value: number
  condition_timeframe: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  created_at: string
}

export interface TutorAchievementData {
  id: string
  tutor_id: string
  achievement_id: string
  progress: number
  unlocked_at: string | null
  achievement?: AchievementData
}

// Get all achievements for a tutor with progress
export async function getTutorAchievements(tutorId: string) {
  // First get all achievements
  const { data: allAchievements, error: achievementsError } = await supabase
    .from('achievements')
    .select('*')
    .order('xp_reward', { ascending: true })

  if (achievementsError) {
    console.error('Error fetching achievements:', achievementsError)
    return []
  }

  // Then get tutor's progress on achievements
  const { data: tutorAchievements, error: tutorError } = await supabase
    .from('tutor_achievements')
    .select('*')
    .eq('tutor_id', tutorId)

  if (tutorError) {
    console.error('Error fetching tutor achievements:', tutorError)
  }

  // Merge the data
  const achievementsMap = new Map()
  tutorAchievements?.forEach((ta: any) => {
    achievementsMap.set(ta.achievement_id, ta)
  })

  return allAchievements.map((achievement: any) => {
    const tutorProgress = achievementsMap.get(achievement.id)
    return {
      ...achievement,
      progress: tutorProgress?.progress || 0,
      unlocked_at: tutorProgress?.unlocked_at || null,
      earned: !!tutorProgress?.unlocked_at
    }
  })
}

// Get achievement statistics for a tutor
export async function getAchievementStats(tutorId: string) {
  const { data, error } = await supabase
    .from('tutor_achievements')
    .select(`
      *,
      achievements:achievement_id (
        xp_reward,
        rarity
      )
    `)
    .eq('tutor_id', tutorId)
    .not('unlocked_at', 'is', null)

  if (error) {
    console.error('Error fetching achievement stats:', error)
    return {
      totalUnlocked: 0,
      totalXPEarned: 0,
      byRarity: {
        common: 0,
        rare: 0,
        epic: 0,
        legendary: 0
      }
    }
  }

  const stats = {
    totalUnlocked: data?.length || 0,
    totalXPEarned: 0,
    byRarity: {
      common: 0,
      rare: 0,
      epic: 0,
      legendary: 0
    }
  }

  data?.forEach((item: any) => {
    if (item.achievements) {
      stats.totalXPEarned += item.achievements.xp_reward || 0
      const rarity = item.achievements.rarity as keyof typeof stats.byRarity
      if (rarity in stats.byRarity) {
        stats.byRarity[rarity]++
      }
    }
  })

  return stats
}

// Check and update achievement progress
export async function checkAchievementProgress(tutorId: string, type: string, value: number) {
  // Get achievements that match the type
  const { data: achievements, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('condition_type', type)

  if (error || !achievements) {
    console.error('Error checking achievements:', error)
    return []
  }

  const newlyUnlocked: any[] = []

  for (const achievement of achievements) {
    // Check if already unlocked
    const { data: existing } = await supabase
      .from('tutor_achievements')
      .select('*')
      .eq('tutor_id', tutorId)
      .eq('achievement_id', achievement.id)
      .single()

    if (existing?.unlocked_at) continue // Already unlocked

    // Check if condition is met
    if (value >= achievement.condition_value) {
      // Unlock the achievement
      const { data: unlocked, error: unlockError } = await supabase
        .from('tutor_achievements')
        .upsert({
          tutor_id: tutorId,
          achievement_id: achievement.id,
          progress: achievement.condition_value,
          unlocked_at: TODAY.toISOString()
        })
        .select()
        .single()

      if (!unlockError && unlocked) {
        newlyUnlocked.push({
          ...achievement,
          unlocked_at: unlocked.unlocked_at
        })
      }
    } else if (!existing) {
      // Update progress
      await supabase
        .from('tutor_achievements')
        .insert({
          tutor_id: tutorId,
          achievement_id: achievement.id,
          progress: value,
          unlocked_at: null
        })
    } else {
      // Update existing progress
      await supabase
        .from('tutor_achievements')
        .update({
          progress: value
        })
        .eq('id', existing.id)
    }
  }

  return newlyUnlocked
}

// Group achievements by base type and calculate tier progression
export function groupAchievementsByTier(achievements: any[]) {
  // Define achievement tiers
  const tierConfig: { [key: string]: { tiers: { name: string; value: number; color: string }[] } } = {
    'sessions_count': {
      tiers: [
        { name: 'Bronze', value: 10, color: 'bg-orange-600' },
        { name: 'Silver', value: 50, color: 'bg-gray-400' },
        { name: 'Gold', value: 100, color: 'bg-yellow-500' },
        { name: 'Diamond', value: 500, color: 'bg-cyan-400' }
      ]
    },
    'hours_taught': {
      tiers: [
        { name: 'Bronze', value: 10, color: 'bg-orange-600' },
        { name: 'Silver', value: 25, color: 'bg-gray-400' },
        { name: 'Gold', value: 50, color: 'bg-yellow-500' },
        { name: 'Diamond', value: 100, color: 'bg-cyan-400' }
      ]
    },
    'student_rating': {
      tiers: [
        { name: 'Bronze', value: 10, color: 'bg-orange-600' },
        { name: 'Silver', value: 25, color: 'bg-gray-400' },
        { name: 'Gold', value: 50, color: 'bg-yellow-500' },
        { name: 'Diamond', value: 100, color: 'bg-cyan-400' }
      ]
    },
    'streak_days': {
      tiers: [
        { name: 'Bronze', value: 7, color: 'bg-orange-600' },
        { name: 'Silver', value: 14, color: 'bg-gray-400' },
        { name: 'Gold', value: 30, color: 'bg-yellow-500' },
        { name: 'Diamond', value: 90, color: 'bg-cyan-400' }
      ]
    }
  }

  // Group achievements by condition type
  const grouped: { [key: string]: any } = {}
  
  achievements.forEach(achievement => {
    const baseType = achievement.condition_type
    
    if (!grouped[baseType]) {
      // Find the highest tier achievement for this type
      const relatedAchievements = achievements.filter(a => a.condition_type === baseType)
      const highestProgress = Math.max(...relatedAchievements.map(a => a.progress || 0))
      const config = tierConfig[baseType] || { tiers: [] }
      
      // Calculate current tier
      let currentTier: any = null
      let nextTier: any = null
      let tierIndex = -1
      
      for (let i = 0; i < config.tiers.length; i++) {
        if (highestProgress >= config.tiers[i].value) {
          currentTier = config.tiers[i]
          tierIndex = i
          nextTier = config.tiers[i + 1] || null
        }
      }
      
      // Calculate progress to next tier
      let progressPercent = 0
      let progressText = ''
      
      if (nextTier) {
        const previousValue = currentTier ? currentTier.value : 0
        const progressInTier = highestProgress - previousValue
        const tierRange = nextTier.value - previousValue
        progressPercent = (progressInTier / tierRange) * 100
        progressText = `${highestProgress}/${nextTier.value}`
      } else if (currentTier) {
        // Max tier reached
        progressPercent = 100
        progressText = `${highestProgress}/${currentTier.value}`
      } else {
        // No tier reached yet
        progressPercent = (highestProgress / config.tiers[0].value) * 100
        progressText = `${highestProgress}/${config.tiers[0].value}`
      }
      
      // Find a representative achievement for title/description
      const representativeAchievement = relatedAchievements[0]
      
      grouped[baseType] = {
        id: representativeAchievement.id,
        title: getAchievementTitle(baseType),
        description: getAchievementDescription(baseType),
        icon: representativeAchievement.icon,
        type: representativeAchievement.type,
        condition_type: baseType,
        progress: highestProgress,
        currentTier,
        nextTier,
        tierIndex,
        allTiers: config.tiers,
        progressPercent,
        progressText,
        totalXP: relatedAchievements.reduce((sum, a) => {
          // Only count XP for achieved tiers
          if (highestProgress >= a.condition_value) {
            return sum + (a.xp_reward || 0)
          }
          return sum
        }, 0)
      }
    }
  })
  
  return Object.values(grouped)
}

// Helper functions for consistent titles/descriptions
function getAchievementTitle(conditionType: string): string {
  const titles: { [key: string]: string } = {
    'sessions_count': 'Teaching Master',
    'hours_taught': 'Time Dedication',
    'student_rating': 'Student Favorite',
    'streak_days': 'Consistency Champion'
  }
  return titles[conditionType] || 'Achievement'
}

function getAchievementDescription(conditionType: string): string {
  const descriptions: { [key: string]: string } = {
    'sessions_count': 'Complete tutoring sessions',
    'hours_taught': 'Teach hours to students',
    'student_rating': 'Receive 5-star ratings',
    'streak_days': 'Maintain teaching streak'
  }
  return descriptions[conditionType] || 'Make progress'
} 