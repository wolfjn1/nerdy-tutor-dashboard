import { SupabaseClient } from '@supabase/supabase-js';
import { Achievement } from '@/components/gamification/AchievementToast';

export class AchievementManager {
  private supabase: SupabaseClient;
  private achievementQueue: Achievement[] = [];
  private listeners: ((achievement: Achievement) => void)[] = [];

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Subscribe to achievement notifications
   */
  subscribe(listener: (achievement: Achievement) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners of a new achievement
   */
  private notify(achievement: Achievement) {
    this.listeners.forEach(listener => listener(achievement));
  }

  /**
   * Create achievement for points earned
   */
  async createPointsAchievement(tutorId: string, points: number, reason: string) {
    const achievement: Achievement = {
      id: `points-${Date.now()}`,
      type: 'points',
      title: 'Points Earned!',
      description: this.formatPointsDescription(reason),
      points
    };

    this.notify(achievement);
    await this.saveAchievement(tutorId, achievement);
  }

  /**
   * Create achievement for milestone reached
   */
  async createMilestoneAchievement(tutorId: string, milestoneType: string, value: number) {
    const achievement: Achievement = {
      id: `milestone-${Date.now()}`,
      type: 'milestone',
      title: this.getMilestoneTitle(milestoneType, value),
      description: this.getMilestoneDescription(milestoneType, value)
    };

    this.notify(achievement);
    await this.saveAchievement(tutorId, achievement);
  }

  /**
   * Create achievement for level up
   */
  async createLevelUpAchievement(tutorId: string, newLevel: string, totalPoints: number) {
    const achievement: Achievement = {
      id: `levelup-${Date.now()}`,
      type: 'level_up',
      title: `Level Up! You're now ${newLevel}`,
      description: `You've reached ${totalPoints.toLocaleString()} total points!`
    };

    this.notify(achievement);
    await this.saveAchievement(tutorId, achievement);
  }

  /**
   * Create achievement for tier promotion
   */
  async createTierPromotionAchievement(tutorId: string, newTier: string, benefits: string) {
    const achievement: Achievement = {
      id: `tier-${Date.now()}`,
      type: 'tier_promotion',
      title: `Promoted to ${newTier} Tier!`,
      description: benefits
    };

    this.notify(achievement);
    await this.saveAchievement(tutorId, achievement);
  }

  /**
   * Create achievement for streak maintained
   */
  async createStreakAchievement(tutorId: string, streakDays: number) {
    const achievement: Achievement = {
      id: `streak-${Date.now()}`,
      type: 'streak',
      title: `${streakDays} Day Streak!`,
      description: 'Keep up the consistent tutoring!'
    };

    this.notify(achievement);
    await this.saveAchievement(tutorId, achievement);
  }

  /**
   * Create achievement for bonus earned
   */
  async createBonusAchievement(tutorId: string, bonusType: string, amount: number) {
    const achievement: Achievement = {
      id: `bonus-${Date.now()}`,
      type: 'bonus',
      title: 'Bonus Earned!',
      description: `${this.formatBonusType(bonusType)}: $${amount.toFixed(2)}`
    };

    this.notify(achievement);
    await this.saveAchievement(tutorId, achievement);
  }

  /**
   * Check for achievements after an event
   */
  async checkAchievements(tutorId: string, eventType: string, eventData: any) {
    switch (eventType) {
      case 'points_earned':
        await this.checkPointsAchievements(tutorId, eventData);
        break;
      case 'session_completed':
        await this.checkSessionAchievements(tutorId, eventData);
        break;
      case 'bonus_earned':
        await this.checkBonusAchievements(tutorId, eventData);
        break;
      // Add more event types as needed
    }
  }

  /**
   * Check for points-related achievements
   */
  private async checkPointsAchievements(tutorId: string, data: any) {
    // Check if user leveled up
    const oldLevel = this.calculateLevel(data.oldTotal);
    const newLevel = this.calculateLevel(data.newTotal);
    
    if (oldLevel !== newLevel) {
      await this.createLevelUpAchievement(tutorId, newLevel, data.newTotal);
    }

    // Check for point milestones
    const milestones = [100, 500, 1000, 5000, 10000, 25000, 50000, 100000];
    for (const milestone of milestones) {
      if (data.oldTotal < milestone && data.newTotal >= milestone) {
        await this.createMilestoneAchievement(tutorId, 'points', milestone);
      }
    }
  }

  /**
   * Check for session-related achievements
   */
  private async checkSessionAchievements(tutorId: string, data: any) {
    // Check for session milestones
    const sessionMilestones = [10, 25, 50, 100, 250, 500, 1000];
    for (const milestone of sessionMilestones) {
      if (data.totalSessions === milestone) {
        await this.createMilestoneAchievement(tutorId, 'sessions', milestone);
      }
    }

    // Check for streak achievements
    if (data.currentStreak > 0 && data.currentStreak % 7 === 0) {
      await this.createStreakAchievement(tutorId, data.currentStreak);
    }
  }

  /**
   * Check for bonus-related achievements
   */
  private async checkBonusAchievements(tutorId: string, data: any) {
    if (data.amount > 0) {
      await this.createBonusAchievement(tutorId, data.bonusType, data.amount);
    }
  }

  /**
   * Save achievement to database (optional)
   */
  private async saveAchievement(tutorId: string, achievement: Achievement) {
    // You could save achievements to a table for history
    // For now, we'll just log them
    console.log('Achievement earned:', tutorId, achievement);
    
    // Optional: Save to database
    // await this.supabase
    //   .from('achievements')
    //   .insert({
    //     tutor_id: tutorId,
    //     type: achievement.type,
    //     title: achievement.title,
    //     description: achievement.description,
    //     points: achievement.points,
    //     created_at: new Date().toISOString()
    //   });
  }

  // Helper methods

  private formatPointsDescription(reason: string): string {
    const descriptions: Record<string, string> = {
      sessionCompletion: 'Completed 5 tutoring sessions',
      firstSession: 'First session with a new student',
      tenSessionMilestone: 'Student reached 10 sessions',
      positiveReview: 'Received a positive review',
      monthlyRetention: 'Student retention bonus',
      highAttendance: 'Maintained high attendance rate',
      referralConversion: 'Successful student referral',
      studentMilestone: 'Student reached a learning milestone'
    };
    return descriptions[reason] || 'Great work!';
  }

  private getMilestoneTitle(type: string, value: number): string {
    switch (type) {
      case 'points':
        return `${value.toLocaleString()} Points!`;
      case 'sessions':
        return `${value} Sessions Completed!`;
      case 'students':
        return `${value} Students Helped!`;
      default:
        return 'Milestone Reached!';
    }
  }

  private getMilestoneDescription(type: string, value: number): string {
    switch (type) {
      case 'points':
        return `You've earned a total of ${value.toLocaleString()} points!`;
      case 'sessions':
        return `You've completed ${value} tutoring sessions!`;
      case 'students':
        return `You've helped ${value} students on their learning journey!`;
      default:
        return 'Keep up the amazing work!';
    }
  }

  private formatBonusType(bonusType: string): string {
    const types: Record<string, string> = {
      student_retention: 'Student Retention Bonus',
      session_milestone: 'Session Milestone Bonus',
      quality_review: '5-Star Review Bonus',
      referral_bonus: 'Referral Bonus',
      new_student_bonus: 'New Student Bonus',
      monthly_excellence: 'Monthly Excellence Bonus'
    };
    return types[bonusType] || 'Bonus';
  }

  private calculateLevel(points: number): string {
    if (points >= 10001) return 'Master';
    if (points >= 5001) return 'Expert';
    if (points >= 2001) return 'Advanced';
    if (points >= 501) return 'Proficient';
    return 'Beginner';
  }
} 