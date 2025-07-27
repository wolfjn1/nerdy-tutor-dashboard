import { SupabaseClient } from '@supabase/supabase-js';
import { GamificationEngine } from './GamificationEngine';
import { AchievementManager } from './AchievementManager';

export class PointsTriggers {
  private supabase: SupabaseClient;
  private engine: GamificationEngine;
  private achievementManager: AchievementManager;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
    this.engine = new GamificationEngine(supabase as any);
    this.achievementManager = new AchievementManager(supabase as any);
  }

  /**
   * Award points when a session is completed
   */
  async onSessionCompleted(sessionId: string, tutorId: string) {
    try {
      // Note: sessionCompletion is awarded every 5 sessions, not for each session
      // Check if this is a milestone session (every 5 sessions)
      const { data: sessionCount } = await this.supabase
        .from('tutoring_sessions')
        .select('id', { count: 'exact' })
        .eq('tutor_id', tutorId)
        .eq('status', 'completed');
      
      const count = sessionCount?.length || 0;
      
      if (count > 0 && count % 5 === 0) {
        await this.engine.awardPoints(
          tutorId,
          'sessionCompletion'
        );
      }

      // Check if this is the first session with a new student
      const { data: session } = await this.supabase
        .from('tutoring_sessions')
        .select('student_id')
        .eq('id', sessionId)
        .single();

      if (session) {
        const { data: previousSessions } = await this.supabase
          .from('tutoring_sessions')
          .select('id')
          .eq('tutor_id', tutorId)
          .eq('student_id', session.student_id)
          .neq('id', sessionId)
          .limit(1);

        if (!previousSessions || previousSessions.length === 0) {
          await this.engine.awardPoints(
            tutorId,
            'firstSession'
          );
        }
      }

      // Check for achievements
      await this.achievementManager.checkAchievements(tutorId, 'session_completed', {
        totalSessions: count,
        currentStreak: await this.calculateStreak(tutorId)
      });

      return true;
    } catch (error) {
      console.error('Error processing session completion:', error);
      return false;
    }
  }

  /**
   * Award points when a positive review is received
   */
  async onReviewReceived(reviewId: string, tutorId: string, rating: number) {
    try {
      if (rating >= 4) {
        await this.engine.awardPoints(
          tutorId,
          'positiveReview'
        );
      }

      return true;
    } catch (error) {
      console.error('Error processing review:', error);
      return false;
    }
  }

  /**
   * Check and award points for student retention
   */
  async checkStudentRetention(tutorId: string) {
    try {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      // Find students who have been with the tutor for 3+ months
      const { data: retainedStudents } = await this.supabase
        .from('students')
        .select(`
          id,
          created_at,
          tutoring_sessions!inner(
            id,
            tutor_id,
            session_date
          )
        `)
        .eq('tutoring_sessions.tutor_id', tutorId)
        .lte('created_at', threeMonthsAgo.toISOString());

      if (retainedStudents && retainedStudents.length > 0) {
        // Award points for each retained student (once per month)
        for (const student of retainedStudents) {
          await this.engine.awardPoints(
            tutorId,
            'monthlyRetention'
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking student retention:', error);
      return false;
    }
  }

  /**
   * Award points when a student reaches a milestone
   */
  async onStudentMilestone(studentId: string, tutorId: string) {
    try {
      // Check if student has completed 10, 20, 50, or 100 sessions
      const { data: sessions, count } = await this.supabase
        .from('tutoring_sessions')
        .select('id', { count: 'exact' })
        .eq('student_id', studentId)
        .eq('tutor_id', tutorId)
        .eq('status', 'completed');

      const milestones = [10, 20, 50, 100];
      
      if (count && milestones.includes(count)) {
        await this.engine.awardPoints(
          tutorId,
          'tenSessionMilestone'
        );

        // Trigger milestone achievement
        await this.achievementManager.createMilestoneAchievement(
          tutorId, 
          'student_sessions', 
          count
        );
      }

      return true;
    } catch (error) {
      console.error('Error processing student milestone:', error);
      return false;
    }
  }

  /**
   * Award points when a referral is converted
   */
  async onReferralConverted(referrerId: string, referredId: string) {
    try {
      await this.engine.awardPoints(
        referrerId,
        'referralConversion'
      );

      return true;
    } catch (error) {
      console.error('Error processing referral conversion:', error);
      return false;
    }
  }

  /**
   * Check and award points for attendance streak
   */
  async checkAttendanceStreak(tutorId: string) {
    try {
      // Get last 30 days of sessions
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessions } = await this.supabase
        .from('tutoring_sessions')
        .select('session_date, status')
        .eq('tutor_id', tutorId)
        .gte('session_date', thirtyDaysAgo.toISOString())
        .order('session_date', { ascending: false });

      if (sessions && sessions.length >= 20) {
        // Check completion rate
        const completed = sessions.filter(s => s.status === 'completed').length;
        const completionRate = completed / sessions.length;

        if (completionRate >= 0.95) {
          await this.engine.awardPoints(
            tutorId,
            'highAttendance'
          );
        }
      }

      return true;
    } catch (error) {
      console.error('Error checking attendance streak:', error);
      return false;
    }
  }

  /**
   * Calculate current streak for a tutor
   */
  private async calculateStreak(tutorId: string): Promise<number> {
    const { data: sessions } = await this.supabase
      .from('tutoring_sessions')
      .select('session_date')
      .eq('tutor_id', tutorId)
      .eq('status', 'completed')
      .order('session_date', { ascending: false })
      .limit(30);

    if (!sessions || sessions.length === 0) return 0;

    let streak = 1;
    const dates = sessions.map(s => new Date(s.session_date).toDateString());
    
    for (let i = 1; i < dates.length; i++) {
      const current = new Date(dates[i]);
      const previous = new Date(dates[i - 1]);
      const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }
} 