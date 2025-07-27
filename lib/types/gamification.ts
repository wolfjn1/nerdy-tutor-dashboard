// Gamification Types for AI-Driven Tutor Onboarding & Gamification System

// Onboarding Types
export interface OnboardingStatus {
  completedSteps: string[]
  currentStep: string
  startedAt: Date
  completedAt?: Date
  totalSteps: number
  percentComplete: number
}

export interface OnboardingStep {
  id: string
  title: string
  description: string
  order: number
  isCompleted: boolean
  completedAt?: Date
}

// Gamification Core Types
export interface GamificationStats {
  totalPoints: number
  currentLevel: TutorLevel
  badges: Badge[]
  recentAchievements: GamificationAchievement[]
  leaderboardRank?: number
  pointsThisMonth: number
  pointsThisWeek: number
}

export interface TutorLevel {
  name: 'Beginner' | 'Proficient' | 'Advanced' | 'Expert' | 'Master'
  minPoints: number
  maxPoints: number
  currentPoints: number
  pointsToNextLevel: number
  perks: string[]
}

// Tier System Types
export interface TutorTier {
  current: 'standard' | 'silver' | 'gold' | 'elite'
  startedAt: Date
  progress: TierProgress
  benefits: TierBenefit[]
  requirements: TierRequirements
}

export interface TierProgress {
  sessionsCompleted: number
  sessionsRequired: number
  currentRating: number
  requiredRating: number
  retentionRate: number
  requiredRetentionRate: number
  percentToNextTier: number
}

export interface TierBenefit {
  id: string
  type: 'rate_increase' | 'priority_matching' | 'advanced_tools' | 'bonus'
  description: string
  value: string | number
}

export interface TierRequirements {
  minSessions: number
  minRating: number
  minRetentionRate: number
}

// Monetary Types
export interface MonetaryBalance {
  pendingBonuses: number
  approvedBonuses: number
  paidBonuses: number
  totalEarned: number
  nextPayout: Date
  bonusHistory: BonusTransaction[]
}

export interface BonusTransaction {
  id: string
  type: BonusType
  amount: number
  status: 'pending' | 'approved' | 'paid'
  referenceId?: string
  referenceType?: string
  createdAt: Date
  paidAt?: Date
  description: string
}

export type BonusType = 
  | 'student_retention'      // $10/month after month 3
  | 'session_milestone'      // $25 per 5 sessions
  | 'quality_review'         // $5 per 5-star review
  | 'referral'              // $50 per converted referral
  | 'new_student'           // $15 when student completes 5th session
  | 'monthly_excellence'     // $50 for 95%+ attendance

// Badge Types
export interface Badge {
  id: string
  type: BadgeType
  name: string
  description: string
  icon: string
  earnedAt: Date
  progress?: number // For progressive badges
  tier: 'bronze' | 'silver' | 'gold' | 'platinum'
  metadata?: Record<string, any>
}

export type BadgeType =
  | 'session_milestone'    // 50, 100, 250, 500 sessions
  | 'retention_star'       // 10+ students for 3+ months
  | 'five_star_tutor'      // 4.8+ rating with 20+ reviews
  | 'elite_performer'      // Qualified for elite program
  | 'consistent_educator'  // 95%+ completion rate
  | 'quick_starter'        // 10 sessions in first month
  | 'marathon_tutor'       // 100+ hours completed
  | 'student_champion'     // 5+ students reached 20 sessions

// Achievement Types (for real-time notifications)
export interface GamificationAchievement {
  id: string
  type: AchievementType
  title: string
  description: string
  points: number
  timestamp: Date
  category: 'outcome' | 'activity' | 'milestone' | 'quality'
}

export type AchievementType =
  | 'student_milestone_reached'
  | 'retention_bonus_earned'
  | 'session_completed'
  | 'positive_feedback_received'
  | 'attendance_goal_met'
  | 'referral_converted'
  | 'first_session_completed'
  | 'badge_earned'
  | 'tier_promoted'
  | 'bonus_approved'

