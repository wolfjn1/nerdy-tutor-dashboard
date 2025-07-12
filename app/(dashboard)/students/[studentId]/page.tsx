'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  Star,
  TrendingUp,
  TrendingDown,
  MessageCircle,
  Phone,
  Mail,
  Edit,
  Plus,
  MoreHorizontal,
  User,
  BookOpen,
  Target,
  Award,
  FileText,
  DollarSign,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Users,
  MapPin,
  Settings,
  Filter,
  Download
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

interface StudentDetailPageProps {
  params: {
    studentId: string
  }
}

export default function StudentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studentId = params.studentId as string
  
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'progress' | 'notes'>('overview')
  const [sessionFilter, setSessionFilter] = useState<'all' | 'completed' | 'scheduled' | 'cancelled'>('all')

  // Find student and their sessions
  const student = students.find(s => s.id === studentId)
  const studentSessions = sessions.filter(s => s.studentId === studentId)

  if (!student) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Student Not Found</h1>
          <p className="text-gray-600 mb-4">The student you're looking for doesn't exist.</p>
          <Button variant="gradient" gradientType="nerdy" onClick={() => router.push('/students')}>
            Back to Students
          </Button>
        </div>
      </div>
    )
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const completedSessions = studentSessions.filter(s => s.status === 'completed')
    const scheduledSessions = studentSessions.filter(s => s.status === 'scheduled')
    const cancelledSessions = studentSessions.filter(s => s.status === 'cancelled')
    
    const totalEarnings = completedSessions.reduce((sum, s) => sum + (s.earnings || 0), 0)
    const totalHours = completedSessions.reduce((sum, s) => sum + s.duration, 0) / 60
    const avgRating = completedSessions.length > 0 
      ? completedSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / completedSessions.length 
      : 0

    // Calculate monthly progress (last 6 months)
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthSessions = completedSessions.filter(s => 
        s.date.getMonth() === date.getMonth() && s.date.getFullYear() === date.getFullYear()
      )
      monthlyData.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        sessions: monthSessions.length,
        hours: monthSessions.reduce((sum, s) => sum + s.duration, 0) / 60,
        avgRating: monthSessions.length > 0 
          ? monthSessions.reduce((sum, s) => sum + (s.rating || 0), 0) / monthSessions.length 
          : 0
      })
    }

    return {
      totalSessions: studentSessions.length,
      completedSessions: completedSessions.length,
      scheduledSessions: scheduledSessions.length,
      cancelledSessions: cancelledSessions.length,
      totalEarnings,
      totalHours: Math.round(totalHours * 10) / 10,
      avgRating: Math.round(avgRating * 10) / 10,
      attendanceRate: student.progress.attendance,
      monthlyData
    }
  }, [studentSessions, student])

  // Filter sessions based on current filter
  const filteredSessions = useMemo(() => {
    if (sessionFilter === 'all') return studentSessions
    return studentSessions.filter(session => session.status === sessionFilter)
  }, [studentSessions, sessionFilter])

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
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

  const ProgressChart = () => (
    <div className="h-32">
      <div className="flex justify-between items-end h-full">
        {stats.monthlyData.map((data, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className="flex flex-col justify-end h-20 mb-2">
              <div 
                className="bg-gradient-nerdy rounded-t w-6 transition-all duration-500"
                style={{ height: `${(data.sessions / Math.max(...stats.monthlyData.map(d => d.sessions)) || 1) * 100}%` }}
              />
            </div>
            <div className="text-xs text-gray-500">{data.month}</div>
            <div className="text-xs font-medium text-gray-900">{data.sessions}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const SessionCard = ({ session }: { session: Session }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="group"
    >
      <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-lg transition-all duration-300">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-gray-900">{session.subject}</h3>
            <p className="text-sm text-gray-500">
              {formatDate(session.date)} at {formatTime(session.date)}
            </p>
          </div>
          <Badge 
            variant="secondary" 
            className={cn('text-xs border', getStatusColor(session.status))}
          >
            <span className="flex items-center gap-1">
              {getStatusIcon(session.status)}
              {session.status.replace('_', ' ')}
            </span>
          </Badge>
        </div>

        <div className="flex items-center gap-4 mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{formatDuration(session.duration)}</span>
          </div>
          {session.rating && (
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 text-yellow-500 fill-current" />
              <span>{session.rating}</span>
            </div>
          )}
          {session.earnings && (
            <div className="flex items-center gap-1">
              <DollarSign className="h-3 w-3 text-green-600" />
              <span>${session.earnings}</span>
            </div>
          )}
        </div>

        {session.notes && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {session.notes}
          </p>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => router.push('/students')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </div>

          {/* Student Profile Header */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-6">
                <Avatar
                  src={student.avatar}
                  fallback={`${student.firstName[0]}${student.lastName[0]}`}
                  size="2xl"
                  className="border-4 border-purple-200"
                />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {student.firstName} {student.lastName}
                  </h1>
                  <div className="flex items-center gap-4 text-gray-600 mb-3">
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-4 w-4" />
                      Grade {student.grade}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Student since {student.createdAt.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {student.subjects.map(subject => (
                      <Badge key={subject} variant="secondary" className="text-xs bg-purple-100 text-purple-700 border-purple-200">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="gradient" gradientType="nerdy" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Session
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-white rounded-xl border border-blue-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{stats.completedSessions}</div>
                <div className="text-sm text-gray-600">Sessions Completed</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{student.progress.performance}%</div>
                <div className="text-sm text-gray-600">Performance</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-yellow-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{stats.avgRating || '-'}</div>
                <div className="text-sm text-gray-600">Avg Rating</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <div className="text-xl font-bold text-gray-900">{stats.totalHours}h</div>
                <div className="text-sm text-gray-600">Total Hours</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex gap-2">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'sessions', label: 'Sessions', icon: Calendar },
                { id: 'progress', label: 'Progress', icon: TrendingUp },
                { id: 'notes', label: 'Notes', icon: FileText }
              ].map(tab => {
                const Icon = tab.icon
                return (
                  <Button
                    key={tab.id}
                    variant={activeTab === tab.id ? 'gradient' : 'outline'}
                    gradientType={activeTab === tab.id ? 'nerdy' : undefined}
                    size="sm"
                    onClick={() => setActiveTab(tab.id as any)}
                    className="flex-1"
                  >
                    <Icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </Button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-3 gap-6"
              >
                {/* Progress Overview */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Progress Overview</h3>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Performance</span>
                            <span className="text-gray-900 font-medium">{student.progress.performance}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full bg-gradient-nerdy transition-all duration-500"
                              style={{ width: `${student.progress.performance}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Attendance</span>
                            <span className="text-gray-900 font-medium">{student.progress.attendance}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full bg-gradient-pink-cyan transition-all duration-500"
                              style={{ width: `${student.progress.attendance}%` }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">Engagement</span>
                            <span className="text-gray-900 font-medium">{student.progress.engagement}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                              className="h-3 rounded-full bg-gradient-yellow-pink transition-all duration-500"
                              style={{ width: `${student.progress.engagement}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Activity (Last 6 Months)</h3>
                    <ProgressChart />
                  </div>
                </div>

                {/* Student Information */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                    <div className="space-y-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900 mb-1">Parent/Guardian</div>
                        <div className="text-sm text-gray-600">{student.parentContact.name}</div>
                        <div className="text-xs text-gray-500">{student.parentContact.relationship}</div>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{student.parentContact.email}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{student.parentContact.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notes</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {student.notes}
                    </p>
                  </div>

                  <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {student.tags.map(tag => (
                        <Badge key={tag} variant="secondary" className="text-xs bg-gray-100 text-gray-700 border-gray-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sessions' && (
              <motion.div
                key="sessions"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm mb-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Session History</h3>
                    <div className="flex gap-2">
                      <select
                        value={sessionFilter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSessionFilter(e.target.value as any)}
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="all">All Sessions</option>
                        <option value="completed">Completed</option>
                        <option value="scheduled">Scheduled</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {filteredSessions.length === 0 && (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No sessions found</h3>
                    <p className="text-gray-500">No sessions match the current filter</p>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'progress' && (
              <motion.div
                key="progress"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              >
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Academic Performance</h3>
                  <div className="space-y-6">
                    {student.subjects.map(subject => {
                      // Mock subject-specific performance
                      const performance = Math.floor(Math.random() * 30) + 70
                      return (
                        <div key={subject}>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">{subject}</span>
                            <span className="text-gray-900 font-medium">{performance}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full bg-gradient-nerdy transition-all duration-500"
                              style={{ width: `${performance}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Trends</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <div>
                          <div className="font-medium text-green-900">Performance Improving</div>
                          <div className="text-sm text-green-700">+12% this month</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="font-medium text-blue-900">Consistent Attendance</div>
                          <div className="text-sm text-blue-700">{student.progress.attendance}% attendance rate</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-yellow-600" />
                        <div>
                          <div className="font-medium text-yellow-900">Goals on Track</div>
                          <div className="text-sm text-yellow-700">Meeting learning objectives</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-900">Session Notes & Progress</h3>
                    <Button variant="gradient" gradientType="nerdy" size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Note
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {studentSessions
                      .filter(s => s.notes)
                      .sort((a, b) => b.date.getTime() - a.date.getTime())
                      .slice(0, 10)
                      .map(session => (
                        <div key={session.id} className="border-l-4 border-purple-200 pl-4 py-2">
                          <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-900">
                              {session.subject} - {formatDate(session.date)}
                            </div>
                            {session.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                                <span className="text-xs text-gray-600">{session.rating}</span>
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed">
                            {session.notes}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
} 