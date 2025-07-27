import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardClient from './dashboard-client'

export default async function DashboardPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Check if user has completed onboarding
  const { data: onboardingData } = await supabase
    .from('tutor_onboarding')
    .select('step_completed')
    .eq('tutor_id', user.id)

  // If they haven't completed all 5 steps, redirect to onboarding
  const REQUIRED_ONBOARDING_STEPS = 5
  if (!onboardingData || onboardingData.length < REQUIRED_ONBOARDING_STEPS) {
    redirect('/onboarding')
  }
  
  // Fetch tutor profile
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()
    
  if (tutorError || !tutor) {
    console.error('Tutor fetch error:', tutorError)
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-4">Profile Setup Required</h1>
        <p>Your tutor profile needs to be set up. Please contact support.</p>
        <pre className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded text-xs">
          User ID: {user.id}
          Email: {user.email}
          Error: {tutorError?.message || 'No tutor profile found'}
        </pre>
      </div>
    )
  }
  
  // Fetch students
  const { data: students } = await supabase
    .from('students')
    .select('*')
    .eq('tutor_id', tutor.id)
    
  // Get today's date range
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // Fetch today's sessions
  const { data: todaySessionsData } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', today.toISOString())
    .lt('scheduled_at', tomorrow.toISOString())
    .order('scheduled_at', { ascending: true })
    
  // Fetch upcoming sessions (for the "Upcoming Sessions" section)
  const { data: upcomingSessions } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutor.id)
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)
    
  // Calculate stats
  const activeStudentsCount = students?.filter(s => s.is_active).length || 0
  const totalStudents = students?.length || 0
  const todaysSessions = todaySessionsData?.length || 0
  
  // Fetch gamification data
  const { data: gamificationPoints } = await supabase
    .from('gamification_points')
    .select('points, reason, created_at')
    .eq('tutor_id', user.id)
    .order('created_at', { ascending: false });

  const totalPoints = gamificationPoints?.reduce((sum, p) => sum + p.points, 0) || 0;
  
  // Calculate current level
  const calculateLevel = (points: number) => {
    if (points >= 10001) return 'Master';
    if (points >= 5001) return 'Expert';
    if (points >= 2001) return 'Advanced';
    if (points >= 501) return 'Proficient';
    return 'Beginner';
  };

  const currentLevel = calculateLevel(totalPoints);

  // Get current tier
  const { data: tierData } = await supabase
    .from('tutor_tiers')
    .select('current_tier')
    .eq('tutor_id', user.id)
    .single();

  // Get badges
  const { data: badges } = await supabase
    .from('tutor_badges')
    .select('badge_type, earned_at')
    .eq('tutor_id', user.id)
    .order('earned_at', { ascending: false });

  // Get recent achievements (combine points and badges)
  const recentAchievements = [
    ...(gamificationPoints?.slice(0, 5).map(p => ({
      id: `points-${p.created_at}`,
      type: 'points',
      title: formatPointsReason(p.reason),
      earned_at: p.created_at,
      points: p.points
    })) || []),
    ...(badges?.slice(0, 5).map(b => ({
      id: `badge-${b.earned_at}`,
      type: 'badge',
      title: formatBadgeName(b.badge_type),
      earned_at: b.earned_at
    })) || [])
  ].sort((a, b) => new Date(b.earned_at).getTime() - new Date(a.earned_at).getTime()).slice(0, 5);

  // Calculate weekly points
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const weeklyPoints = gamificationPoints
    ?.filter(p => new Date(p.created_at) >= oneWeekAgo)
    .reduce((sum, p) => sum + p.points, 0) || 0;

  // Calculate current streak
  const { data: recentSessions } = await supabase
    .from('tutoring_sessions')
    .select('session_date')
    .eq('tutor_id', user.id)
    .eq('status', 'completed')
    .order('session_date', { ascending: false })
    .limit(30);

  const currentStreak = calculateStreak(recentSessions || []);

  // Calculate next milestone
  const sessionCount = await supabase
    .from('tutoring_sessions')
    .select('id', { count: 'exact' })
    .eq('tutor_id', user.id)
    .eq('status', 'completed');
  
  const totalSessions = sessionCount.count || 0;
  const nextMilestone = getNextMilestone(totalSessions, totalPoints);

  // Format sessions for the client
  const formattedSessions = upcomingSessions?.map(s => ({
    ...s,
    student_name: s.students ? `${s.students.first_name} ${s.students.last_name}` : 'Unknown Student'
  })) || []
  
  const stats = {
    activeStudentsCount,
    todaysSessions,
    totalStudents
  }
  
  const gamificationData = {
    totalPoints,
    currentLevel,
    currentTier: tierData?.current_tier || 'standard',
    badges: badges || [],
    recentAchievements,
    weeklyPoints,
    currentStreak,
    nextMilestone
  };
  
  // Pass all data to the client component
  return (
    <DashboardClient 
      initialTutor={tutor} 
      user={user}
      students={students || []}
      sessions={formattedSessions}
      stats={stats}
      gamificationData={gamificationData}
    />
  )
} 

// Helper functions
function formatPointsReason(reason: string): string {
  const reasonMap: Record<string, string> = {
    sessionCompletion: 'Completed 5 Sessions',
    firstSession: 'First Session with Student',
    tenSessionMilestone: 'Student 10 Session Milestone',
    positiveReview: 'Positive Review Received',
    monthlyRetention: 'Monthly Student Retention',
    highAttendance: 'High Attendance Rate',
    referralConversion: 'Successful Referral',
    studentMilestone: 'Student Achievement'
  };
  return reasonMap[reason] || 'Points Earned';
}

function formatBadgeName(badgeType: string): string {
  const badgeMap: Record<string, string> = {
    session_milestone: 'Session Milestone',
    retention_star: 'Retention Star',
    five_star_tutor: 'Five Star Tutor',
    quick_starter: 'Quick Starter',
    student_champion: 'Student Champion',
    consistent_educator: 'Consistent Educator',
    elite_performer: 'Elite Performer',
    marathon_tutor: 'Marathon Tutor'
  };
  return badgeMap[badgeType] || badgeType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

function calculateStreak(sessions: Array<{ session_date: string }>): number {
  if (sessions.length === 0) return 0;
  
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

function getNextMilestone(sessions: number, points: number): any {
  // Check session milestones
  const sessionMilestones = [10, 25, 50, 100, 250, 500, 1000];
  const nextSessionMilestone = sessionMilestones.find(m => m > sessions);
  
  // Check point milestones
  const pointMilestones = [100, 500, 1000, 5000, 10000, 25000, 50000];
  const nextPointMilestone = pointMilestones.find(m => m > points);
  
  // Return the closest milestone
  if (nextSessionMilestone && nextPointMilestone) {
    const sessionProgress = sessions / nextSessionMilestone;
    const pointProgress = points / nextPointMilestone;
    
    if (sessionProgress > pointProgress) {
      return {
        type: 'Sessions',
        target: nextSessionMilestone,
        current: sessions,
        reward: '50 bonus points'
      };
    } else {
      return {
        type: 'Points',
        target: nextPointMilestone,
        current: points,
        reward: 'New achievement badge'
      };
    }
  } else if (nextSessionMilestone) {
    return {
      type: 'Sessions',
      target: nextSessionMilestone,
      current: sessions,
      reward: '50 bonus points'
    };
  } else if (nextPointMilestone) {
    return {
      type: 'Points',
      target: nextPointMilestone,
      current: points,
      reward: 'New achievement badge'
    };
  }
  
  return null;
} 