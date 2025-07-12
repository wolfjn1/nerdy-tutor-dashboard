'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Search, 
  Filter, 
  Users, 
  Calendar, 
  MessageCircle, 
  TrendingUp, 
  Phone,
  Mail,
  BookOpen,
  Star,
  Clock,
  User,
  ChevronDown,
  Eye
} from 'lucide-react'
import { Card, Button, Badge, Avatar } from '@/components/ui'
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

const sessions = sessionsData.map(session => ({
  ...session,
  date: new Date(session.date),
  createdAt: new Date(session.createdAt),
  updatedAt: new Date(session.updatedAt)
})) as Session[]

interface StudentWithStats extends Student {
  stats: {
    totalSessions: number
    completedSessions: number
    avgRating: number
    nextSession?: Date
    lastSession?: Date
    totalEarnings: number
  }
}

export default function StudentsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'nextSession'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current')

  // Process students with session stats
  const studentsWithStats = useMemo((): StudentWithStats[] => {
    return students.map(student => {
      const studentSessions = sessions.filter(s => s.studentId === student.id)
      const completedSessions = studentSessions.filter(s => s.status === 'completed')
      const upcomingSessions = studentSessions.filter(s => s.status === 'scheduled')
      
      const avgRating = completedSessions.length > 0 
        ? completedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / completedSessions.length
        : 0
      
      const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.earnings || 0), 0)
      
      // Respect the student's nextSession from JSON, but also check for scheduled sessions
      let nextSession: Date | undefined = undefined
      if (student.nextSession) {
        nextSession = student.nextSession
      } else {
        const nextScheduledSession = upcomingSessions
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0]
        if (nextScheduledSession) {
          nextSession = new Date(nextScheduledSession.date)
        }
      }
      
      const lastSession = completedSessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      return {
        ...student,
        stats: {
          totalSessions: studentSessions.length,
          completedSessions: completedSessions.length,
          avgRating: Math.round(avgRating * 10) / 10,
          nextSession,
          lastSession: lastSession ? new Date(lastSession.date) : undefined,
          totalEarnings
        }
      }
    })
  }, [])

  // Get unique subjects and grades for filtering
  const uniqueSubjects = useMemo(() => {
    const subjects = new Set<string>()
    students.forEach(student => {
      student.subjects.forEach(subject => subjects.add(subject))
    })
    return Array.from(subjects).sort()
  }, [])

  const uniqueGrades = useMemo(() => {
    const grades = new Set<string>()
    students.forEach(student => {
      grades.add(student.grade.toString())
    })
    return Array.from(grades).sort((a, b) => parseInt(a) - parseInt(b))
  }, [])

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = studentsWithStats.filter(student => {
      // Filter by tab (current vs previous)
      // Current students: Active students (regardless of session status)
      // Previous students: Inactive students or completed relationships
      const isCurrent = student.isActive
      const matchesTab = activeTab === 'current' ? isCurrent : !isCurrent
      
      const matchesSearch = 
        student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()))
      
      const matchesSubject = selectedSubject === 'all' || student.subjects.includes(selectedSubject)
      const matchesGrade = selectedGrade === 'all' || student.grade.toString() === selectedGrade
      
      return matchesTab && matchesSearch && matchesSubject && matchesGrade
    })

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'performance':
          return b.progress.performance - a.progress.performance
        case 'nextSession':
          if (!a.stats.nextSession && !b.stats.nextSession) return 0
          if (!a.stats.nextSession) return 1
          if (!b.stats.nextSession) return -1
          return a.stats.nextSession.getTime() - b.stats.nextSession.getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [studentsWithStats, searchTerm, selectedSubject, selectedGrade, sortBy, activeTab])

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return 'bg-green-500'
    if (progress >= 75) return 'bg-yellow-500'
    if (progress >= 60) return 'bg-orange-500'
    return 'bg-red-500'
  }

  const StudentCard = ({ student }: { student: StudentWithStats }) => {
    // Check if student is active but has no upcoming session
    const needsSessionScheduled = student.isActive && !student.stats.nextSession
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        onClick={() => router.push(`/students/${student.id}`)}
      >
        <Card className="hover:shadow-xl transition-all duration-300 border-0 bg-gray-800 text-white cursor-pointer overflow-hidden h-[440px]">
          <div className="p-6 h-full flex flex-col justify-between">
            <div className="flex-1">
              {/* Warning Banner for Missing Sessions */}
              {needsSessionScheduled && (
                <div className="mb-4 p-2 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <div className="flex items-center gap-2 text-red-200 text-sm">
                    <Clock className="h-4 w-4" />
                    <span className="font-medium">Schedule session needed</span>
                  </div>
                </div>
              )}

              {/* Header */}
              <div className="flex items-center gap-3 mb-4">
                <Avatar
                  src={student.avatar}
                  fallback={`${student.firstName[0]}${student.lastName[0]}`}
                  size="lg"
                  className="border-2 border-purple-400/50"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white">
                    {student.firstName} {student.lastName}
                  </h3>
                  <p className="text-sm text-gray-400">Grade {student.grade}</p>
                </div>
              </div>

              {/* Subjects */}
              <div className="mb-4">
                <div className="flex flex-wrap gap-1">
                  {student.subjects.slice(0, 2).map(subject => (
                    <Badge key={subject} variant="secondary" className="text-xs bg-purple-600/30 text-purple-200 border-purple-500/30">
                      {subject}
                    </Badge>
                  ))}
                  {student.subjects.length > 2 && (
                    <Badge variant="secondary" className="text-xs bg-gray-600/30 text-gray-300">
                      +{student.subjects.length - 2}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-3 mb-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white font-medium">{student.progress.performance}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(student.progress.performance)}`}
                      style={{ width: `${student.progress.performance}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Attendance</span>
                    <span className="text-white font-medium">{student.progress.attendance}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-500 ${getProgressColor(student.progress.attendance)}`}
                      style={{ width: `${student.progress.attendance}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">{student.stats.completedSessions}</div>
                  <div className="text-xs text-gray-400">Sessions</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-semibold text-white flex items-center justify-center gap-1">
                    {student.stats.avgRating > 0 ? student.stats.avgRating : '-'}
                    {student.stats.avgRating > 0 && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                  </div>
                  <div className="text-xs text-gray-400">Rating</div>
                </div>
              </div>

              {/* Next Session or Warning */}
              <div className="mb-4">
                {student.stats.nextSession ? (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>Next: {formatDate(student.stats.nextSession)}</span>
                  </div>
                ) : needsSessionScheduled ? (
                  <div className="flex items-center gap-2 text-sm text-red-400">
                    <Clock className="h-4 w-4" />
                    <span>No session scheduled</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    <span>No upcoming sessions</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions - Always at bottom */}
            <div className="flex gap-2">
              <Button size="sm" variant="outline" className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700">
                <MessageCircle className="h-4 w-4 mr-2" />
                Message
              </Button>
              <Button size="sm" variant="gradient" gradientType="nerdy" className="flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Schedule
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>
    )
  }

  // Get counts for tabs
  const currentStudentsCount = studentsWithStats.filter(s => s.isActive).length
  const previousStudentsCount = studentsWithStats.filter(s => !s.isActive).length

  // Debug logging
  console.log('studentsWithStats:', studentsWithStats.length)
  console.log('filteredStudents:', filteredStudents.length)
  console.log('activeTab:', activeTab)
  console.log('filteredStudents with stats:', filteredStudents.map(s => ({
    name: s.firstName + ' ' + s.lastName,
    avgRating: s.stats.avgRating,
    completedSessions: s.stats.completedSessions,
    nextSession: s.stats.nextSession
  })))

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-1 lg:mb-2">
            My Students
          </h1>
          <p className="text-sm lg:text-base text-gray-600">
            Manage your student roster and track their progress
          </p>
        </div>
        <Button variant="gradient" gradientType="nerdy" leftIcon={<Eye className="h-4 w-4" />} size="sm" className="lg:size-default">
          View Opportunities
        </Button>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-2">
            <div className="flex gap-1">
              <Button
                variant={activeTab === 'current' ? 'gradient' : 'ghost'}
                gradientType={activeTab === 'current' ? 'nerdy' : undefined}
                size="sm"
                onClick={() => setActiveTab('current')}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Current Students ({currentStudentsCount})
              </Button>
              <Button
                variant={activeTab === 'previous' ? 'gradient' : 'ghost'}
                gradientType={activeTab === 'previous' ? 'nerdy' : undefined}
                size="sm"
                onClick={() => setActiveTab('previous')}
                className="flex-1"
              >
                <Clock className="h-4 w-4 mr-2" />
                Previous Students ({previousStudentsCount})
              </Button>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xl font-bold text-gray-900">{filteredStudents.length}</div>
                <div className="text-xs text-gray-500 leading-tight">{activeTab === 'current' ? 'Current' : 'Previous'} Students</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xl font-bold text-gray-900">
                  {filteredStudents.length > 0 ? Math.round(filteredStudents.reduce((sum, s) => sum + s.progress.performance, 0) / filteredStudents.length) : 0}%
                </div>
                <div className="text-xs text-gray-500 leading-tight">Avg Performance</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xl font-bold text-gray-900">
                  {activeTab === 'current' ? filteredStudents.filter(s => s.stats.nextSession).length : filteredStudents.reduce((sum, s) => sum + s.stats.completedSessions, 0)}
                </div>
                <div className="text-xs text-gray-500 leading-tight">{activeTab === 'current' ? 'With Scheduled Sessions' : 'Total Completed Sessions'}</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xl font-bold text-gray-900">
                  {(() => {
                    const studentsWithRatings = filteredStudents.filter(s => s.stats.avgRating > 0)
                    if (studentsWithRatings.length === 0) return '0'
                    const avgRating = studentsWithRatings.reduce((sum, s) => sum + s.stats.avgRating, 0) / studentsWithRatings.length
                    return Math.round(avgRating * 10) / 10
                  })()}
                </div>
                <div className="text-xs text-gray-500 leading-tight">Avg Rating</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-3 lg:p-4">
            <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-2">
                <select
                  value={selectedSubject}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedSubject(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Subjects</option>
                  {uniqueSubjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>

                <select
                  value={selectedGrade}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedGrade(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Grades</option>
                  {uniqueGrades.map(grade => (
                    <option key={grade} value={grade}>Grade {grade}</option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSortBy(e.target.value as 'name' | 'performance' | 'nextSession')}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="name">Sort by Name</option>
                  <option value="performance">Sort by Performance</option>
                  <option value="nextSession">Sort by Next Session</option>
                </select>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Students Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-fr">
          <AnimatePresence mode="popLayout">
            {filteredStudents.map((student, index) => (
              <motion.div
                key={student.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.05 }}
              >
                <StudentCard student={student} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredStudents.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} students found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
} 