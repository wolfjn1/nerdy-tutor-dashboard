import { createClient } from '@supabase/supabase-js'
import { 
  GamificationStats, 
  TutorLevel, 
  Badge, 
  BadgeType,
  BonusType,
  TutorTier,
  GamificationAchievement,
  AchievementType
} from '../types/gamification'
import { 
  POINTS_VALUES, 
  BADGE_DEFINITIONS, 
  TIER_REQUIREMENTS, 
  TIER_BENEFITS,
  BONUS_AMOUNTS,
  TUTOR_LEVELS,
  PROGRESSIVE_BADGE_THRESHOLDS
} from './constants'
import { BadgeManager } from './BadgeManager'

export type PointsReason = keyof typeof POINTS_VALUES

// Database response types
interface GamificationPointsRow {
  id: string
  tutor_id: string
  points: number
  reason: string
  reference_id?: string
  reference_type?: string
  created_at: string
  metadata?: any
}

interface TutorBadgeRow {
  id: string
  tutor_id: string
  badge_type: string
  earned_at: string
  metadata?: any
}

export class GamificationEngine {
  private supabase: ReturnType<typeof createClient>

  constructor(supabaseClient: ReturnType<typeof createClient>) {
    this.supabase = supabaseClient
  }

  /**
   * Award points to a tutor for an achievement
   */
  async awardPoints(
    tutorId: string,
    reason: PointsReason,
    referenceId?: string,
    referenceType?: string
  ): Promise<void> {
    try {
      // Calculate points based on reason
      const points = this.calculatePoints(reason)
      
      // Record the points transaction
      await this.recordPoints(tutorId, points, reason, referenceId, referenceType)
      
      // Check for new achievements
      await this.checkForBadges(tutorId)
      await this.checkForLevelUp(tutorId)
      await this.checkForTierPromotion(tutorId)
      
      // Create achievement notification
      await this.createAchievementNotification(tutorId, reason, points)
    } catch (error) {
      console.error('Error awarding points:', error)
      throw error
    }
  }

  /**
   * Calculate points based on the achievement reason
   */
  calculatePoints(reason: PointsReason): number {
    return POINTS_VALUES[reason] || 0
  }

  /**
   * Record points transaction in the database
   */
  async recordPoints(
    tutorId: string,
    points: number,
    reason: string,
    referenceId?: string,
    referenceType?: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('gamification_points')
      .insert({
        tutor_id: tutorId,
        points,
        reason,
        reference_id: referenceId,
        reference_type: referenceType,
        metadata: { timestamp: new Date().toISOString() }
      })

    if (error) {
      throw new Error(`Failed to record points: ${error.message}`)
    }
  }

  /**
   * Get current gamification stats for a tutor
   */
  async getTutorStats(tutorId: string): Promise<GamificationStats> {
    try {
      // Get total points
      const { data: pointsData, error: pointsError } = await this.supabase
        .from('gamification_points')
        .select('points')
        .eq('tutor_id', tutorId) as { data: Pick<GamificationPointsRow, 'points'>[] | null, error: any }

      if (pointsError) throw pointsError

      const totalPoints = pointsData?.reduce((sum, record) => sum + record.points, 0) || 0

      // Get current level
      const currentLevel = this.calculateLevel(totalPoints)

      // Get badges
      const badges = await this.getTutorBadges(tutorId)

      // Get recent achievements
      const recentAchievements = await this.getRecentAchievements(tutorId)

      // Get points this month/week
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const startOfWeek = new Date(now)
      startOfWeek.setDate(now.getDate() - now.getDay())

      const { data: monthPoints } = await this.supabase
        .from('gamification_points')
        .select('points')
        .eq('tutor_id', tutorId)
        .gte('created_at', startOfMonth.toISOString()) as { data: Pick<GamificationPointsRow, 'points'>[] | null, error: any }

      const { data: weekPoints } = await this.supabase
        .from('gamification_points')
        .select('points')
        .eq('tutor_id', tutorId)
        .gte('created_at', startOfWeek.toISOString()) as { data: Pick<GamificationPointsRow, 'points'>[] | null, error: any }

      const pointsThisMonth = monthPoints?.reduce((sum, record) => sum + record.points, 0) || 0
      const pointsThisWeek = weekPoints?.reduce((sum, record) => sum + record.points, 0) || 0

      // TODO: Calculate leaderboard rank (would need to query all tutors)
      const leaderboardRank = undefined

      return {
        totalPoints,
        currentLevel,
        badges,
        recentAchievements,
        leaderboardRank,
        pointsThisMonth,
        pointsThisWeek
      }
    } catch (error) {
      console.error('Error getting tutor stats:', error)
      throw error
    }
  }

