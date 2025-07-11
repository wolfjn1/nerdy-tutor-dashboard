/**
 * Calculate XP needed for next level
 */
export function calculateXPForNextLevel(currentLevel: number): number {
  // XP formula: level * 100 + (level - 1) * 50
  return currentLevel * 100 + (currentLevel - 1) * 50
}

/**
 * Calculate current level from total XP
 */
export function calculateLevelFromXP(totalXP: number): number {
  let level = 1
  let xpForLevel = calculateXPForNextLevel(level)
  
  while (totalXP >= xpForLevel) {
    totalXP -= xpForLevel
    level++
    xpForLevel = calculateXPForNextLevel(level)
  }
  
  return level
}

/**
 * Calculate progress percentage for current level
 */
export function calculateLevelProgress(totalXP: number, currentLevel: number): number {
  let remainingXP = totalXP
  
  // Subtract XP for all previous levels
  for (let i = 1; i < currentLevel; i++) {
    remainingXP -= calculateXPForNextLevel(i)
  }
  
  const xpForCurrentLevel = calculateXPForNextLevel(currentLevel)
  return Math.min(100, Math.max(0, (remainingXP / xpForCurrentLevel) * 100))
}

/**
 * Calculate student performance score
 */
export function calculatePerformanceScore(
  attendance: number,
  homework: number,
  engagement: number,
  weights: { attendance: number; homework: number; engagement: number } = {
    attendance: 0.4,
    homework: 0.3,
    engagement: 0.3
  }
): number {
  return Math.round(
    attendance * weights.attendance +
    homework * weights.homework +
    engagement * weights.engagement
  )
}

/**
 * Calculate earnings for a time period
 */
export function calculateEarnings(
  sessions: Array<{ duration: number; rate: number; status: string }>,
  timeframe: 'week' | 'month' | 'year' = 'month'
): number {
  return sessions
    .filter(session => session.status === 'completed')
    .reduce((total, session) => {
      const sessionEarnings = (session.duration / 60) * session.rate
      return total + sessionEarnings
    }, 0)
}

/**
 * Calculate streak from session dates
 */
export function calculateStreak(sessionDates: Date[]): number {
  if (sessionDates.length === 0) return 0
  
  const sortedDates = sessionDates
    .map(date => new Date(date))
    .sort((a, b) => b.getTime() - a.getTime())
  
  let streak = 0
  let currentDate = new Date()
  currentDate.setHours(0, 0, 0, 0)
  
  for (const sessionDate of sortedDates) {
    const sessionDay = new Date(sessionDate)
    sessionDay.setHours(0, 0, 0, 0)
    
    const dayDiff = Math.floor((currentDate.getTime() - sessionDay.getTime()) / (1000 * 60 * 60 * 24))
    
    if (dayDiff === streak) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else if (dayDiff > streak) {
      break
    }
  }
  
  return streak
}

/**
 * Calculate time until next session
 */
export function calculateTimeUntilNextSession(nextSessionDate: Date): string {
  const now = new Date()
  const diff = nextSessionDate.getTime() - now.getTime()
  
  if (diff < 0) return 'Past due'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  
  if (days > 0) return `${days}d ${hours}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

/**
 * Calculate completion percentage
 */
export function calculateCompletionPercentage(completed: number, total: number): number {
  if (total === 0) return 0
  return Math.round((completed / total) * 100)
} 