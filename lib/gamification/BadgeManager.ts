import { SupabaseClient } from '@supabase/supabase-js';
import { BadgeType } from '../types/gamification';
import { BADGE_DEFINITIONS } from './constants';

export class BadgeManager {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Check and award badges for a tutor based on their current stats
   */
  async checkAndAwardBadges(tutorId: string): Promise<BadgeType[]> {
    const awardedBadges: BadgeType[] = [];

    try {
      // Get current badges to avoid duplicates
      const { data: existingBadges } = await this.supabase
        .from('tutor_badges')
        .select('badge_type')
        .eq('tutor_id', tutorId);

      const existingTypes = new Set(existingBadges?.map(b => b.badge_type) || []);

      // Check each badge type
      for (const badgeType of Object.keys(BADGE_DEFINITIONS) as BadgeType[]) {
        if (!existingTypes.has(badgeType)) {
          const earned = await this.checkBadgeRequirement(tutorId, badgeType);
          if (earned) {
            await this.awardBadge(tutorId, badgeType);
            awardedBadges.push(badgeType);
          }
        }
      }

      return awardedBadges;
    } catch (error) {
      console.error('Error checking badges:', error);
      throw error;
    }
  }

  /**
   * Check if a specific badge requirement is met
   */
  private async checkBadgeRequirement(tutorId: string, badgeType: BadgeType): Promise<boolean> {
    const definition = BADGE_DEFINITIONS[badgeType];
    if (!definition) return false;

    switch (badgeType) {
      case 'session_milestone':
        return await this.checkSessionMilestone(tutorId);
      
      case 'retention_star':
        return await this.checkRetentionStar(tutorId);
      
      case 'five_star_tutor':
        return await this.checkFiveStarTutor(tutorId);
      
      case 'quick_starter':
        return await this.checkQuickStarter(tutorId);
      
      case 'student_champion':
        return await this.checkStudentChampion(tutorId);
      
      case 'consistent_educator':
        return await this.checkConsistentEducator(tutorId);
      
      case 'elite_performer':
        return await this.checkElitePerformer(tutorId);
      
      case 'marathon_tutor':
        return await this.checkMarathonTutor(tutorId);
      
      default:
        return false;
    }
  }

  /**
   * Award a badge to a tutor
   */
  private async awardBadge(tutorId: string, badgeType: BadgeType): Promise<void> {
    const { error } = await this.supabase
      .from('tutor_badges')
      .insert({
        tutor_id: tutorId,
        badge_type: badgeType,
        earned_at: new Date().toISOString(),
        metadata: {
          definition: BADGE_DEFINITIONS[badgeType]
        }
      });

    if (error) {
      throw new Error(`Failed to award badge: ${error.message}`);
    }

    // Create notification for badge award
    await this.createBadgeNotification(tutorId, badgeType);
  }

  // Badge requirement check methods

  private async checkSessionMilestone(tutorId: string): Promise<boolean> {
    const { count } = await this.supabase
      .from('tutoring_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_id', tutorId)
      .eq('status', 'completed');

    // Check if any milestone is reached (50, 100, 250, 500)
    const milestones = [50, 100, 250, 500];
    return milestones.includes(count || 0);
  }

