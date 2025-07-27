import { BadgeType, BonusType, TierRequirements } from '../types/gamification'

// Points values for outcome-based achievements
export const POINTS_VALUES = {
  // Student Outcome Points
  studentMilestone: 75,           // Student completes learning milestone
  monthlyRetention: 50,          // Student retention per month (after month 3)
  sessionCompletion: 25,         // Per 5 sessions completed
  positiveReview: 50,            // 4-5 star review received
  highAttendance: 30,            // Monthly >90% attendance rate
  referralConversion: 100,       // Referred student converts
  firstSession: 20,              // First session with new student
  tenSessionMilestone: 100,      // Student reaches 10 session milestone
  
  // Additional outcome-based points
  studentImprovement: 60,        // Measurable grade/performance improvement
  homeworkCompletion: 15,        // Student completes all weekly homework
  parentSatisfaction: 40,        // Positive parent feedback
  consistentScheduling: 25,      // Maintain regular schedule for month
  
  // Engagement points (lower values)
  messageResponse: 5,            // Respond to student message
  lessonPlanCreated: 10,         // Create personalized lesson plan
  aiToolUsage: 8,               // Use AI tool effectively
  profileCompletion: 15,         // Complete profile section
} as const

// Badge definitions with requirements
export const BADGE_DEFINITIONS: Record<BadgeType, {
  name: string
  description: string
  icon: string
  requirement: {
    type: 'count' | 'rate' | 'streak' | 'achievement'
    value: number
    metric?: string
  }
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
}> = {
  session_milestone: {
    name: 'Session Milestone',
    description: 'Complete milestone number of sessions',
    icon: '🎯',
    requirement: { type: 'count', value: 50, metric: 'sessions' },
    tier: 'bronze'
  },
  retention_star: {
    name: 'Retention Star',
    description: 'Maintain 10+ students for 3+ months',
    icon: '💎',
    requirement: { type: 'count', value: 10, metric: 'retained_students' },
    tier: 'gold'
  },
  five_star_tutor: {
    name: 'Five Star Tutor',
    description: 'Maintain 4.8+ rating with 20+ reviews',
    icon: '⭐',
    requirement: { type: 'rate', value: 4.8, metric: 'rating' },
    tier: 'gold'
  },
  elite_performer: {
    name: 'Elite Performer',
    description: 'Qualify for specialized tutor program',
    icon: '🏆',
    requirement: { type: 'achievement', value: 1 },
    tier: 'platinum'
  },
  consistent_educator: {
    name: 'Consistent Educator',
    description: '95%+ session completion rate over 50 sessions',
    icon: '📚',
    requirement: { type: 'rate', value: 95, metric: 'completion_rate' },
    tier: 'silver'
  },
  quick_starter: {
    name: 'Quick Starter',
    description: 'Complete 10 sessions in first month',
    icon: '🚀',
    requirement: { type: 'count', value: 10, metric: 'first_month_sessions' },
    tier: 'bronze'
  },
  marathon_tutor: {
    name: 'Marathon Tutor',
    description: 'Complete 100+ hours of tutoring',
    icon: '💪',
    requirement: { type: 'count', value: 100, metric: 'total_hours' },
    tier: 'silver'
  },
  student_champion: {
    name: 'Student Champion',
    description: '5+ students reached 20 session milestone',
    icon: '🌟',
    requirement: { type: 'count', value: 5, metric: 'champion_students' },
    tier: 'gold'
  }
}

// Progressive badge thresholds (for badges with multiple levels)
export const PROGRESSIVE_BADGE_THRESHOLDS = {
  session_milestone: [50, 100, 250, 500, 1000],
  total_hours: [50, 100, 250, 500, 1000],
  students_helped: [10, 25, 50, 100, 200],
  five_star_reviews: [5, 10, 20, 50, 100]
}

// Tier requirements and benefits
export const TIER_REQUIREMENTS: Record<string, TierRequirements> = {
  standard: {
    minSessions: 0,
    minRating: 0,
    minRetentionRate: 0
  },
  silver: {
    minSessions: 50,
    minRating: 4.5,
    minRetentionRate: 80
  },
  gold: {
    minSessions: 150,
    minRating: 4.7,
    minRetentionRate: 85
  },
  elite: {
    minSessions: 300,
    minRating: 4.8,
    minRetentionRate: 90
  }
}

// Tier benefits configuration
export const TIER_BENEFITS = {
  standard: {
    rateIncrease: 0,
    priorityMatching: false,
    advancedTools: false,
    quarterlyBonus: 0
  },
  silver: {
    rateIncrease: 5,  // 5% increase
    priorityMatching: false,
    advancedTools: true,
    quarterlyBonus: 0
  },
  gold: {
    rateIncrease: 10, // 10% increase
    priorityMatching: true,
    advancedTools: true,
    quarterlyBonus: 50
  },
  elite: {
    rateIncrease: 15, // 15% increase
    priorityMatching: true,
    advancedTools: true,
    quarterlyBonus: 100,
    specializedProgram: true
  }
}

// Monetary bonus amounts (in dollars)
export const BONUS_AMOUNTS: Record<BonusType, number> = {
  student_retention: 10,      // Per month after month 3
  session_milestone: 25,      // Per 5 sessions
  quality_review: 5,          // Per 5-star review
  referral: 50,              // Per converted referral
  new_student: 15,           // When student completes 5th session
  monthly_excellence: 50      // 95%+ attendance rate
}

// Level definitions
export const TUTOR_LEVELS = [
  { name: 'Beginner', minPoints: 0, maxPoints: 500 },
  { name: 'Proficient', minPoints: 501, maxPoints: 2000 },
  { name: 'Advanced', minPoints: 2001, maxPoints: 5000 },
  { name: 'Expert', minPoints: 5001, maxPoints: 10000 },
  { name: 'Master', minPoints: 10001, maxPoints: Infinity }
] as const

// Achievement categories for UI grouping
export const ACHIEVEMENT_CATEGORIES = {
  outcome: {
    name: 'Student Outcomes',
    description: 'Achievements based on student success',
    icon: '🎓'
  },
  activity: {
    name: 'Teaching Activities', 
    description: 'Achievements for tutoring activities',
    icon: '📚'
  },
  milestone: {
    name: 'Milestones',
    description: 'Major accomplishments',
    icon: '🏆'
  },
  quality: {
    name: 'Quality & Excellence',
    description: 'Achievements for exceptional performance',
    icon: '⭐'
  }
} as const

// Nudge priority thresholds
export const NUDGE_THRESHOLDS = {
  missingLearningPlan: 7,       // Days without plan
  schedulingGap: 3,             // Days since last session
  lowEngagement: 5,             // Days without interaction
  aiToolSuggestion: 10,         // Sessions without AI use
  studentAtRisk: 0.7,           // Engagement drop threshold
  achievementNear: 0.9,         // Progress threshold
  profileIncomplete: 0.8        // Profile completion threshold
} as const 