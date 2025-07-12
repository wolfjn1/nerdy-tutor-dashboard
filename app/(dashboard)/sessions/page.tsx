'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  DollarSign,
  Plus,
  Filter,
  Search,
  ChevronLeft,
  ChevronRight,
  Grid,
  List,
  Video,
  Phone,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  XCircle,
  Star,
  Settings,
  MoreHorizontal,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  X
} from 'lucide-react'
import { Card, Button, Badge, Avatar, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'
import studentsData from '@/lib/mock-data/students.json'
import sessionsData from '@/lib/mock-data/sessions.json'
import { Student, Session } from '@/lib/types'

// Type the imported data and convert dates
const students = studentsData.map(student => ({
  ...student,
  nextSession: student.nextSession ? new Date(student.nextSession) : undefined,
  createdAt: new Date(student.createdAt)
})) as Student[]

// Convert UTC dates to local timezone
const convertUTCToLocal = (utcDate: Date | string): Date => {
  const date = new Date(utcDate)
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
}

const sessions = sessionsData.map(session => ({
  ...session,
  date: new Date(session.date),
  createdAt: new Date(session.createdAt),
  updatedAt: new Date(session.updatedAt)
})) as Session[]

interface SessionWithStudent extends Session {
  student: Student
}

type ViewMode = 'calendar' | 'list' | 'week' | 'month'
type CalendarView = 'day' | 'week' | 'month'

export default function SessionsPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date('2025-01-08')) // Set to current week with sessions
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [calendarView, setCalendarView] = useState<CalendarView>('week')
  const [selectedSession, setSelectedSession] = useState<SessionWithStudent | null>(null)
  const [showSessionModal, setShowSessionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [subjectFilter, setSubjectFilter] = useState<string>('all')

  // Combine sessions with student data
  const sessionsWithStudents = useMemo((): SessionWithStudent[] => {
    return sessions.map(session => {
      const student = students.find(s => s.id === session.studentId)
      return {
        ...session,
        student: student || {
          id: 'unknown',
          firstName: 'Unknown',
          lastName: 'Student',
          subjects: [],
          grade: 'N/A',
          progress: { attendance: 0, performance: 0, engagement: 0 },
          totalSessions: 0,
          completedSessions: 0,
          createdAt: new Date(),
          isActive: false,
          parentContact: { email: '', phone: '', name: '', relationship: 'parent' as const },
          notes: '',
          tags: []
        }
      }
    })
  }, [])

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessionsWithStudents.filter(session => {
      const matchesSearch = 
        session.student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.subject.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || session.status === statusFilter
      const matchesSubject = subjectFilter === 'all' || session.subject === subjectFilter
      
      return matchesSearch && matchesStatus && matchesSubject
    })
  }, [sessionsWithStudents, searchTerm, statusFilter, subjectFilter])

  // Get unique subjects for filtering
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>()
    sessions.forEach(session => subjects.add(session.subject))
    return Array.from(subjects).sort()
  }, [])

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

  const getWeekDays = (date: Date) => {
    const start = startOfWeek(date)
    const days = []
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
    
    const days = []
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
    
    if (calendarView === 'day') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    } else if (calendarView === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else if (calendarView === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    }
    
    setCurrentDate(newDate)
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get sessions for a specific date
  const getSessionsForDate = (date: Date) => {
    return filteredSessions.filter(session => {
      const sessionDate = new Date(session.date)
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

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const getStatusColor = (status: Session['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-green-100 text-green-800 border-green-200'
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200'
      case 'no_show': return 'bg-orange-100 text-orange-800 border-orange-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: Session['status']) => {
    switch (status) {
      case 'scheduled': return <Clock className="h-3 w-3" />
      case 'in_progress': return <Video className="h-3 w-3" />
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
        <div className="bg-white rounded-xl p-6">
          {/* Header */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">Session Details</h2>
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-lg">
            <Avatar
              src={session.student.avatar}
              fallback={`${session.student.firstName[0]}${session.student.lastName[0]}`}
              size="lg"
              className="border-2 border-purple-200"
            />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {session.student.firstName} {session.student.lastName}
              </h3>
              <p className="text-sm text-gray-600">{session.student.grade} • {session.subject}</p>
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
              <span className="font-medium text-gray-500">Date & Time:</span>
              <span className="ml-2 text-gray-900">
                {formatDate(session.date)} at {formatTime(session.date)}
              </span>
            </div>

            <div>
              <span className="font-medium text-gray-500">Duration:</span>
              <span className="ml-2 text-gray-900">{formatDuration(session.duration)}</span>
            </div>

            {session.notes && (
              <div>
                <span className="font-medium text-gray-500">Notes:</span>
                <span className="ml-2 text-gray-900">{session.notes}</span>
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
                    // You can add a toast notification here
                  }}
                  size="sm"
                >
                  Copy Link
                </Button>
              </>
            )}
            
            <Button
              variant="outline"
              onClick={() => router.push(`/students/${session.studentId}`)}
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
      <Card className="h-full hover:shadow-lg transition-shadow duration-200 border-0 bg-white/80 backdrop-blur-sm cursor-pointer">
        <div className="p-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Avatar
                src={session.student.avatar}
                fallback={`${session.student.firstName[0]}${session.student.lastName[0]}`}
                size="md"
              />
              <div>
                <h3 className="font-semibold text-gray-900 text-sm">
                  {session.student.firstName} {session.student.lastName}
                </h3>
                <p className="text-xs text-gray-500">{session.subject}</p>
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
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(session.date)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{formatDuration(session.duration)}</span>
            </div>
          </div>

          {/* Notes */}
          {session.notes && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
              {session.notes}
            </p>
          )}

          {/* Rating and Earnings */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              {session.rating && (
                <>
                  <Star className="h-3 w-3 text-yellow-500 fill-current" />
                  <span className="text-xs text-gray-600">{session.rating}</span>
                </>
              )}
            </div>
            <div className="flex items-center gap-1">
              {session.earnings && (
                <>
                  <DollarSign className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-gray-600">${session.earnings}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  )

  const CalendarDay = ({ date, sessions }: { date: Date, sessions: SessionWithStudent[] }) => {
    const isToday = date.toDateString() === new Date().toDateString()
    const isCurrentMonth = date.getMonth() === currentDate.getMonth()
    
    return (
      <div className={cn(
        'border border-gray-200 min-h-[120px] p-2 bg-white/50',
        !isCurrentMonth && 'bg-gray-50/50 text-gray-400'
      )}>
        <div className={cn(
          'text-sm font-medium mb-2',
          isToday && 'text-purple-600'
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
                <span className="font-medium">{formatTime(session.date)}</span>
                <span className="truncate">{session.student.firstName}</span>
              </div>
            </div>
          ))}
          {sessions.length > 3 && (
            <div className="text-xs text-gray-500 font-medium">
              +{sessions.length - 3} more
            </div>
          )}
        </div>
      </div>
    )
  }

  const WeekView = () => {
    const weekDays = getWeekDays(currentDate)
    const hours = Array.from({ length: 14 }, (_, i) => i + 7) // 7 AM to 9 PM
    
    // Get sessions organized by day and hour
    const getSessionsForDayHour = (day: Date, hour: number) => {
      return filteredSessions.filter(session => {
        const sessionDate = new Date(session.date)
        return sessionDate.toDateString() === day.toDateString() &&
               sessionDate.getHours() === hour
      })
    }

    // Get color for session based on status
    const getSessionColor = (status: Session['status']) => {
      switch (status) {
        case 'scheduled': return 'bg-blue-500 hover:bg-blue-600 text-white'
        case 'in_progress': return 'bg-green-500 hover:bg-green-600 text-white'
        case 'completed': return 'bg-gray-400 hover:bg-gray-500 text-white'
        case 'cancelled': return 'bg-red-400 hover:bg-red-500 text-white'
        case 'no_show': return 'bg-orange-400 hover:bg-orange-500 text-white'
        default: return 'bg-gray-400 hover:bg-gray-500 text-white'
      }
    }
    
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Header with days */}
        <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-200">
          <div className="p-2 text-center">
            <div className="text-xs font-medium text-gray-500">Time</div>
          </div>
          {weekDays.map((day) => {
            const isToday = day.toDateString() === new Date().toDateString()
            return (
              <div key={day.toISOString()} className={cn(
                "p-2 text-center border-l border-gray-200",
                isToday && "bg-purple-50"
              )}>
                <div className={cn(
                  "text-xs font-medium",
                  isToday ? "text-purple-600" : "text-gray-900"
                )}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={cn(
                  "text-lg font-semibold",
                  isToday ? "text-purple-600" : "text-gray-700"
                )}>
                  {day.getDate()}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Time slots with sessions */}
        <div className="max-h-[450px] overflow-y-auto">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
              <div className="p-2 text-right pr-3 text-xs text-gray-500 font-medium">
                {hour === 12 ? '12:00 PM' : hour > 12 ? `${hour - 12}:00 PM` : `${hour}:00 AM`}
              </div>
              {weekDays.map((day) => {
                const daySessions = getSessionsForDayHour(day, hour)
                const isToday = day.toDateString() === new Date().toDateString()
                
                return (
                  <div 
                    key={day.toISOString()} 
                    className={cn(
                      "p-1 border-l border-gray-100 min-h-[50px] relative",
                      isToday && "bg-purple-50/30"
                    )}
                  >
                    {daySessions.map((session, index) => (
                      <div
                        key={session.id}
                        className={cn(
                          "absolute left-1 right-1 p-1.5 rounded-md cursor-pointer shadow-sm transition-all duration-200",
                          getSessionColor(session.status),
                          index > 0 && "top-8" // Stack multiple sessions
                        )}
                        style={{ top: index * 35 }}
                        onClick={() => {
                          setSelectedSession(session)
                          setShowSessionModal(true)
                        }}
                      >
                        <div className="text-xs font-medium truncate">
                          {session.student.firstName} {session.student.lastName[0]}.
                        </div>
                        <div className="text-xs opacity-90 truncate">
                          {session.subject}
                        </div>
                        <div className="text-xs opacity-80">
                          {formatTime(session.date)}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="bg-gray-50 border-t border-gray-200 p-2">
          <div className="flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span className="text-gray-600">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-600">In Progress</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-400 rounded"></div>
              <span className="text-gray-600">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded"></div>
              <span className="text-gray-600">Cancelled</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const MonthView = () => {
    const monthDays = getMonthDays(currentDate)
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day) => (
            <div key={day} className="p-4 border-r border-gray-200 last:border-r-0">
              <div className="text-sm font-medium text-gray-900 text-center">
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

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-2">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">
                My Sessions
              </h1>
              <p className="text-sm text-gray-600">
                Schedule and manage your tutoring sessions
              </p>
            </div>
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
        </div>

        {/* Controls */}
        <div className="bg-white rounded-xl border border-gray-200 p-3 mb-2">
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search sessions..."
                  value={searchTerm}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <select
                value={statusFilter}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <h2 className="text-lg font-semibold text-gray-900">
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
              <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
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