  /**
   * Calculate current level based on total points
   */
  private calculateLevel(totalPoints: number): TutorLevel {
    const level = TUTOR_LEVELS.find(
      l => totalPoints >= l.minPoints && totalPoints <= l.maxPoints
    ) || TUTOR_LEVELS[0]

    return {
      name: level.name as any,
      minPoints: level.minPoints,
      maxPoints: level.maxPoints === Infinity ? 999999 : level.maxPoints,
      currentPoints: totalPoints,
      pointsToNextLevel: level.maxPoints === Infinity ? 0 : level.maxPoints - totalPoints + 1,
      perks: this.getLevelPerks(level.name)
    }
  }

  /**
   * Get perks for a specific level
   */
  private getLevelPerks(levelName: string): string[] {
    const perks: Record<string, string[]> = {
      Beginner: ['Access to basic dashboard', 'Standard support'],
      Proficient: ['Priority support', 'Basic analytics'],
      Advanced: ['Advanced analytics', 'Custom branding options'],
      Expert: ['AI tools beta access', 'Dedicated account manager'],
      Master: ['All platform features', 'VIP support', 'Special recognition']
    }
    return perks[levelName] || []
  }

  /**
   * Get tutor's earned badges
   */
  private async getTutorBadges(tutorId: string): Promise<Badge[]> {
    const { data, error } = await this.supabase
      .from('tutor_badges')
      .select('*')
      .eq('tutor_id', tutorId) as { data: TutorBadgeRow[] | null, error: any }

    if (error) {
      console.error('Error fetching badges:', error)
      return []
    }

    return data?.map(badge => {
      const definition = BADGE_DEFINITIONS[badge.badge_type as BadgeType]
      return {
        id: badge.id,
        type: badge.badge_type as BadgeType,
        name: definition?.name || badge.badge_type,
        description: definition?.description || '',
        icon: definition?.icon || '🏅',
        earnedAt: new Date(badge.earned_at),
        tier: definition?.tier || 'bronze',
        metadata: badge.metadata
      }
    }) || []
  }

  /**
   * Get recent achievements for activity feed
   */
  private async getRecentAchievements(tutorId: string, limit: number = 10): Promise<GamificationAchievement[]> {
    const { data, error } = await this.supabase
      .from('gamification_points')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('created_at', { ascending: false })
      .limit(limit) as { data: GamificationPointsRow[] | null, error: any }

    if (error) {
      console.error('Error fetching achievements:', error)
      return []
    }

    return data?.map(record => ({
      id: record.id,
      type: this.mapReasonToAchievementType(record.reason),
      title: this.getAchievementTitle(record.reason),
      description: this.getAchievementDescription(record.reason, record.points),
      points: record.points,
      timestamp: new Date(record.created_at),
      category: this.getAchievementCategory(record.reason)
    })) || []
  }

  /**
   * Check if tutor has earned any new badges
   */
  private async checkForBadges(tutorId: string): Promise<void> {
    // Use BadgeManager for comprehensive badge checking
    const badgeManager = new BadgeManager(this.supabase)
    await badgeManager.checkAndAwardBadges(tutorId)
  }