// Nudge Types
export interface Nudge {
  id: string
  type: NudgeType
  priority: 'low' | 'medium' | 'high' | 'critical'
  title: string
  message: string
  actionUrl?: string
  actionLabel?: string
  icon?: string
  expiresAt?: Date
  dismissible: boolean
  metadata?: Record<string, any>
}

export type NudgeType =
  | 'missing_learning_plan'
  | 'schedule_reminder'
  | 'engagement_alert'
  | 'ai_tool_suggestion'
  | 'student_at_risk'
  | 'achievement_near'
  | 'bonus_available'
  | 'profile_incomplete'
  | 'best_practice_tip'

// AI Tool Usage Types
export interface AIToolUsage {
  id: string
  tutorId: string
  toolType: AIToolType
  sessionId?: string
  studentId?: string
  outcomeMetrics: OutcomeMetrics
  createdAt: Date
}

export type AIToolType =
  | 'lesson_plan_generator'
  | 'student_analytics'
  | 'practice_generator'
  | 'progress_insights'

export interface OutcomeMetrics {
  engagementImprovement?: number
  learningVelocity?: number
  completionRate?: number
  studentSatisfaction?: number
  custom?: Record<string, any>
}

// Student Outcome Types
export interface StudentOutcome {
  id: string
  studentId: string
  tutorId: string
  metricType: OutcomeMetricType
  metricValue: number
  previousValue?: number
  improvement?: number
  measuredAt: Date
  metadata?: Record<string, any>
}

export type OutcomeMetricType =
  | 'grade_improvement'
  | 'test_score'
  | 'assignment_completion'
  | 'engagement_level'
  | 'attendance_rate'
  | 'homework_completion'
  | 'skill_mastery'
  | 'confidence_rating'

// Extended Profile Type
export interface GamifiedTutorProfile {
  // All existing TutorProfile fields
  id: string
  first_name: string
  last_name: string
  email: string
  // ... other existing fields
  
  // New gamification fields
  onboardingStatus: OnboardingStatus
  gamificationStats: GamificationStats
  currentTier: TutorTier
  monetaryBalance: MonetaryBalance
  nudgePreferences: NudgePreferences
  aiToolsEnabled: boolean
}

export interface NudgePreferences {
  enabledTypes: NudgeType[]
  emailNotifications: boolean
  inAppNotifications: boolean
  quietHours?: {
    start: string // "09:00"
    end: string   // "17:00"
    timezone: string
  }
}

// Leaderboard Types
export interface LeaderboardEntry {
  rank: number
  tutorId: string
  tutorName: string
  tutorAvatar?: string
  metric: number
  metricLabel: string
  change: 'up' | 'down' | 'same'
  changeAmount?: number
}

export interface Leaderboard {
  id: string
  type: LeaderboardType
  title: string
  description: string
  entries: LeaderboardEntry[]
  lastUpdated: Date
  timeframe: 'daily' | 'weekly' | 'monthly' | 'all-time'
}

export type LeaderboardType =
  | 'student_success'
  | 'engagement_improvement'
  | 'retention_rate'
  | 'session_completion'
  | 'monthly_points'
  | 'student_champions'

// Constants
export const BONUS_AMOUNTS: Record<BonusType, number> = {
  student_retention: 10,
  session_milestone: 25,
  quality_review: 5,
  referral: 50,
  new_student: 15,
  monthly_excellence: 50
}

export const TIER_REQUIREMENTS: Record<string, TierRequirements> = {
  silver: { minSessions: 50, minRating: 4.5, minRetentionRate: 80 },
  gold: { minSessions: 150, minRating: 4.7, minRetentionRate: 85 },
  elite: { minSessions: 300, minRating: 4.8, minRetentionRate: 90 }
}

export const POINTS_VALUES = {
  studentMilestone: 75,
  monthlyRetention: 50,
  sessionCompletion: 25,
  positiveReview: 50,
  highAttendance: 30,
  referralConversion: 100,
  firstSession: 20,
  tenSessionMilestone: 100
} as const 