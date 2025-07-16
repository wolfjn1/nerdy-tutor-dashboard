import { createClient } from '@/lib/supabase-browser'

// Create the client once at module level
const supabase = createClient()

// Define today as July 14, 2025 for calendar sync (in UTC)
const TODAY = new Date('2025-07-14T00:00:00Z') // Use UTC to match database

// Helper functions for date handling
function startOfDay(date: Date): Date {
  const start = new Date(date)
  start.setUTCHours(0, 0, 0, 0)
  return start
}

function endOfDay(date: Date): Date {
  const end = new Date(date)
  end.setUTCHours(23, 59, 59, 999)
  return end
}

// Get today's sessions
export async function getTodaysSessions(tutorId: string) {
  const today = TODAY
  const startOfToday = startOfDay(today)
  const endOfToday = endOfDay(today)

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutorId)
    .gte('scheduled_at', startOfToday.toISOString())
    .lte('scheduled_at', endOfToday.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching today\'s sessions:', error)
    return []
  }

  // Return empty array if no sessions
  return data || []
}

// Get today's earnings from scheduled and completed sessions
export async function getTodaysEarnings(tutorId: string) {
  const today = TODAY
  const startOfToday = startOfDay(today)
  const endOfToday = endOfDay(today)

  const { data, error } = await supabase
    .from('sessions')
    .select('price, status')
    .eq('tutor_id', tutorId)
    .in('status', ['scheduled', 'completed'])  // Include both scheduled and completed
    .gte('scheduled_at', startOfToday.toISOString())
    .lte('scheduled_at', endOfToday.toISOString())

  if (error) {
    console.error('Error fetching today\'s earnings:', error)
    return 0
  }

  const total = data?.reduce((sum: number, session: any) => sum + (Number(session.price) || 0), 0) || 0
  return total
}

// Get active students count
export async function getActiveStudentsCount(tutorId: string) {
  const { count, error } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    .eq('tutor_id', tutorId)
    .eq('is_active', true)

  if (error) {
    console.error('Error fetching active students:', error)
    return 0
  }

  return count || 0
}

// Get success rate (percentage of completed sessions)
export async function getSuccessRate(tutorId: string) {
  const startDate = new Date(TODAY)
  startDate.setDate(startDate.getDate() - 30) // Last 30 days

  const { data, error } = await supabase
    .from('sessions')
    .select('status')
    .eq('tutor_id', tutorId)
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', TODAY.toISOString())

  if (error) {
    console.error('Error fetching success rate:', error)
    return 0
  }

  if (!data || data.length === 0) return 0

  const completed = data.filter((s: any) => s.status === 'completed').length
  return Math.round((completed / data.length) * 100)
}

// Get upcoming sessions for next 7 days
export async function getUpcomingSessions(tutorId: string) {
  const now = TODAY
  const nextWeek = new Date(now)
  nextWeek.setDate(nextWeek.getDate() + 7)

  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutorId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', now.toISOString())
    .lte('scheduled_at', nextWeek.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(10)

  if (error) {
    console.error('Error fetching upcoming sessions:', error)
    return []
  }

  return data || []
}

// Get required actions (invoices, homework to review, etc)
export async function getRequiredActions(tutorId: string) {
  try {
    interface Action {
      id: string
      type: 'invoice' | 'homework' | 'session'
      title: string
      description: string
      urgency: 'high' | 'medium' | 'low'
      link?: string
    }

    const actions: Action[] = []

    // For now, return empty array for new tutors
    return actions
  } catch (error) {
    console.error('Error in getRequiredActions:', error)
    return []
  }
}

// Get quick actions data
export async function getQuickActions(tutorId: string) {
  // For now, return static quick actions
  // These could be made dynamic based on user behavior
  return [
    {
      id: 'lesson-builder',
      title: 'AI Lesson Builder',
      description: 'Create lesson plans',
      icon: 'BookOpen'
    },
    {
      id: 'study-assistant',
      title: 'AI Study Assistant',
      description: 'Generate problems',
      icon: 'Brain'
    }
  ]
} 