  /**
   * Check if tutor should level up
   */
  private async checkForLevelUp(tutorId: string): Promise<void> {
    const stats = await this.getTutorStats(tutorId)
    const newLevel = this.calculateLevel(stats.totalPoints)
    
    // Compare with stored level (if tracking separately)
    // If leveled up, create notification
    if (stats.currentLevel.name !== newLevel.name) {
      await this.createLevelUpNotification(tutorId, newLevel)
    }
  }

  /**
   * Check if tutor should be promoted to a new tier
   */
  async checkForTierPromotion(tutorId: string): Promise<void> {
    const tutorData = await this.getTutorData(tutorId)
    const currentTier = await this.getCurrentTier(tutorId)
    const newTier = this.calculateTier(tutorData)
    
    if (newTier !== currentTier) {
      await this.promoteTier(tutorId, newTier)
      await this.adjustBaseRate(tutorId, newTier)
    }
  }

  /**
   * Calculate monetary bonus for an achievement
   */
  async calculateMonetaryBonus(
    tutorId: string,
    type: BonusType,
    referenceId: string
  ): Promise<number> {
    const amount = BONUS_AMOUNTS[type]
    
    // Record the bonus
    await this.recordBonus(tutorId, type, amount, referenceId)
    
    return amount
  }

  /**
   * Record a monetary bonus
   */
  private async recordBonus(
    tutorId: string,
    type: BonusType,
    amount: number,
    referenceId: string
  ): Promise<void> {
    const { error } = await this.supabase
      .from('tutor_bonuses')
      .insert({
        tutor_id: tutorId,
        bonus_type: type,
        amount,
        reference_id: referenceId,
        reference_type: this.getBonusReferenceType(type),
        status: 'pending'
      })

    if (error) {
      throw new Error(`Failed to record bonus: ${error.message}`)
    }
  }

  // Helper methods
  private async getTutorData(tutorId: string): Promise<any> {
    // Fetch comprehensive tutor data including sessions, ratings, students
    const { data: tutor } = await this.supabase
      .from('tutors')
      .select('*, sessions(*), students(*)')
      .eq('id', tutorId)
      .single()
    
    return tutor
  }

  private async hasBadge(tutorId: string, badgeType: BadgeType): Promise<boolean> {
    const { data } = await this.supabase
      .from('tutor_badges')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('badge_type', badgeType)
      .single()
    
    return !!data
  }

  private async checkBadgeQualification(
    tutorId: string, 
    badgeType: BadgeType, 
    tutorData: any
  ): Promise<boolean> {
    const definition = BADGE_DEFINITIONS[badgeType]
    
    switch (definition.requirement.type) {
      case 'count':
        return this.checkCountRequirement(tutorData, definition.requirement)
      case 'rate':
        return this.checkRateRequirement(tutorData, definition.requirement)
      case 'achievement':
        return this.checkAchievementRequirement(tutorData, definition.requirement)
      default:
        return false
    }
  }

  private checkCountRequirement(tutorData: any, requirement: any): boolean {
    switch (requirement.metric) {
      case 'sessions':
        return tutorData.sessions?.length >= requirement.value
      case 'total_hours':
        return tutorData.total_hours >= requirement.value
      case 'retained_students':
        // Check students with 3+ months
        return this.countRetainedStudents(tutorData.students) >= requirement.value
      default:
        return false
    }
  }

  private checkRateRequirement(tutorData: any, requirement: any): boolean {
    switch (requirement.metric) {
      case 'rating':
        return tutorData.rating >= requirement.value
      case 'completion_rate':
        return this.calculateCompletionRate(tutorData.sessions) >= requirement.value
      default:
        return false
    }
  }

  private checkAchievementRequirement(tutorData: any, requirement: any): boolean {
    // Check for specific achievements like elite qualification
    return this.checkEliteQualification(tutorData)
  }

