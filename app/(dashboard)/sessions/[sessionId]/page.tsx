'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  Star,
  User,
  BookOpen,
  FileText,
  DollarSign,
  Video,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Copy,
  Download,
  MessageCircle,
  Phone,
  Mail,
  MoreHorizontal,
  Play,
  Pause,
  Square,
  Target,
  Award,
  Lightbulb,
  ClipboardList,
  Timer,
  Users,
  MapPin,
  Settings,
  Send,
  Save,
  Plus
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

export default function SessionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string
  
  const [activeTab, setActiveTab] = useState<'overview' | 'lesson' | 'homework' | 'notes'>('overview')
  const [rating, setRating] = useState<number>(0)
  const [sessionNotes, setSessionNotes] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  // Find session and student
  const session = sessions.find(s => s.id === sessionId)
  const student = session ? students.find(s => s.id === session.studentId) : null

  if (!session || !student) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Session Not Found</h1>
          <p className="text-gray-600 mb-4">The session you're looking for doesn't exist.</p>
          <Button variant="gradient" gradientType="nerdy" onClick={() => router.push('/sessions')}>
            Back to Sessions
          </Button>
        </div>
      </div>
    )
  }

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
      case 'scheduled': return <Clock className="h-4 w-4" />
      case 'in_progress': return <Video className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'cancelled': return <XCircle className="h-4 w-4" />
      case 'no_show': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const canEdit = session.status === 'scheduled' || session.status === 'in_progress'
  const canComplete = session.status === 'scheduled' || session.status === 'in_progress'
  const canCancel = session.status === 'scheduled'

  const LessonPlanSection = () => {
    if (!session.lessonPlan) {
      return (
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6 text-center">
            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Lesson Plan</h3>
            <p className="text-gray-500 mb-4">This session doesn't have a lesson plan yet.</p>
            <Button variant="gradient" gradientType="nerdy" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Create Lesson Plan
            </Button>
          </div>
        </Card>
      )
    }

    const lessonPlan = session.lessonPlan

    return (
      <div className="space-y-6">
        {/* Lesson Plan Header */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{lessonPlan.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {lessonPlan.subject}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    Grade {lessonPlan.grade}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDuration(lessonPlan.duration)}
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            {/* Objectives */}
            <div className="mb-6">
              <h4 className="font-semibold text-gray-900 mb-3">Learning Objectives</h4>
              <ul className="space-y-2">
                {lessonPlan.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Materials */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">Materials Needed</h4>
              <div className="flex flex-wrap gap-2">
                {lessonPlan.materials.map((material, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Activities */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h4 className="font-semibold text-gray-900 mb-4">Activities</h4>
            <div className="space-y-4">
              {lessonPlan.activities.map((activity, index) => (
                <div key={activity.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h5 className="font-medium text-gray-900 mb-1">{activity.title}</h5>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Timer className="h-3 w-3" />
                      <span>{formatDuration(activity.duration)}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" size="sm" className="capitalize">
                      {activity.type}
                    </Badge>
                    <div className="flex flex-wrap gap-1">
                      {activity.resources.slice(0, 3).map((resource, i) => (
                        <Badge key={i} variant="outline" size="sm" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                      {activity.resources.length > 3 && (
                        <Badge variant="outline" size="sm" className="text-xs">
                          +{activity.resources.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Assessments */}
        {lessonPlan.assessments && lessonPlan.assessments.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <div className="p-6">
              <h4 className="font-semibold text-gray-900 mb-4">Assessments</h4>
              <div className="space-y-3">
                {lessonPlan.assessments.map((assessment, index) => (
                  <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900 mb-1">{assessment.title}</h5>
                        <p className="text-sm text-gray-600">{assessment.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-gray-900">{assessment.points} pts</div>
                        <Badge variant="secondary" size="sm" className="capitalize">
                          {assessment.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}
      </div>
    )
  }

  const HomeworkSection = () => {
    if (!session.homework || session.homework.length === 0) {
      return (
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6 text-center">
            <ClipboardList className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Homework Assigned</h3>
            <p className="text-gray-500 mb-4">No homework has been assigned for this session yet.</p>
            <Button variant="gradient" gradientType="nerdy" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Assign Homework
            </Button>
          </div>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {session.homework.map((homework, index) => (
          <Card key={homework.id} className="bg-white/80 backdrop-blur-sm border-0">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{homework.title}</h3>
                  <p className="text-gray-600 mb-3">{homework.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {homework.dueDate.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      {homework.subject}
                    </span>
                  </div>
                </div>
                <Badge 
                  variant="secondary" 
                  className={cn(
                    'capitalize',
                    homework.status === 'completed' && 'bg-green-100 text-green-800',
                    homework.status === 'in_progress' && 'bg-blue-100 text-blue-800',
                    homework.status === 'late' && 'bg-red-100 text-red-800',
                    homework.status === 'missing' && 'bg-orange-100 text-orange-800'
                  )}
                >
                  {homework.status.replace('_', ' ')}
                </Badge>
              </div>

              {/* Attachments */}
              {homework.attachments && homework.attachments.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Attachments</h4>
                  <div className="flex flex-wrap gap-2">
                    {homework.attachments.map((attachment, i) => (
                      <Badge key={i} variant="outline" size="sm" className="cursor-pointer hover:bg-gray-50">
                        <FileText className="h-3 w-3 mr-1" />
                        {attachment}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Feedback and Grade */}
              {homework.feedback && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-2">Feedback</h4>
                  <p className="text-sm text-gray-600">{homework.feedback}</p>
                  {homework.grade && (
                    <div className="mt-2">
                      <span className="text-sm font-medium text-gray-900">Grade: {homework.grade}%</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-6xl mx-auto p-6">
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
              onClick={() => router.push('/sessions')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sessions
            </Button>
          </div>

          {/* Session Header */}
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <Avatar
                    src={student.avatar}
                    fallback={`${student.firstName[0]}${student.lastName[0]}`}
                    size="lg"
                    className="border-2 border-purple-200"
                  />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-1">
                      {session.subject} Session
                    </h1>
                    <p className="text-gray-600 mb-2">
                      with {student.firstName} {student.lastName}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(session.date)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {formatDuration(session.duration)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge 
                    variant="secondary" 
                    className={cn('text-sm border', getStatusColor(session.status))}
                  >
                    <span className="flex items-center gap-2">
                      {getStatusIcon(session.status)}
                      {session.status.replace('_', ' ')}
                    </span>
                  </Badge>
                  
                  <div className="flex gap-2">
                    {canEdit && (
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    
                    {canComplete && (
                      <Button variant="gradient" gradientType="nerdy" size="sm">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Mark Complete
                      </Button>
                    )}
                    
                    {canCancel && (
                      <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>
                    )}
                    
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Session Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">Grade {student.grade}</div>
                  <div className="text-sm text-gray-500">Student Level</div>
                </div>
                
                {session.rating && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-1">
                      {session.rating}
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    </div>
                    <div className="text-sm text-gray-500">Session Rating</div>
                  </div>
                )}
                
                {session.earnings && (
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900 flex items-center justify-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      {session.earnings}
                    </div>
                    <div className="text-sm text-gray-500">Earnings</div>
                  </div>
                )}
                
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900">{student.progress.performance}%</div>
                  <div className="text-sm text-gray-500">Student Performance</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <Card className="bg-white/80 backdrop-blur-sm border-0">
            <div className="p-2">
              <div className="flex gap-1">
                {[
                  { id: 'overview', label: 'Overview', icon: User },
                  { id: 'lesson', label: 'Lesson Plan', icon: BookOpen },
                  { id: 'homework', label: 'Homework', icon: ClipboardList },
                  { id: 'notes', label: 'Notes', icon: FileText }
                ].map(tab => {
                  const Icon = tab.icon
                  return (
                    <Button
                      key={tab.id}
                      variant={activeTab === tab.id ? 'solid' : 'ghost'}
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
          </Card>
        </motion.div>

        {/* Tab Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
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
                {/* Session Information */}
                <div className="lg:col-span-2 space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Overview</h3>
                      
                      {session.notes && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">Session Notes</h4>
                          <p className="text-gray-600 leading-relaxed">{session.notes}</p>
                        </div>
                      )}

                      {/* Quick Actions */}
                      <div className="grid grid-cols-2 gap-3 mt-6">
                        <Button variant="outline" size="sm" className="justify-start">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message Student
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start">
                          <Copy className="h-4 w-4 mr-2" />
                          Duplicate Session
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start">
                          <Calendar className="h-4 w-4 mr-2" />
                          Reschedule
                        </Button>
                        <Button variant="outline" size="sm" className="justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Export Report
                        </Button>
                      </div>
                    </div>
                  </Card>

                  {/* Session Timeline */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Session Timeline</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <Calendar className="h-5 w-5 text-blue-500" />
                          <div>
                            <div className="font-medium text-gray-900">Session Scheduled</div>
                            <div className="text-sm text-gray-500">{session.createdAt.toLocaleDateString()}</div>
                          </div>
                        </div>
                        
                        {session.status === 'completed' && (
                          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-500" />
                            <div>
                              <div className="font-medium text-gray-900">Session Completed</div>
                              <div className="text-sm text-gray-500">{session.updatedAt.toLocaleDateString()}</div>
                            </div>
                          </div>
                        )}
                        
                        {session.status === 'cancelled' && (
                          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                            <XCircle className="h-5 w-5 text-red-500" />
                            <div>
                              <div className="font-medium text-gray-900">Session Cancelled</div>
                              <div className="text-sm text-gray-500">{session.updatedAt.toLocaleDateString()}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>

                {/* Student Information */}
                <div className="space-y-6">
                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Information</h3>
                      <div className="flex items-center gap-3 mb-4">
                        <Avatar
                          src={student.avatar}
                          fallback={`${student.firstName[0]}${student.lastName[0]}`}
                          size="md"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{student.firstName} {student.lastName}</div>
                          <div className="text-sm text-gray-500">Grade {student.grade}</div>
                        </div>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Subjects</div>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {student.subjects.map(subject => (
                              <Badge key={subject} variant="secondary" size="sm">
                                {subject}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-900">Performance</div>
                          <div className="text-sm text-gray-600">{student.progress.performance}% overall</div>
                        </div>
                        
                        <div>
                          <div className="text-sm font-medium text-gray-900">Attendance Rate</div>
                          <div className="text-sm text-gray-600">{student.progress.attendance}%</div>
                        </div>
                      </div>

                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button variant="outline" size="sm" className="w-full">
                          <User className="h-4 w-4 mr-2" />
                          View Student Profile
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <Card className="bg-white/80 backdrop-blur-sm border-0">
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h3>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">Parent/Guardian</div>
                          <div className="text-sm text-gray-600">{student.parentContact.name}</div>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="h-3 w-3" />
                          <span>{student.parentContact.email}</span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          <span>{student.parentContact.phone}</span>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
              </motion.div>
            )}

            {activeTab === 'lesson' && (
              <motion.div
                key="lesson"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <LessonPlanSection />
              </motion.div>
            )}

            {activeTab === 'homework' && (
              <motion.div
                key="homework"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <HomeworkSection />
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div
                key="notes"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold text-gray-900">Session Notes & Feedback</h3>
                      <div className="flex gap-2">
                        {!isEditing && (
                          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Notes
                          </Button>
                        )}
                        {isEditing && (
                          <>
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                              Cancel
                            </Button>
                            <Button variant="gradient" gradientType="nerdy" size="sm">
                              <Save className="h-4 w-4 mr-2" />
                              Save Notes
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Session Rating */}
                    {session.status === 'completed' && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Session Rating</h4>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => setRating(star)}
                              className={cn(
                                "transition-colors",
                                star <= (rating || session.rating || 0) 
                                  ? "text-yellow-500" 
                                  : "text-gray-300"
                              )}
                            >
                              <Star className="h-6 w-6 fill-current" />
                            </button>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">
                            {rating || session.rating || 0}/5
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Notes Content */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Notes</h4>
                      {isEditing ? (
                        <textarea
                          value={sessionNotes || session.notes || ''}
                          onChange={(e) => setSessionNotes(e.target.value)}
                          placeholder="Add your session notes here..."
                          className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      ) : (
                        <div className="min-h-[160px] p-3 bg-gray-50 rounded-lg">
                          {session.notes ? (
                            <p className="text-gray-700 leading-relaxed">{session.notes}</p>
                          ) : (
                            <p className="text-gray-500 italic">No notes added yet.</p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick Note Templates */}
                    {isEditing && (
                      <div className="mt-4">
                        <h4 className="font-medium text-gray-900 mb-3">Quick Templates</h4>
                        <div className="grid grid-cols-2 gap-2">
                          {[
                            "Student showed great improvement in understanding",
                            "Need to review concepts from today's session",
                            "Student was engaged and asked good questions",
                            "Homework assignments completed successfully"
                          ].map((template, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-left justify-start h-auto p-2 text-xs"
                              onClick={() => setSessionNotes(sessionNotes + (sessionNotes ? '. ' : '') + template)}
                            >
                              {template}
                            </Button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  )
} 