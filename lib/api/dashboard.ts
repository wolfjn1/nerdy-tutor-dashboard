import { createClient } from '@/utils/supabase/client'
import { startOfDay, endOfDay } from 'date-fns'

const supabase = createClient()

// Get today's sessions
export async function getTodaysSessions(tutorId: string) {
  const today = new Date()
  const startOfToday = startOfDay(today)
  const endOfToday = endOfDay(today)

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
    .gte('scheduled_at', startOfToday.toISOString())
    .lte('scheduled_at', endOfToday.toISOString())
    .order('scheduled_at', { ascending: true })

  if (error) {
    console.error('Error fetching today\'s sessions:', error)
    return []
  }

  return data || []
}

// Get today's earnings from completed sessions
export async function getTodaysEarnings(tutorId: string) {
  const today = new Date()
  const startOfToday = startOfDay(today)
  const endOfToday = endOfDay(today)

  const { data, error } = await supabase
    .from('sessions')
    .select('earnings')
    .eq('tutor_id', tutorId)
    .eq('status', 'completed')
    .gte('scheduled_at', startOfToday.toISOString())
    .lte('scheduled_at', endOfToday.toISOString())

  if (error) {
    console.error('Error fetching today\'s earnings:', error)
    return 0
  }

  const total = data?.reduce((sum, session) => sum + (Number(session.earnings) || 0), 0) || 0
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

// Get success rate (completed sessions / total scheduled sessions)
export async function getSuccessRate(tutorId: string, days: number = 30) {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const { data: allSessions, error: allError } = await supabase
    .from('sessions')
    .select('status')
    .eq('tutor_id', tutorId)
    .gte('scheduled_at', startDate.toISOString())
    .lte('scheduled_at', new Date().toISOString())

  if (allError) {
    console.error('Error fetching sessions for success rate:', allError)
    return 0
  }

  if (!allSessions || allSessions.length === 0) return 100

  const completedCount = allSessions.filter(s => s.status === 'completed').length
  const successRate = Math.round((completedCount / allSessions.length) * 100)
  
  return successRate
}

// Get upcoming sessions
export async function getUpcomingSessions(tutorId: string, limit: number = 5) {
  const now = new Date()

  const { data, error } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name,
        avatar_url,
        subjects
      )
    `)
    .eq('tutor_id', tutorId)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_at', now.toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(limit)

  if (error) {
    console.error('Error fetching upcoming sessions:', error)
    return []
  }

  return data || []
}

// Get required actions (invoices, homework to review, etc)
export async function getRequiredActions(tutorId: string) {
  interface Action {
    id: string
    type: 'invoice' | 'homework' | 'session'
    title: string
    description: string
    urgency: 'high' | 'medium' | 'low'
    dueDate: string
  }
  
  const actions: Action[] = []

  // Check for unpaid invoices
  const { data: unpaidInvoices, error: invoiceError } = await supabase
    .from('invoices')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutorId)
    .in('status', ['sent', 'overdue'])
    .order('due_date', { ascending: true })
    .limit(3)

  if (!invoiceError && unpaidInvoices) {
    unpaidInvoices.forEach(invoice => {
      const student = invoice.students
      actions.push({
        id: invoice.id,
        type: 'invoice',
        title: 'Invoice pending',
        description: `${student?.first_name} ${student?.last_name} ($${invoice.total})`,
        urgency: invoice.status === 'overdue' ? 'high' : 'medium',
        dueDate: invoice.due_date
      })
    })
  }

  // Check for homework to review
  const { data: homeworkToReview, error: homeworkError } = await supabase
    .from('homework')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      ),
      homework_submissions (
        id,
        submitted_at
      )
    `)
    .eq('tutor_id', tutorId)
    .eq('status', 'completed')
    .is('feedback', null)
    .order('due_date', { ascending: true })
    .limit(3)

  if (!homeworkError && homeworkToReview) {
    homeworkToReview.forEach(homework => {
      const student = homework.students
      actions.push({
        id: homework.id,
        type: 'homework',
        title: 'Review homework',
        description: `${student?.first_name} ${student?.last_name} - ${homework.subject}`,
        urgency: 'medium',
        dueDate: homework.due_date
      })
    })
  }

  // Check for unconfirmed sessions
  const { data: unconfirmedSessions, error: sessionError } = await supabase
    .from('sessions')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutorId)
    .eq('status', 'scheduled')
    .gte('scheduled_at', new Date().toISOString())
    .order('scheduled_at', { ascending: true })
    .limit(3)

  if (!sessionError && unconfirmedSessions) {
    unconfirmedSessions.forEach(session => {
      const student = session.students
      const sessionDate = new Date(session.scheduled_at)
      const daysUntil = Math.ceil((sessionDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysUntil <= 2) {
        actions.push({
          id: session.id,
          type: 'session',
          title: 'Confirm session',
          description: `${student?.first_name} ${student?.last_name} - ${session.subject}`,
          urgency: daysUntil <= 1 ? 'high' : 'medium',
          dueDate: session.scheduled_at
        })
      }
    })
  }

  return actions.sort((a, b) => {
    // Sort by urgency then date
    const urgencyOrder = { high: 0, medium: 1, low: 2 }
    if (a.urgency !== b.urgency) {
      return urgencyOrder[a.urgency as keyof typeof urgencyOrder] - urgencyOrder[b.urgency as keyof typeof urgencyOrder]
    }
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
  })
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