  private async checkProgressiveBadges(tutorId: string, tutorData: any): Promise<void> {
    // Check badges that have multiple levels
    for (const [metric, thresholds] of Object.entries(PROGRESSIVE_BADGE_THRESHOLDS)) {
      const currentValue = this.getMetricValue(tutorData, metric)
      
      for (const threshold of thresholds) {
        if (currentValue >= threshold) {
          const badgeType = `${metric}_${threshold}` as BadgeType
          const hasEarned = await this.hasBadge(tutorId, badgeType)
          
          if (!hasEarned) {
            await this.awardBadge(tutorId, badgeType)
          }
        }
      }
    }
  }

  private async awardBadge(tutorId: string, badgeType: BadgeType): Promise<void> {
    const { error } = await this.supabase
      .from('tutor_badges')
      .insert({
        tutor_id: tutorId,
        badge_type: badgeType,
        metadata: { 
          awardedAt: new Date().toISOString(),
          definition: BADGE_DEFINITIONS[badgeType]
        }
      })

    if (error) {
      console.error('Error awarding badge:', error)
    } else {
      // Award points for earning a badge
      await this.awardPoints(tutorId, 'firstSession', badgeType, 'badge')
    }
  }

  private async getCurrentTier(tutorId: string): Promise<string> {
    const { data } = await this.supabase
      .from('tutor_tiers')
      .select('current_tier')
      .eq('tutor_id', tutorId)
      .single() as { data: { current_tier: string } | null, error: any }
    
    return data?.current_tier || 'standard'
  }

  private calculateTier(tutorData: any): string {
    const sessions = tutorData.sessions?.filter((s: any) => s.status === 'completed').length || 0
    const rating = tutorData.rating || 0
    const retentionRate = this.calculateRetentionRate(tutorData.students) || 0
    
    // Check tiers from highest to lowest
    if (
      sessions >= TIER_REQUIREMENTS.elite.minSessions &&
      rating >= TIER_REQUIREMENTS.elite.minRating &&
      retentionRate >= TIER_REQUIREMENTS.elite.minRetentionRate
    ) {
      return 'elite'
    }
    
    if (
      sessions >= TIER_REQUIREMENTS.gold.minSessions &&
      rating >= TIER_REQUIREMENTS.gold.minRating &&
      retentionRate >= TIER_REQUIREMENTS.gold.minRetentionRate
    ) {
      return 'gold'
    }
    
    if (
      sessions >= TIER_REQUIREMENTS.silver.minSessions &&
      rating >= TIER_REQUIREMENTS.silver.minRating &&
      retentionRate >= TIER_REQUIREMENTS.silver.minRetentionRate
    ) {
      return 'silver'
    }
    
    return 'standard'
  }

  private async promoteTier(tutorId: string, newTier: string): Promise<void> {
    const { error } = await this.supabase
      .from('tutor_tiers')
      .upsert({
        tutor_id: tutorId,
        current_tier: newTier,
        tier_started_at: new Date().toISOString()
      })

    if (error) {
      console.error('Error promoting tier:', error)
    }
  }

  private async adjustBaseRate(tutorId: string, tier: string): Promise<void> {
    const benefits = TIER_BENEFITS[tier as keyof typeof TIER_BENEFITS]
    if (!benefits) return
    
    // Calculate new rate based on tier increase
    const { data: tutor } = await this.supabase
      .from('tutors')
      .select('hourly_rate')
      .eq('id', tutorId)
      .single() as { data: { hourly_rate: number } | null, error: any }
    
    if (tutor) {
      const baseRate = tutor.hourly_rate / (1 + (TIER_BENEFITS[await this.getCurrentTier(tutorId) as keyof typeof TIER_BENEFITS]?.rateIncrease || 0) / 100)
      const newRate = Math.round(baseRate * (1 + benefits.rateIncrease / 100))
      
      await this.supabase
        .from('tutors')
        .update({ hourly_rate: newRate })
        .eq('id', tutorId)
    }
  }

  // Utility methods
  private countRetainedStudents(students: any[]): number {
    if (!students) return 0
    
    const threeMonthsAgo = new Date()
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3)
    
