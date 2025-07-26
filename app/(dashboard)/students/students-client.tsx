'use client'

import React, { useState, useMemo } from 'react'
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
  Eye,
  AlertCircle
} from 'lucide-react'
import { Card, Button, Badge, Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'

interface StudentWithStats {
  id: string
  tutor_id: string
  first_name: string
  last_name: string
  email: string
  phone: string
  grade: string
  subjects: string[]
  is_active: boolean
  performance_rating: number
  attendance_rate: number
  avatar_url: string | null
  parent_name: string | null
  parent_email: string | null
  parent_phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
  nextSession?: {
    date: string
    time: string
  }
  stats: {
    totalSessions: number
    completedSessions: number
    avgRating: number
    lastSession?: Date
    totalEarnings: number
  }
}

interface StudentsClientProps {
  students: StudentWithStats[]
}

export default function StudentsClient({ students: initialStudents }: StudentsClientProps) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState<string>('all')
  const [selectedGrade, setSelectedGrade] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'performance' | 'nextSession'>('name')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [activeTab, setActiveTab] = useState<'current' | 'previous'>('current')
  const [showNoScheduledSessions, setShowNoScheduledSessions] = useState(false)

  // Use the students data passed from server
  const studentsWithStats = initialStudents

  // Filter students based on active status
  const currentStudents = useMemo(() => 
    studentsWithStats.filter(student => student.is_active),
    [studentsWithStats]
  )
  
  const previousStudents = useMemo(() => 
    studentsWithStats.filter(student => !student.is_active),
    [studentsWithStats]
  )

  const displayedStudents = activeTab === 'current' ? currentStudents : previousStudents

  // Get unique subjects and grades for filters
  const allSubjects = useMemo(() => {
    const subjects = new Set<string>()
    displayedStudents.forEach(student => {
      student.subjects.forEach(subject => subjects.add(subject))
    })
    return Array.from(subjects).sort()
  }, [displayedStudents])

  const allGrades = useMemo(() => {
    const grades = new Set<string>()
    displayedStudents.forEach(student => {
      if (student.grade) grades.add(student.grade)
    })
    return Array.from(grades).sort((a, b) => {
      const aNum = parseInt(a.match(/\d+/)?.[0] || '0')
      const bNum = parseInt(b.match(/\d+/)?.[0] || '0')
      return aNum - bNum
    })
  }, [displayedStudents])

  // Filter and sort students
  const filteredStudents = useMemo(() => {
    let filtered = displayedStudents.filter(student => {
      const matchesSearch = searchTerm === '' || 
        student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesSubject = selectedSubject === 'all' || 
        student.subjects.includes(selectedSubject)
      
      const matchesGrade = selectedGrade === 'all' || 
        student.grade === selectedGrade
        
      const matchesSchedule = !showNoScheduledSessions || !student.nextSession

      return matchesSearch && matchesSubject && matchesGrade && matchesSchedule
    })

    // Sort students
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.first_name} ${a.last_name}`.localeCompare(`${b.first_name} ${b.last_name}`)
        case 'performance':
          return (b.performance_rating || 0) - (a.performance_rating || 0)
        case 'nextSession':
          if (!a.nextSession && !b.nextSession) return 0
          if (!a.nextSession) return 1
          if (!b.nextSession) return -1
          return new Date(a.nextSession.date).getTime() - new Date(b.nextSession.date).getTime()
        default:
          return 0
      }
    })

    return filtered
  }, [displayedStudents, searchTerm, selectedSubject, selectedGrade, sortBy, showNoScheduledSessions])

  // Calculate statistics
  const stats = useMemo(() => {
    const activeStudentsWithSchedule = currentStudents.filter(s => s.nextSession)
    const avgPerformance = currentStudents.length > 0
      ? Math.round(currentStudents.reduce((sum, s) => sum + (s.performance_rating || 0), 0) / currentStudents.length)
      : 0
    
    const totalRating = currentStudents.reduce((sum, s) => sum + (s.stats.avgRating || 0), 0)
    const studentsWithRating = currentStudents.filter(s => s.stats.avgRating > 0).length
    const avgRating = studentsWithRating > 0 ? (totalRating / studentsWithRating).toFixed(1) : '0.0'
    
    return {
      totalCount: currentStudents.length,
      avgPerformance,
      withScheduledSessions: activeStudentsWithSchedule.length,
      avgRating: parseFloat(avgRating)
    }
  }, [currentStudents])

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">My Students</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage your student roster and track their progress
          </p>
        </div>
        <Button
          onClick={() => router.push('/opportunities')}
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white"
        >
          <Eye className="w-4 h-4 mr-2" />
          View Opportunities
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('current')}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all flex items-center space-x-2",
            activeTab === 'current'
              ? "bg-gradient-to-r from-orange-500 to-pink-500 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          <Users className="w-4 h-4" />
          <span>Current Students ({currentStudents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('previous')}
          className={cn(
            "px-6 py-2 rounded-md font-medium transition-all flex items-center space-x-2",
            activeTab === 'previous'
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
              : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          )}
        >
          <Clock className="w-4 h-4" />
          <span>Previous Students ({previousStudents.length})</span>
        </button>
      </div>

      {/* Stats Cards - Only show for current students */}
      {activeTab === 'current' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-purple-500/20 rounded-lg">
                <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Current Students</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{stats.totalCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Performance</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.avgPerformance}%</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-500/20 rounded-lg">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">With Scheduled Sessions</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.withScheduledSessions}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-yellow-500/20 rounded-lg">
                <Star className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
                <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.avgRating}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search students..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Subjects</option>
          {allSubjects.map(subject => (
            <option key={subject} value={subject}>{subject}</option>
          ))}
        </select>

        <select
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="all">All Grades</option>
          {allGrades.map(grade => (
            <option key={grade} value={grade}>{grade}</option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="name">Sort by Name</option>
          <option value="performance">Sort by Performance</option>
          <option value="nextSession">Sort by Next Session</option>
        </select>

        {activeTab === 'current' && (
          <Button
            variant={showNoScheduledSessions ? 'solid' : 'outline'}
            onClick={() => setShowNoScheduledSessions(!showNoScheduledSessions)}
            className="whitespace-nowrap"
          >
            <Filter className="w-4 h-4 mr-2" />
            No scheduled sessions
          </Button>
        )}
      </div>

      {/* Students Grid/List */}
      <div className={cn(
        "grid gap-4",
        viewMode === 'grid' 
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
          : "grid-cols-1"
      )}>
        {filteredStudents.map((student) => (
          <Card 
            key={student.id} 
            className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => router.push(`/students/${student.id}`)}
          >
            {/* Student Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Avatar 
                  src={student.avatar_url || undefined}
                  alt={`${student.first_name} ${student.last_name}`}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                    {student.first_name} {student.last_name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{student.grade || 'Grade N/A'}</p>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="flex flex-wrap gap-2 mb-4">
              {student.subjects.map(subject => (
                <Badge key={subject} variant="secondary">
                  {subject}
                </Badge>
              ))}
            </div>

            {/* Performance Metrics */}
            <div className="space-y-3 mb-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Performance</span>
                  <span className="font-medium">{student.performance_rating || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                    style={{ width: `${student.performance_rating || 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 dark:text-gray-400">Attendance</span>
                  <span className="font-medium">{student.attendance_rate || 0}%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full"
                    style={{ width: `${student.attendance_rate || 0}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Session Info */}
            <div className="flex items-center justify-between text-sm mb-4">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600 dark:text-gray-400">
                  {student.stats.completedSessions} Sessions
                </span>
                {student.stats.avgRating > 0 && (
                  <span className="flex items-center text-yellow-500">
                    {student.stats.avgRating} <Star className="w-3 h-3 ml-1 fill-current" />
                  </span>
                )}
              </div>
              <span className="text-gray-600 dark:text-gray-400">
                {student.stats.avgRating > 0 ? 'Rating' : '-'}
              </span>
            </div>

            {/* Next Session */}
            <div className="border-t pt-4">
              {student.nextSession ? (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span>Next: {student.nextSession.date} at {student.nextSession.time}</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-red-500">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  <span>No session scheduled</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle message
                }}
              >
                <MessageCircle className="w-4 h-4 mr-1" />
                Message
              </Button>
              <Button
                size="sm"
                className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white"
                onClick={(e) => {
                  e.stopPropagation()
                  router.push(`/sessions/new?studentId=${student.id}`)
                }}
              >
                <Calendar className="w-4 h-4 mr-1" />
                Schedule
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No students found matching your criteria.</p>
        </div>
      )}
    </div>
  )
} 