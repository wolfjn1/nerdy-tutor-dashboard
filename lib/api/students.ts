import { createClient } from '@/lib/supabase-browser'

const supabase = createClient()

export interface StudentData {
  id: string
  first_name: string
  last_name: string
  avatar_url?: string
  grade?: string
  subjects: string[]
  tags: string[]
  attendance_rate: number
  performance_rate: number
  engagement_rate: number
  next_session?: string
  total_sessions: number
  completed_sessions: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Get all students for a tutor
export async function getStudents(tutorId: string) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      sessions!sessions_student_id_fkey (
        id,
        scheduled_at,
        status
      )
    `)
    .eq('tutor_id', tutorId)
    .order('last_name', { ascending: true })

  if (error) {
    console.error('Error fetching students:', error)
    return []
  }

  // Process each student to determine next session
  const studentsWithNextSession = data?.map(student => {
    const upcomingSessions = student.sessions
      ?.filter((s: any) => 
        new Date(s.scheduled_at) > new Date() && 
        ['scheduled', 'confirmed'].includes(s.status)
      )
      .sort((a: any, b: any) => 
        new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
      )

    return {
      ...student,
      next_session: upcomingSessions?.[0]?.scheduled_at || null,
      sessions: undefined // Remove the sessions array from the response
    }
  })

  return studentsWithNextSession || []
}

// Get a single student by ID
export async function getStudent(studentId: string) {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      sessions!sessions_student_id_fkey (
        id,
        scheduled_at,
        status,
        subject,
        duration,
        rating,
        earnings
      ),
      homework!homework_student_id_fkey (
        id,
        title,
        subject,
        due_date,
        status
      )
    `)
    .eq('id', studentId)
    .single()

  if (error) {
    console.error('Error fetching student:', error)
    return null
  }

  // Calculate next session
  const upcomingSessions = data.sessions
    ?.filter((s: any) => 
      new Date(s.scheduled_at) > new Date() && 
      ['scheduled', 'confirmed'].includes(s.status)
    )
    .sort((a: any, b: any) => 
      new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
    )

  return {
    ...data,
    next_session: upcomingSessions?.[0]?.scheduled_at || null
  }
}

// Update student information
export async function updateStudent(studentId: string, updates: Partial<StudentData>) {
  const { data, error } = await supabase
    .from('students')
    .update(updates)
    .eq('id', studentId)
    .select()
    .single()

  if (error) {
    console.error('Error updating student:', error)
    throw error
  }

  return data
}

// Create a new student
export async function createStudent(tutorId: string, studentData: Omit<StudentData, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('students')
    .insert({
      ...studentData,
      tutor_id: tutorId
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating student:', error)
    throw error
  }

  return data
}

// Get student statistics
export async function getStudentStats(tutorId: string) {
  const students = await getStudents(tutorId)
  
  const activeStudents = students.filter(s => s.is_active)
  const totalCount = activeStudents.length
  const avgPerformance = totalCount > 0
    ? Math.round(activeStudents.reduce((sum, s) => sum + s.performance_rate, 0) / totalCount)
    : 0
  const withScheduledSessions = activeStudents.filter(s => s.next_session).length

  // Calculate average rating from completed sessions
  const { data: completedSessions } = await supabase
    .from('sessions')
    .select('rating')
    .eq('tutor_id', tutorId)
    .eq('status', 'completed')
    .not('rating', 'is', null)

  const avgRating = completedSessions && completedSessions.length > 0
    ? Math.round(completedSessions.reduce((sum, s) => sum + s.rating, 0) / completedSessions.length * 10) / 10
    : 0

  return {
    totalCount,
    avgPerformance,
    withScheduledSessions,
    avgRating
  }
}

// Get individual student statistics
export async function getIndividualStudentStats(studentId: string) {
  // Get all sessions for this student
  const { data: sessions, error: sessionsError } = await supabase
    .from('sessions')
    .select('*')
    .eq('student_id', studentId)
    .order('scheduled_at', { ascending: false })

  if (sessionsError) {
    console.error('Error fetching student sessions:', sessionsError)
    return null
  }

  // Get student data
  const { data: student, error: studentError } = await supabase
    .from('students')
    .select('*')
    .eq('id', studentId)
    .single()

  if (studentError) {
    console.error('Error fetching student:', studentError)
    return null
  }

  // Calculate statistics
  const completedSessions = sessions?.filter(s => s.status === 'completed') || []
  const cancelledSessions = sessions?.filter(s => s.status === 'cancelled') || []
  const noShowSessions = sessions?.filter(s => s.status === 'no_show') || []
  
  // Calculate attendance rate
  const totalScheduledSessions = sessions?.filter(s => 
    ['completed', 'cancelled', 'no_show'].includes(s.status)
  ).length || 0
  
  const attendedSessions = completedSessions.length
  const attendanceRate = totalScheduledSessions > 0 
    ? Math.round((attendedSessions / totalScheduledSessions) * 100)
    : 0

  // Calculate average rating
  const sessionsWithRating = completedSessions.filter(s => s.rating)
  const avgRating = sessionsWithRating.length > 0
    ? Math.round(sessionsWithRating.reduce((sum, s) => sum + s.rating, 0) / sessionsWithRating.length * 10) / 10
    : 0

  // Calculate total hours
  const totalMinutes = completedSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
  const totalHours = Math.round(totalMinutes / 60 * 10) / 10

  return {
    totalSessions: sessions?.length || 0,
    completedSessions: completedSessions.length,
    cancelledSessions: cancelledSessions.length,
    noShowSessions: noShowSessions.length,
    attendanceRate,
    averageRating: avgRating,
    totalHours,
    performanceRate: student.performance_rate || 0,
    engagementRate: student.engagement_rate || 0
  }
} 