    return students.filter(s => 
      s.is_active && 
      new Date(s.created_at) <= threeMonthsAgo
    ).length
  }

  private calculateCompletionRate(sessions: any[]): number {
    if (!sessions || sessions.length === 0) return 0
    
    const completed = sessions.filter(s => s.status === 'completed').length
    return (completed / sessions.length) * 100
  }

  private calculateRetentionRate(students: any[]): number {
    if (!students || students.length === 0) return 0
    
    const active = students.filter(s => s.is_active).length
    return (active / students.length) * 100
  }

  private checkEliteQualification(tutorData: any): boolean {
    return this.calculateTier(tutorData) === 'elite'
  }

  private getMetricValue(tutorData: any, metric: string): number {
    switch (metric) {
      case 'session_milestone':
        return tutorData.sessions?.filter((s: any) => s.status === 'completed').length || 0
      case 'total_hours':
        return tutorData.total_hours || 0
      case 'students_helped':
        return tutorData.students?.length || 0
      case 'five_star_reviews':
        return tutorData.sessions?.filter((s: any) => s.rating === 5).length || 0
      default:
        return 0
    }
  }

  private mapReasonToAchievementType(reason: string): AchievementType {
    const mapping: Record<string, AchievementType> = {
      studentMilestone: 'student_milestone_reached',
      monthlyRetention: 'retention_bonus_earned',
      sessionCompletion: 'session_completed',
      positiveReview: 'positive_feedback_received',
      highAttendance: 'attendance_goal_met',
      referralConversion: 'referral_converted',
      firstSession: 'first_session_completed'
    }
    return mapping[reason] || 'session_completed'
  }

  private getAchievementTitle(reason: string): string {
    const titles: Record<string, string> = {
      studentMilestone: 'Student Milestone Achieved!',
      monthlyRetention: 'Student Retention Bonus',
      sessionCompletion: 'Session Milestone Reached',
      positiveReview: 'Excellent Review Received',
      highAttendance: 'Outstanding Attendance',
      referralConversion: 'Referral Success',
      firstSession: 'First Session Complete'
    }
    return titles[reason] || 'Achievement Unlocked'
  }

  private getAchievementDescription(reason: string, points: number): string {
    return `You earned ${points} points for ${reason.replace(/([A-Z])/g, ' $1').toLowerCase()}`
  }

  private getAchievementCategory(reason: string): 'outcome' | 'activity' | 'milestone' | 'quality' {
    const categories: Record<string, 'outcome' | 'activity' | 'milestone' | 'quality'> = {
      studentMilestone: 'outcome',
      monthlyRetention: 'outcome',
      sessionCompletion: 'milestone',
      positiveReview: 'quality',
      highAttendance: 'quality',
      referralConversion: 'outcome',
      firstSession: 'activity'
    }
    return categories[reason] || 'activity'
  }

  private getBonusReferenceType(bonusType: BonusType): string {
    const types: Record<BonusType, string> = {
      student_retention: 'student',
      session_milestone: 'session',
      quality_review: 'review',
      referral: 'student',
      new_student: 'student',
      monthly_excellence: 'monthly_stats'
    }
    return types[bonusType]
  }

  private async createAchievementNotification(
    tutorId: string, 
    reason: PointsReason, 
    points: number
  ): Promise<void> {
    // Create notification in the notifications table
    await this.supabase
      .from('notifications')
      .insert({
        tutor_id: tutorId,
        title: this.getAchievementTitle(reason),
        message: this.getAchievementDescription(reason, points),
        type: 'success',
        category: 'achievement'
      })
  }

  private async createLevelUpNotification(
    tutorId: string, 
    newLevel: TutorLevel
  ): Promise<void> {
    await this.supabase
      .from('notifications')
      .insert({
        tutor_id: tutorId,
        title: `Level Up! You're now ${newLevel.name}`,
        message: `Congratulations on reaching ${newLevel.name} level with ${newLevel.currentPoints} points!`,
        type: 'success',
        category: 'achievement'
      })
  }
} 