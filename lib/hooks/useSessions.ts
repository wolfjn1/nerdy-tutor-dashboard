import { useTutorStore } from '@/lib/stores/tutorStore'
import { Session, FilterOptions, SortOptions } from '@/lib/types'
import { formatDateTime, formatDuration, formatCurrency, calculateEarnings } from '@/lib/utils'

export const useSessions = () => {
  const {
    sessions,
    addSession,
    updateSession,
    getUpcomingSessions,
    getSessionById
  } = useTutorStore()

  const createSession = (sessionData: Omit<Session, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSession: Session = {
      ...sessionData,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    addSession(newSession)
    return newSession
  }

  const editSession = (id: string, updates: Partial<Session>) => {
    updateSession(id, { ...updates, updatedAt: new Date() })
  }

  const getSession = (id: string) => {
    return getSessionById(id)
  }

  const getUpcomingSessionsList = () => {
    return getUpcomingSessions()
  }

  const getCompletedSessions = () => {
    return sessions.filter(session => session.status === 'completed')
  }

  const getSessionsByStatus = (status: Session['status']) => {
    return sessions.filter(session => session.status === status)
  }

  const getSessionsByStudent = (studentId: string) => {
    return sessions.filter(session => session.studentId === studentId)
  }

  const getSessionsBySubject = (subject: string) => {
    return sessions.filter(session => session.subject === subject)
  }

  const getSessionsByDateRange = (startDate: Date, endDate: Date) => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.date)
      return sessionDate >= startDate && sessionDate <= endDate
    })
  }

  const getTodaySessions = () => {
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59)
    
    return getSessionsByDateRange(startOfDay, endOfDay)
  }

  const getThisWeekSessions = () => {
    const today = new Date()
    const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay())
    const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay() + 6, 23, 59, 59)
    
    return getSessionsByDateRange(startOfWeek, endOfWeek)
  }

  const getThisMonthSessions = () => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59)
    
    return getSessionsByDateRange(startOfMonth, endOfMonth)
  }

  const searchSessions = (query: string) => {
    const searchTerm = query.toLowerCase()
    return sessions.filter(session => {
      const subject = session.subject.toLowerCase()
      const notes = session.notes?.toLowerCase() || ''
      const status = session.status.toLowerCase()
      
      return subject.includes(searchTerm) ||
             notes.includes(searchTerm) ||
             status.includes(searchTerm)
    })
  }

  const filterSessions = (filters: FilterOptions) => {
    let filteredSessions = sessions

    if (filters.search) {
      filteredSessions = searchSessions(filters.search)
    }

    if (filters.subjects && filters.subjects.length > 0) {
      filteredSessions = filteredSessions.filter(session =>
        filters.subjects!.includes(session.subject)
      )
    }

    if (filters.status && filters.status.length > 0) {
      filteredSessions = filteredSessions.filter(session =>
        filters.status!.includes(session.status)
      )
    }

    if (filters.dateRange) {
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.date)
        return sessionDate >= filters.dateRange!.start && sessionDate <= filters.dateRange!.end
      })
    }

    return filteredSessions
  }

  const sortSessions = (sessions: Session[], sortOptions: SortOptions) => {
    return [...sessions].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortOptions.field) {
        case 'date':
          aValue = a.date.getTime()
          bValue = b.date.getTime()
          break
        case 'subject':
          aValue = a.subject
          bValue = b.subject
          break
        case 'duration':
          aValue = a.duration
          bValue = b.duration
          break
        case 'status':
          aValue = a.status
          bValue = b.status
          break
        case 'earnings':
          aValue = a.earnings || 0
          bValue = b.earnings || 0
          break
        case 'rating':
          aValue = a.rating || 0
          bValue = b.rating || 0
          break
        default:
          aValue = a.date.getTime()
          bValue = b.date.getTime()
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOptions.direction === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sortOptions.direction === 'asc' 
        ? aValue - bValue
        : bValue - aValue
    })
  }

  const getSessionStats = () => {
    const total = sessions.length
    const completed = getCompletedSessions().length
    const upcoming = getUpcomingSessionsList().length
    const cancelled = getSessionsByStatus('cancelled').length
    const noShow = getSessionsByStatus('no_show').length
    
    const totalHours = sessions.reduce((acc, session) => {
      if (session.status === 'completed') {
        return acc + session.duration
      }
      return acc
    }, 0) / 60

    const totalEarnings = sessions.reduce((acc, session) => {
      return acc + (session.earnings || 0)
    }, 0)

    const averageRating = sessions.reduce((acc, session) => {
      return acc + (session.rating || 0)
    }, 0) / (sessions.filter(s => s.rating).length || 1)

    const subjectCounts = sessions.reduce((acc, session) => {
      if (session.status === 'completed') {
        acc[session.subject] = (acc[session.subject] || 0) + 1
      }
      return acc
    }, {} as Record<string, number>)

    const completionRate = total > 0 ? (completed / total) * 100 : 0

    return {
      total,
      completed,
      upcoming,
      cancelled,
      noShow,
      totalHours: Math.round(totalHours * 100) / 100,
      totalEarnings,
      averageRating: Math.round(averageRating * 100) / 100,
      subjectCounts,
      completionRate: Math.round(completionRate)
    }
  }

  const getNextSession = () => {
    const upcoming = getUpcomingSessionsList()
    return upcoming.length > 0 ? upcoming[0] : null
  }

  const getRecentSessions = (count: number = 5) => {
    return sessions
      .filter(session => session.status === 'completed')
      .sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, count)
  }

  const getSessionEarnings = (sessionId: string) => {
    const session = getSessionById(sessionId)
    return session?.earnings || 0
  }

  const formatSessionDateTime = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session) return 'Unknown Date'
    return formatDateTime(session.date)
  }

  const formatSessionDuration = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session) return 'Unknown Duration'
    return formatDuration(session.duration)
  }

  const formatSessionEarnings = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session) return formatCurrency(0)
    return formatCurrency(session.earnings || 0)
  }

  const canEditSession = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session) return false
    return session.status === 'scheduled' || session.status === 'in_progress'
  }

  const canCancelSession = (sessionId: string) => {
    const session = getSessionById(sessionId)
    if (!session) return false
    return session.status === 'scheduled'
  }

  const markSessionComplete = (sessionId: string, rating?: number, notes?: string, earnings?: number) => {
    editSession(sessionId, {
      status: 'completed',
      rating,
      notes,
      earnings
    })
  }

  const markSessionCancelled = (sessionId: string, notes?: string) => {
    editSession(sessionId, {
      status: 'cancelled',
      notes
    })
  }

  const markSessionNoShow = (sessionId: string, notes?: string) => {
    editSession(sessionId, {
      status: 'no_show',
      notes
    })
  }

  return {
    // State
    sessions,
    
    // Actions
    createSession,
    editSession,
    markSessionComplete,
    markSessionCancelled,
    markSessionNoShow,
    
    // Queries
    getSession,
    getUpcomingSessionsList,
    getCompletedSessions,
    getSessionsByStatus,
    getSessionsByStudent,
    getSessionsBySubject,
    getSessionsByDateRange,
    getTodaySessions,
    getThisWeekSessions,
    getThisMonthSessions,
    searchSessions,
    filterSessions,
    sortSessions,
    getNextSession,
    getRecentSessions,
    
    // Computed values
    stats: getSessionStats(),
    
    // Helpers
    getSessionEarnings,
    formatSessionDateTime,
    formatSessionDuration,
    formatSessionEarnings,
    canEditSession,
    canCancelSession
  }
} 