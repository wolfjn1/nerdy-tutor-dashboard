'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  Users, 
  DollarSign,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  List,
  Video,
  CheckCircle,
  AlertCircle,
  XCircle,
  MoreHorizontal,
  ExternalLink,
  Loader
} from 'lucide-react'
import { Card, Button, Badge, Avatar, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/simple-auth-context'
import { getSessions } from '@/lib/api/sessions'
import { getStudents } from '@/lib/api/students'

// Define today as July 14, 2025 for calendar sync
const TODAY = new Date(2025, 6, 14) // Month is 0-indexed, so 6 = July

interface SessionWithStudent {
  id: string
  tutor_id: string
  student_id: string
  subject: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  price: number
  notes?: string
  created_at: string
  students?: {
    id: string
    first_name: string
    last_name: string
    grade: string
    avatar_url?: string
  }
}

type ViewMode = 'calendar' | 'list'
type CalendarView = 'week' | 'month'

export default function SessionsPage() {
  const router = useRouter()
  const { tutor } = useAuth()
  const [currentDate, setCurrentDate] = useState(TODAY)
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [selectedSession, setSelectedSession] = useState<SessionWithStudent | null>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')
  
  // Data states
  const [sessions, setSessions] = useState<SessionWithStudent[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      if (!tutor?.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const [sessionsData, studentsData] = await Promise.all([
          getSessions(tutor.id),
          getStudents(tutor.id)
        ])
        
        setSessions(sessionsData)
        setStudents(studentsData)
      } catch (err) {
        console.error('Error fetching sessions:', err)
        setError('Failed to load sessions')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [tutor?.id])

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.students && (
        session.students.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.students.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.subject.toLowerCase().includes(searchTerm.toLowerCase())
      )
      
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter
      const matchesSubject = subjectFilter === 'all' || session.subject === subjectFilter
      
      return matchesSearch && matchesStatus && matchesSubject
    })
  }, [sessions, searchTerm, statusFilter, subjectFilter])

  // Get unique subjects for filtering
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>()
    sessions.forEach(session => subjects.add(session.subject))
    return Array.from(subjects).sort()
  }, [sessions])

  // Calendar functions
  const startOfWeek = (date: Date) => {
    const start = new Date(date)
    const day = start.getDay()
    const diff = start.getDate() - day
    return new Date(start.setDate(diff))
  }

  const endOfWeek = (date: Date) => {
    const end = startOfWeek(date)
    return new Date(end.setDate(end.getDate() + 6))
  }

  const getWeekDays = () => {
    const days: Date[] = []
    const start = new Date(currentDate)
    for (let i = 0; i < 7; i++) {
      const day = new Date(start)
      day.setDate(start.getDate() + i)
      days.push(day)
    }
    return days
  }

  const getMonthDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = startOfWeek(firstDay)
    const endDate = endOfWeek(lastDay)
    
    const days: Date[] = []
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const getAllDaysInMonth = (date: Date) => {
    const days: Date[] = []
    const startDate = new Date(date.getFullYear(), date.getMonth(), 1)
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0)
    const currentDate = new Date(startDate)
    
    while (currentDate <= endDate) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    return days
  }

  // Navigation functions
  const navigateCalendar = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    
    if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(TODAY)
  }

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return filteredSessions.filter(session => {
      const sessionDate = new Date(session.scheduled_at)
      return sessionDate.toDateString() === date.toDateString()
    })
  }

  // Format functions
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'completed': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'no_show': return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-3 w-3" />
      case 'completed': return <CheckCircle className="h-3 w-3" />
      case 'cancelled': return <XCircle className="h-3 w-3" />
      case 'no_show': return <AlertCircle className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  // Session Details Modal
  const SessionDetailsModal = ({ session, isOpen, onClose }: { 
    session: SessionWithStudent | null, 
    isOpen: boolean, 
    onClose: () => void 
  }) => {
    if (!session) return null

    const joinLink = `https://meet.nerdy-tutor.com/session/${session.id}`

    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Session Details</h2>
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Avatar
              src={session.students?.avatar_url}
              fallback={session.students ? `${session.students.first_name[0]}${session.students.last_name[0]}` : '??'}
              size="lg"
              className="border-2 border-purple-200 dark:border-purple-700"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {session.students?.first_name} {session.students?.last_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{session.students?.grade} • {session.subject}</p>
              <Badge 
                variant="secondary" 
                className={cn('mt-1 text-xs', getStatusColor(session.status))}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(session.status)}
                  {session.status.replace('_', ' ')}
                </span>
              </Badge>
            </div>
          </div>

          {/* Session Details */}
          <div className="space-y-2 mb-4 text-sm">
            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">Date & Time:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">
                {formatDate(new Date(session.scheduled_at))} at {formatTime(session.scheduled_at)}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">Duration:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">{formatDuration(session.duration_minutes)}</span>
            </div>

            <div>
              <span className="font-medium text-gray-500 dark:text-gray-400">Price:</span>
              <span className="ml-2 text-gray-900 dark:text-gray-100">${session.price}</span>
            </div>

            {session.notes && (
              <div>
                <span className="font-medium text-gray-500 dark:text-gray-400">Notes:</span>
                <span className="ml-2 text-gray-900 dark:text-gray-100">{session.notes}</span>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {session.status === 'scheduled' && (
              <>
                <Button
                  variant="gradient"
                  gradientType="nerdy"
                  leftIcon={<Video className="h-4 w-4" />}
                  onClick={() => window.open(joinLink, '_blank')}
                  className="flex-1"
                  size="sm"
                >
                  Join Session
                </Button>
                <Button
                  variant="outline"
                  leftIcon={<ExternalLink className="h-4 w-4" />}
                  onClick={() => {
                    navigator.clipboard.writeText(joinLink)
                  }}
                  size="sm"
                >
                  Copy Link
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={() => router.push(`/students/${session.student_id}`)}
              size="sm"
            >
              View Student Profile
            </Button>
          </div>
        </div>
      </Modal>
    )
  }

  const SessionCard = ({ session }: { session: SessionWithStudent }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group"
      onClick={() => router.push(`/sessions/${session.id}`)}
    >
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm cursor-pointer">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={session.students?.avatar_url}
                fallback={session.students ? `${session.students.first_name[0]}${session.students.last_name[0]}` : '??'}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                  {session.students?.first_name} {session.students?.last_name}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{session.subject}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge 
                variant="secondary" 
                className={cn('text-xs border', getStatusColor(session.status))}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(session.status)}
                  {session.status.replace('_', ' ')}
                </span>
              </Badge>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Time and Duration */}
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(session.scheduled_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{formatDuration(session.duration_minutes)}</span>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
              {session.notes}
            </p>
          )}

          {/* Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-green-600 dark:text-green-400" />
              <span className="text-xs text-gray-600 dark:text-gray-400">${session.price}</span>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const CalendarDay = ({ date, sessions }: { date: Date, sessions: SessionWithStudent[] }) => {
              const isToday = date.toDateString() === TODAY.toDateString()
    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
    
    return (
      <div className={cn(
        'border border-gray-200 dark:border-gray-700 min-h-[120px] p-2 bg-white/50 dark:bg-gray-800/50',
        !isCurrentMonth && 'bg-gray-50/50 dark:bg-gray-900/50 text-gray-400 dark:text-gray-600'
      )}>
        <div className={cn(
          'text-sm font-medium mb-2',
          isToday && 'text-purple-600 dark:text-purple-400'
        )}>
          {date.getDate()}
        </div>
        <div className="space-y-1">
          {sessions.slice(0, 3).map((session) => (
            <div
              key={session.id}
              className={cn(
                'text-xs p-1 rounded border truncate cursor-pointer hover:shadow-sm transition-shadow',
                getStatusColor(session.status)
              )}
              onClick={() => {
                setSelectedSession(session)
                setShowSessionModal(true)
              }}
            >
              <div className="flex items-center gap-1">
                <span className="font-medium">{formatTime(session.scheduled_at)}</span>
                <span className="truncate">{session.students?.first_name}</span>
              </div>
            </div>
          ))}
          {sessions.length > 3 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              +{sessions.length - 3} more
            </div>
          )}
        </div>
      </div>
    )
  }

  const WeekView = () => {
    const weekDays = getWeekDays()
    const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 9 PM
    
    // Get sessions organized by day and hour
    const getSessionsForDayHour = (day: Date, hour: number) => {
      return filteredSessions.filter(session => {
        const sessionDate = new Date(session.scheduled_at)
        return sessionDate.toDateString() === day.toDateString() &&
               sessionDate.getHours() === hour
      })
    }

    // Get color for session based on status
    const getSessionColor = (status: string) => {
      switch (status) {
        case 'scheduled': return 'bg-blue-500 hover:bg-blue-600 text-white dark:bg-blue-600 dark:hover:bg-blue-700'
        case 'completed': return 'bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-700'
        case 'cancelled': return 'bg-red-400 hover:bg-red-500 text-white dark:bg-red-600 dark:hover:bg-red-700'
        case 'no_show': return 'bg-orange-400 hover:bg-orange-500 text-white dark:bg-orange-600 dark:hover:bg-orange-700'
        default: return 'bg-gray-400 hover:bg-gray-500 text-white dark:bg-gray-600 dark:hover:bg-gray-700'
      }
    }
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
          {/* Time Column Header */}
          <div className="p-3 text-xs font-medium text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700">
            Time
          </div>
          
          {/* Day Headers */}
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === TODAY.toDateString()
            return (
              <div 
                key={index} 
                className={cn(
                  "p-3 text-center border-r border-gray-200 dark:border-gray-700 last:border-r-0",
                  isToday && "bg-purple-50 dark:bg-purple-900/20"
                )}
              >
                <div className={cn(
                  "text-xs font-medium",
                  isToday ? "text-purple-700 dark:text-purple-400" : "text-gray-600 dark:text-gray-400"
                )}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday ? "text-purple-900 dark:text-purple-300" : "text-gray-900 dark:text-gray-100"
                )}>
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Time Grid */}
        <div className="overflow-y-auto max-h-[600px]">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-200 dark:border-gray-700">
              {/* Time Label */}
              <div className="p-3 text-xs text-gray-600 dark:text-gray-400 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {new Date(2025, 0, 1, hour, 0).toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  hour12: true 
                })}
              </div>
              
              {/* Session Slots */}
              {weekDays.map((day, dayIndex) => {
                const sessions = getSessionsForDayHour(day, hour)
                const isToday = day.toDateString() === TODAY.toDateString()
                
                return (
                  <div 
                    key={dayIndex} 
                    className={cn(
                      "p-1 min-h-[50px] border-r border-gray-200 dark:border-gray-700 last:border-r-0 relative",
                      isToday && "bg-purple-50/50 dark:bg-purple-900/10"
                    )}
                  >
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        className={cn(
                          "absolute inset-x-1 p-2 rounded text-xs font-medium cursor-pointer transition-all duration-200 shadow-sm",
                          getSessionColor(session.status)
                        )}
                        style={{
                          height: `${(session.duration_minutes / 60) * 50}px`,
                          minHeight: '40px'
                        }}
                        onClick={() => {
                          setSelectedSession(session)
                          setShowSessionModal(true)
                        }}
                      >
                        <div className="truncate">{session.students?.first_name}</div>
                        <div className="truncate opacity-75">{session.subject}</div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
        
        {/* Status Legend */}
        <div className="p-3 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 dark:bg-blue-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-gray-400 dark:bg-gray-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 dark:bg-red-600 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">Cancelled</span>
          </div>
        </div>
      </div>
    )
  }

  const MonthView = () => {
    const monthDays = getMonthDays(currentDate)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
          {weekDays.map((day) => (
            <div key={day} className="p-4 border-r border-gray-200 dark:border-gray-700 last:border-r-0">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100 text-center">
                {day}
              </div>
            </div>
          ))}
        </div>
        
        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {monthDays.map((day) => {
            const daySessions = getSessionsForDate(day)
            return (
              <CalendarDay
                key={day.toISOString()}
                date={day}
                sessions={daySessions}
              />
            )
          })}
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading sessions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error loading sessions</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                My Sessions
              </h1>
              <Button 
                variant="gradient" 
                gradientType="nerdy" 
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => router.push('/sessions/new')}
                size="sm"
              >
                New Session
              </Button>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Schedule and manage your tutoring sessions
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-3 mb-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* View Controls */}
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'calendar' ? 'solid' : 'outline'}
                size="sm"
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </Button>
              <Button
                variant={viewMode === 'list' ? 'solid' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
              >
                <List className="h-4 w-4 mr-2" />
                List
              </Button>
            </div>

            {/* Calendar View Controls */}
            {viewMode === 'calendar' && (
              <div className="flex items-center gap-2">
                <Button
                  variant={calendarView === 'week' ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('week')}
                >
                  Week
                </Button>
                <Button
                  variant={calendarView === 'month' ? 'solid' : 'outline'}
                  size="sm"
                  onClick={() => setCalendarView('month')}
                >
                  Month
                </Button>
              </div>
            )}

            {/* Navigation */}
            {viewMode === 'calendar' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCalendar('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToToday}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateCalendar('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>
              
              <select
                value={subjectFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSubjectFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="all">All Subjects</option>
                {uniqueSubjects.map(subject => (
                  <option key={subject} value={subject}>{subject}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Current Date Display */}
        {viewMode === 'calendar' && (
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              {calendarView === 'week' && (
                <>
                  {formatDate(startOfWeek(currentDate))} - {formatDate(endOfWeek(currentDate))}
                </>
              )}
              {calendarView === 'month' && (
                <>
                  {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </>
              )}
            </h2>
          </div>
        )}

        {/* Main Content */}
        <div>
          {viewMode === 'calendar' && (
            <>
              {calendarView === 'week' && <WeekView />}
              {calendarView === 'month' && <MonthView />}
            </>
          )}
          
          {viewMode === 'list' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredSessions.map((session, index) => (
                  <motion.div
                    key={session.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <SessionCard session={session} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {filteredSessions.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <Calendar className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No sessions found</h3>
              <p className="text-gray-500 dark:text-gray-400">
                {sessions.length === 0 ? 'Schedule your first session to get started' : 'Try adjusting your search or filters'}
              </p>
              {sessions.length === 0 && (
                <Button 
                  variant="gradient" 
                  gradientType="nerdy" 
                  leftIcon={<Plus className="h-4 w-4" />}
                  onClick={() => router.push('/sessions/new')}
                  className="mt-4"
                >
                  Schedule Session
                </Button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Session Details Modal */}
      <SessionDetailsModal
        session={selectedSession}
        isOpen={showSessionModal}
        onClose={() => {
          setShowSessionModal(false)
          setSelectedSession(null)
        }}
      />
    </div>
  )
} 