'use client'

import React, { useState, useEffect } from 'react'
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
  User,
  BookOpen,
  Target,
  Award,
  FileText,
  DollarSign,
  Video,
  CheckCircle,
  AlertCircle,
  BarChart,
  Activity,
  Loader
} from 'lucide-react'
import { Card, Button, Badge, Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getStudent, getIndividualStudentStats } from '@/lib/api/students'
import { getSessions } from '@/lib/api/sessions'

interface StudentDetail {
  id: string
  tutor_id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  grade: string
  subjects: string[]
  goals?: string
  notes?: string
  is_active: boolean
  parent_name?: string
  parent_email?: string
  parent_phone?: string
  address?: string
  created_at: string
  updated_at: string
}

interface StudentStats {
  totalSessions: number
  completedSessions: number
  cancelledSessions: number
  attendanceRate: number
  averageRating: number
  totalHours: number
  subjectDistribution: { subject: string; count: number }[]
  monthlyProgress: { month: string; performance: number }[]
}

interface SessionHistory {
  id: string
  subject: string
  scheduled_at: string
  duration_minutes: number
  status: string
  price: number
  notes?: string
  rating?: number
}

export default function StudentDetailPage() {
  const router = useRouter()
  const params = useParams()
  const studentId = params.studentId as string
  const { tutor } = useAuth()
  
  const [student, setStudent] = useState<StudentDetail | null>(null)
  const [stats, setStats] = useState<StudentStats | null>(null)
  const [sessions, setSessions] = useState<SessionHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'progress' | 'notes'>('overview')

  // Fetch student data
  useEffect(() => {
    const fetchStudentData = async () => {
      if (!tutor?.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const [studentData, statsData, sessionsData] = await Promise.all([
          getStudent(studentId),
          getIndividualStudentStats(studentId),
          getSessions(tutor.id, { studentId })
        ])
        
        setStudent(studentData)
        
        // Use the stats data directly from getIndividualStudentStats
        if (statsData) {
          const calculatedStats = {
            totalSessions: statsData.totalSessions,
            completedSessions: statsData.completedSessions,
            cancelledSessions: statsData.cancelledSessions,
            attendanceRate: statsData.attendanceRate,
            averageRating: statsData.averageRating,
            totalHours: statsData.totalHours,
            subjectDistribution: sessionsData.reduce((acc: any[], s: any) => {
              const existing = acc.find(item => item.subject === s.subject)
              if (existing) {
                existing.count++
              } else {
                acc.push({ subject: s.subject, count: 1 })
              }
              return acc
            }, []),
            monthlyProgress: [] // This would need to be calculated from historical data
          }
          
          setStats(calculatedStats)
        }
        setSessions(sessionsData)
      } catch (err) {
        console.error('Error fetching student data:', err)
        setError('Failed to load student details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudentData()
  }, [studentId, tutor?.id])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getPerformanceTrend = () => {
    if (!stats?.monthlyProgress || stats.monthlyProgress.length < 2) return 'stable'
    
    const recent = stats.monthlyProgress.slice(-3)
    const avgRecent = recent.reduce((sum: number, m: { performance: number }) => sum + m.performance, 0) / recent.length
    const avgPrevious = stats.monthlyProgress.slice(-6, -3).reduce((sum: number, m: { performance: number }) => sum + m.performance, 0) / 3
    
    if (avgRecent > avgPrevious + 5) return 'improving'
    if (avgRecent < avgPrevious - 5) return 'declining'
    return 'stable'
  }

  const performanceTrend = getPerformanceTrend()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading student details...</p>
        </div>
      </div>
    )
  }

  if (error || !student) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Student not found'}
          </h3>
          <Button
            variant="outline"
            onClick={() => router.push('/students')}
            className="mt-4"
          >
            Back to Students
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/students')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Students
          </Button>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                fallback={`${student.first_name[0]}${student.last_name[0]}`}
                size="xl"
                className="border-4 border-purple-200 dark:border-purple-800"
              />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {student.first_name} {student.last_name}
                </h1>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary" className="text-sm">
                    {student.grade}
                  </Badge>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      'text-sm',
                      student.is_active 
                        ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400' 
                        : 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300'
                    )}
                  >
                    {student.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                    {performanceTrend === 'improving' && (
                      <>
                        <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-green-600 dark:text-green-400">Improving</span>
                      </>
                    )}
                    {performanceTrend === 'declining' && (
                      <>
                        <TrendingDown className="h-4 w-4 text-red-600 dark:text-red-400" />
                        <span className="text-red-600 dark:text-red-400">Needs Attention</span>
                      </>
                    )}
                    {performanceTrend === 'stable' && (
                      <>
                        <Activity className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-blue-600 dark:text-blue-400">Stable Progress</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                leftIcon={<MessageCircle className="h-4 w-4" />}
                onClick={() => router.push(`/messages?newConversation=${studentId}`)}
              >
                Message
              </Button>
              <Button
                variant="gradient"
                gradientType="nerdy"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => router.push(`/sessions/new?studentId=${student.id}`)}
              >
                Schedule Session
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.totalSessions || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Sessions</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {Math.round(stats?.attendanceRate || 0)}%
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Attendance</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.averageRating?.toFixed(1) || 'N/A'}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Rating</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {stats?.totalHours || 0}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {student.subjects.length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Subjects</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: User },
              { id: 'sessions', label: 'Sessions', icon: Calendar },
              { id: 'progress', label: 'Progress', icon: BarChart },
              { id: 'notes', label: 'Notes', icon: FileText }
            ].map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={cn(
                    'flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors',
                    activeTab === tab.id
                      ? 'text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <>
              {/* Contact Information */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Contact Information
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Student</h3>
                    <div className="space-y-2 text-sm">
                      {student.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${student.email}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                            {student.email}
                          </a>
                        </div>
                      )}
                      {student.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${student.phone}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                            {student.phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Parent/Guardian</h3>
                    <div className="space-y-2 text-sm">
                      {student.parent_name && (
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="text-gray-900 dark:text-gray-100">{student.parent_name}</span>
                        </div>
                      )}
                      {student.parent_email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <a href={`mailto:${student.parent_email}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                            {student.parent_email}
                          </a>
                        </div>
                      )}
                      {student.parent_phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <a href={`tel:${student.parent_phone}`} className="text-purple-600 dark:text-purple-400 hover:underline">
                            {student.parent_phone}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Subjects & Goals */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Academic Information
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Subjects</h3>
                    <div className="flex flex-wrap gap-2">
                      {student.subjects.map((subject, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  {student.goals && (
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Learning Goals</h3>
                      <p className="text-gray-600 dark:text-gray-400">{student.goals}</p>
                    </div>
                  )}
                </div>
              </Card>
            </>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Session History
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Calendar className="h-4 w-4" />}
                  onClick={() => router.push(`/sessions?studentId=${student.id}`)}
                >
                  View All
                </Button>
              </div>
              
              <div className="space-y-3">
                {sessions.slice(0, 10).map((session) => (
                  <div 
                    key={session.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                    onClick={() => router.push(`/sessions/${session.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        'w-2 h-12 rounded-full',
                        session.status === 'completed' ? 'bg-green-500' : 
                        session.status === 'scheduled' ? 'bg-blue-500' :
                        session.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                      )} />
                      <div>
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {session.subject}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(session.scheduled_at)} at {formatTime(session.scheduled_at)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {session.rating && (
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          <span className="text-sm font-medium">{session.rating}</span>
                        </div>
                      )}
                      <Badge variant="secondary" className="text-xs">
                        {session.duration_minutes} min
                      </Badge>
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        ${session.price}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Progress Tab */}
          {activeTab === 'progress' && (
            <>
              {/* Performance Chart */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Performance Trend
                </h2>
                
                {stats?.monthlyProgress && stats.monthlyProgress.length > 0 ? (
                  <div className="h-64 flex items-end justify-between gap-2">
                    {stats.monthlyProgress.slice(-6).map((month, index) => {
                      const height = month.performance
                      return (
                        <div key={index} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: '100%' }}>
                            <div 
                              className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t transition-all duration-500"
                              style={{ height: `${height}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{month.month}</span>
                          <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                            {height}%
                          </span>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No performance data available yet
                  </div>
                )}
              </Card>

              {/* Subject Distribution */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
                  Subject Distribution
                </h2>
                
                {stats?.subjectDistribution && stats.subjectDistribution.length > 0 ? (
                  <div className="space-y-3">
                    {stats.subjectDistribution.map((subject, index) => {
                      const percentage = (subject.count / stats.totalSessions) * 100
                      return (
                        <div key={index}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {subject.subject}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {subject.count} sessions ({percentage.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No subject data available yet
                  </div>
                )}
              </Card>
            </>
          )}

          {/* Notes Tab */}
          {activeTab === 'notes' && (
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notes
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Edit className="h-4 w-4" />}
                >
                  Edit Notes
                </Button>
              </div>
              
              <div className="prose dark:prose-invert max-w-none">
                {student.notes ? (
                  <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{student.notes}</p>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400 italic">No notes added yet</p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
} 