  private async checkRetentionStar(tutorId: string): Promise<boolean> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data, count } = await this.supabase
      .from('students')
      .select(`
        id,
        created_at,
        tutoring_sessions!inner(
          id,
          tutor_id,
          session_date
        )
      `, { count: 'exact' })
      .eq('tutoring_sessions.tutor_id', tutorId)
      .lte('created_at', threeMonthsAgo.toISOString());

    return (count || 0) >= 10;
  }

  private async checkFiveStarTutor(tutorId: string): Promise<boolean> {
    const { data: reviews } = await this.supabase
      .from('reviews')
      .select('rating')
      .eq('tutor_id', tutorId)
      .gte('rating', 4);

    if (!reviews || reviews.length < 20) return false;

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    return avgRating >= 4.8;
  }

  private async checkQuickStarter(tutorId: string): Promise<boolean> {
    const { data: profile } = await this.supabase
      .from('profiles')
      .select('created_at')
      .eq('id', tutorId)
      .single();

    if (!profile) return false;

    const oneMonthAfterJoin = new Date(profile.created_at);
    oneMonthAfterJoin.setMonth(oneMonthAfterJoin.getMonth() + 1);

    const { count } = await this.supabase
      .from('tutoring_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_id', tutorId)
      .eq('status', 'completed')
      .lte('session_date', oneMonthAfterJoin.toISOString());

    return (count || 0) >= 10;
  }

  private async checkStudentChampion(tutorId: string): Promise<boolean> {
    const { data: students } = await this.supabase
      .from('students')
      .select(`
        id,
        tutoring_sessions!inner(
          id,
          tutor_id
        )
      `)
      .eq('tutoring_sessions.tutor_id', tutorId);

    if (!students) return false;

    let championsCount = 0;
    for (const student of students) {
      const { count } = await this.supabase
        .from('tutoring_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('student_id', student.id)
        .eq('tutor_id', tutorId)
        .eq('status', 'completed');

      if ((count || 0) >= 20) {
        championsCount++;
      }
    }

    return championsCount >= 5;
  }

  private async checkConsistentEducator(tutorId: string): Promise<boolean> {
    const { data: sessions } = await this.supabase
      .from('tutoring_sessions')
      .select('status')
      .eq('tutor_id', tutorId)
      .limit(50);

    if (!sessions || sessions.length < 50) return false;

    const completedCount = sessions.filter(s => s.status === 'completed').length;
    return (completedCount / sessions.length) >= 0.95;
  }

  private async checkElitePerformer(tutorId: string): Promise<boolean> {
    // Check if tutor has reached elite tier
    const { data: tierInfo } = await this.supabase
      .from('tutor_tiers')
      .select('current_tier')
      .eq('tutor_id', tutorId)
      .single();

    return tierInfo?.current_tier === 'elite';
  }

  private async checkMarathonTutor(tutorId: string): Promise<boolean> {
    // Check if tutor has completed 100+ hours
    const { data: sessions } = await this.supabase
      .from('tutoring_sessions')
      .select('duration_minutes')
      .eq('tutor_id', tutorId)
      .eq('status', 'completed');

    if (!sessions) return false;

    const totalMinutes = sessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const totalHours = totalMinutes / 60;

    return totalHours >= 100;
  }

  /**
   * Check specific milestone badges after events
   */
  async checkOnboardingBadge(tutorId: string): Promise<boolean> {
    // Check if all onboarding steps are complete
    const { data } = await this.supabase
      .from('tutor_onboarding')
      .select('step_completed')
      .eq('tutor_id', tutorId);

    const steps = data?.map(d => d.step_completed) || [];
    const requiredSteps = ['welcome', 'profile_setup', 'best_practices', 'ai_tools_intro', 'first_student_guide'];
    
    const allComplete = requiredSteps.every(step => steps.includes(step));
    
    if (allComplete) {
      // Award a special milestone badge (using session_milestone as a stand-in)
      // In production, you might have a separate onboarding badge type
      const { data: existing } = await this.supabase
        .from('tutor_badges')
        .select('id')
        .eq('tutor_id', tutorId)
        .eq('badge_type', 'quick_starter')
        .single();
      
      if (!existing) {
        await this.awardBadge(tutorId, 'quick_starter');
        return true;
      }
    }
    
    return false;
  }

  /**
   * Create a notification for badge award
   */
  private async createBadgeNotification(tutorId: string, badgeType: BadgeType): Promise<void> {
    const definition = BADGE_DEFINITIONS[badgeType];
    
    // In a real implementation, this would create an in-app notification
    // For now, we'll just log it
    console.log(`Badge awarded to ${tutorId}: ${definition.name}`);
    
    // You could also emit an event or update a notifications table
    // await this.supabase
    //   .from('notifications')
    //   .insert({
    //     user_id: tutorId,
    //     type: 'badge_earned',
    //     title: 'New Badge Earned!',
    //     message: `Congratulations! You've earned the "${definition.name}" badge!`,
    //     data: { badgeType }
    //   });
  }

  /**
   * Get badge progress for a tutor
   */
  async getBadgeProgress(tutorId: string): Promise<Record<string, number>> {
    const progress: Record<string, number> = {};

    // Session milestone progress
    const { count: sessionCount } = await this.supabase
      .from('tutoring_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_id', tutorId)
      .eq('status', 'completed');

    const milestones = [50, 100, 250, 500];
    const nextMilestone = milestones.find(m => (sessionCount || 0) < m) || 1000;
    progress.session_milestone = Math.min(((sessionCount || 0) / nextMilestone) * 100, 100);

    // Retention star progress
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    const { count: retainedCount } = await this.supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('tutor_id', tutorId)
      .lte('created_at', threeMonthsAgo.toISOString());
    
    progress.retention_star = Math.min(((retainedCount || 0) / 10) * 100, 100);

    // Marathon tutor progress (100 hours)
    const { data: sessions } = await this.supabase
      .from('tutoring_sessions')
      .select('duration_minutes')
      .eq('tutor_id', tutorId)
      .eq('status', 'completed');
    
    const totalHours = (sessions?.reduce((sum, s) => sum + (s.duration_minutes || 0), 0) || 0) / 60;
    progress.marathon_tutor = Math.min((totalHours / 100) * 100, 100);

    // Add other badge progress calculations as needed...

    return progress;
  }
} 