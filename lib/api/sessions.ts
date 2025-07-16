import { createClient } from '@/lib/supabase-browser'

// Create the client once at module level
const supabase = createClient()

// Define today as July 14, 2025 for calendar sync (in UTC)
const TODAY = new Date('2025-07-14T00:00:00Z') // Use UTC to match database

// Helper functions for date handling
function startOfWeek(date: Date): Date {
  const start = new Date(date)
  const day = start.getDay()
  const diff = start.getDate() - day
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

function endOfWeek(date: Date): Date {
  const end = new Date(date)
  const day = end.getDay()
  const diff = end.getDate() - day + 6
  end.setDate(diff)
  end.setHours(23, 59, 59, 999)
  return end
}

function startOfMonth(date: Date): Date {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  start.setHours(0, 0, 0, 0)
  return start
}

function endOfMonth(date: Date): Date {
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  end.setHours(23, 59, 59, 999)
  return end
}

export interface SessionData {
  id: string
  student_id: string
  tutor_id: string
  subject: string
  scheduled_at: string
  duration: number
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  rating?: number
  earnings?: number
  meeting_link?: string
  created_at: string
  updated_at: string
  students?: {
    first_name: string
    last_name: string
    avatar_url?: string
  }
}

// Get all sessions for a tutor with filters
export async function getSessions(
  tutorId: string,
  filters?: {
    status?: string
    studentId?: string
    dateRange?: 'week' | 'month' | 'all'
    startDate?: string
    endDate?: string
  }
) {
  let query = supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('tutor_id', tutorId)
    .order('scheduled_at', { ascending: false })

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.studentId) {
    query = query.eq('student_id', filters.studentId)
  }

  // Date range filters
  if (filters?.dateRange === 'week') {
    const start = startOfWeek(TODAY)
    const end = endOfWeek(TODAY)
    query = query
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
  } else if (filters?.dateRange === 'month') {
    const start = startOfMonth(TODAY)
    const end = endOfMonth(TODAY)
    query = query
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())
  } else if (filters?.startDate && filters?.endDate) {
    query = query
      .gte('scheduled_at', filters.startDate)
      .lte('scheduled_at', filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching sessions:', error)
    return []
  }

  return data || []
}

// Get upcoming sessions for calendar view
export async function getUpcomingSessionsForCalendar(tutorId: string, start: Date, end: Date) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('tutor_id', tutorId)
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())
    .in('status', ['scheduled', 'confirmed'])
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching calendar sessions:', error)
    return []
  }

  return data || []
}

// Get a single session by ID
export async function getSession(sessionId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name,
        avatar_url,
        grade,
        subjects,
        performance_rate
      )
    `)
    .eq('id', sessionId)
    .single()

  if (error) {
    console.error('Error fetching session:', error)
    return null
  }

  return data
}

// Create a new session
export async function createSession(sessionData: {
  tutor_id: string
  student_id: string
  subject: string
  scheduled_at: string
  duration: number
  meeting_link?: string
  notes?: string
}) {
  const { data, error } = await supabase
    .from('sessions')
    .insert({
      ...sessionData,
      status: 'scheduled',
      earnings: 85 * (sessionData.duration / 60) // Default hourly rate * hours
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating session:', error)
    throw error
  }

  return data
}

// Update session
export async function updateSession(sessionId: string, updates: Partial<SessionData>) {
  const { data, error } = await supabase
    .from('sessions')
    .update(updates)
    .eq('id', sessionId)
    .select()
    .single()

  if (error) {
    console.error('Error updating session:', error)
    throw error
  }

  return data
}

// Cancel session
export async function cancelSession(sessionId: string) {
  return updateSession(sessionId, { status: 'cancelled' })
}

// Complete session
export async function completeSession(sessionId: string, rating?: number, notes?: string) {
  return updateSession(sessionId, { 
    status: 'completed',
    rating,
    notes
  })
}

// Get session statistics
export async function getSessionStats(tutorId: string, timeframe: 'week' | 'month' | 'year' = 'month') {
  let start: Date
  const end = TODAY

  switch (timeframe) {
    case 'week':
      start = new Date(TODAY)
      start.setDate(start.getDate() - 7)
      break
    case 'month':
      start = new Date(TODAY)
      start.setMonth(start.getMonth() - 1)
      break
    case 'year':
      start = new Date(TODAY)
      start.setFullYear(start.getFullYear() - 1)
      break
  }

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('status, earnings, rating')
    .eq('tutor_id', tutorId)
    .gte('scheduled_at', start.toISOString())
    .lte('scheduled_at', end.toISOString())

  if (error) {
    console.error('Error fetching session stats:', error)
    return {
      totalSessions: 0,
      completedSessions: 0,
      cancelledSessions: 0,
      totalEarnings: 0,
      averageRating: 0
    }
  }

  const stats = {
    totalSessions: sessions?.length || 0,
    completedSessions: sessions?.filter(s => s.status === 'completed').length || 0,
    cancelledSessions: sessions?.filter(s => s.status === 'cancelled').length || 0,
    totalEarnings: sessions?.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0) || 0,
    averageRating: 0
  }

  const ratedSessions = sessions?.filter(s => s.rating) || []
  if (ratedSessions.length > 0) {
    stats.averageRating = Math.round(
      ratedSessions.reduce((sum, s) => sum + s.rating, 0) / ratedSessions.length * 10
    ) / 10
  }

  return stats
} 