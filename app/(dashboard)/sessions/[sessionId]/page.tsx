'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  User, 
  BookOpen,
  DollarSign,
  Video,
  AlertCircle,
  Check,
  X,
  ChevronLeft,
  Edit2,
  Save,
  Loader,
  FileText,
  Target,
  MessageSquare
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/simple-auth-context'
import { getSession, updateSession, cancelSession } from '@/lib/api/sessions'

interface SessionDetail {
  id: string
  tutor_id: string
  student_id: string
  subject: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show'
  price: number
  notes?: string
  lesson_plan?: {
    title?: string
    objectives?: string[]
    materials?: string[]
  }
  homework?: string
  created_at: string
  students?: {
    id: string
    first_name: string
    last_name: string
    grade: string
    avatar_url?: string
    parent_email?: string
    parent_phone?: string
  }
}

export default function SessionDetailPage() {
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string
  const { tutor } = useAuth()
  
  const [session, setSession] = useState<SessionDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  
  // Edit form data
  const [editData, setEditData] = useState({
    notes: '',
    homework: '',
    lessonTitle: '',
    objectives: [''],
    materials: ['']
  })

  // Fetch session details
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const data = await getSession(sessionId)
        setSession(data)
        
        // Initialize edit data
        setEditData({
          notes: data.notes || '',
          homework: data.homework || '',
          lessonTitle: data.lesson_plan?.title || '',
          objectives: data.lesson_plan?.objectives || [''],
          materials: data.lesson_plan?.materials || ['']
        })
      } catch (err) {
        console.error('Error fetching session:', err)
        setError('Failed to load session details')
      } finally {
        setLoading(false)
      }
    }
    
    fetchSession()
  }, [sessionId])

  // Handle save
  const handleSave = async () => {
    if (!session) return
    
    setSaving(true)
    setError(null)
    
    try {
      const updates = {
        notes: editData.notes,
        homework: editData.homework,
        lesson_plan: {
          title: editData.lessonTitle,
          objectives: editData.objectives.filter(o => o.trim()),
          materials: editData.materials.filter(m => m.trim())
        }
      }
      
      const updatedSession = await updateSession(session.id, updates)
      setSession(updatedSession)
      setEditing(false)
    } catch (err) {
      console.error('Error updating session:', err)
      setError('Failed to update session')
    } finally {
      setSaving(false)
    }
  }

  // Handle cancel session
  const handleCancelSession = async () => {
    if (!session || !confirm('Are you sure you want to cancel this session?')) return
    
    try {
      await cancelSession(session.id)
      router.push('/sessions')
    } catch (err) {
      console.error('Error cancelling session:', err)
      setError('Failed to cancel session')
    }
  }

  // Handle mark as complete
  const handleMarkComplete = async () => {
    if (!session) return
    
    try {
      const updatedSession = await updateSession(session.id, { status: 'completed' })
      setSession(updatedSession)
    } catch (err) {
      console.error('Error completing session:', err)
      setError('Failed to mark session as complete')
    }
  }

  // Handle objectives
  const addObjective = () => {
    setEditData(prev => ({ ...prev, objectives: [...prev.objectives, ''] }))
  }

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...editData.objectives]
    newObjectives[index] = value
    setEditData(prev => ({ ...prev, objectives: newObjectives }))
  }

  const removeObjective = (index: number) => {
    setEditData(prev => ({ 
      ...prev, 
      objectives: prev.objectives.filter((_, i) => i !== index) 
    }))
  }

  // Handle materials
  const addMaterial = () => {
    setEditData(prev => ({ ...prev, materials: [...prev.materials, ''] }))
  }

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...editData.materials]
    newMaterials[index] = value
    setEditData(prev => ({ ...prev, materials: newMaterials }))
  }

  const removeMaterial = (index: number) => {
    setEditData(prev => ({ 
      ...prev, 
      materials: prev.materials.filter((_, i) => i !== index) 
    }))
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading session details...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Session not found'}
          </h3>
          <Button
            variant="outline"
            onClick={() => router.push('/sessions')}
            className="mt-4"
          >
            Back to Sessions
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/sessions')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Sessions
          </Button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Session Details
              </h1>
              <div className="flex items-center gap-4">
                <Badge 
                  variant="secondary" 
                  className={cn('text-sm', getStatusColor(session.status))}
                >
                  {session.status.replace('_', ' ')}
                </Badge>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Created {new Date(session.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
            
            <div className="flex gap-2">
              {session.status === 'scheduled' && (
                <>
                  <Button
                    variant="gradient"
                    gradientType="nerdy"
                    leftIcon={<Video className="h-4 w-4" />}
                    onClick={() => window.open(`https://meet.nerdy-tutor.com/session/${session.id}`, '_blank')}
                  >
                    Join Session
                  </Button>
                  {!editing && (
                    <Button
                      variant="outline"
                      leftIcon={<Edit2 className="h-4 w-4" />}
                      onClick={() => setEditing(true)}
                    >
                      Edit
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Session Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Session Information
              </h2>
              
              <div className="space-y-4">
                {/* Student */}
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                    {session.students?.first_name[0]}{session.students?.last_name[0]}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {session.students?.first_name} {session.students?.last_name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {session.students?.grade} • {session.subject}
                    </div>
                  </div>
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(session.scheduled_at)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatTime(session.scheduled_at)} ({session.duration_minutes} min)
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-1">
                    <DollarSign className="h-4 w-4" />
                    Session Price
                  </div>
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    ${session.price}
                  </div>
                </div>
              </div>
            </Card>

            {/* Notes & Lesson Plan */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                  Notes & Lesson Plan
                </h2>
                {editing && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant="gradient"
                      gradientType="nerdy"
                      size="sm"
                      leftIcon={saving ? <Loader className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </Button>
                  </div>
                )}
              </div>

              {editing ? (
                <div className="space-y-4">
                  {/* Session Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <MessageSquare className="inline h-4 w-4 mr-1" />
                      Session Notes
                    </label>
                    <textarea
                      value={editData.notes}
                      onChange={(e) => setEditData(prev => ({ ...prev, notes: e.target.value }))}
                      rows={3}
                      placeholder="Notes about the session..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>

                  {/* Lesson Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      Lesson Title
                    </label>
                    <input
                      type="text"
                      value={editData.lessonTitle}
                      onChange={(e) => setEditData(prev => ({ ...prev, lessonTitle: e.target.value }))}
                      placeholder="e.g., Introduction to Quadratic Equations"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>

                  {/* Objectives */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <Target className="inline h-4 w-4 mr-1" />
                      Learning Objectives
                    </label>
                    <div className="space-y-2">
                      {editData.objectives.map((objective, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={objective}
                            onChange={(e) => updateObjective(index, e.target.value)}
                            placeholder="Learning objective..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          />
                          {editData.objectives.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeObjective(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addObjective}
                      >
                        Add Objective
                      </Button>
                    </div>
                  </div>

                  {/* Materials */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <BookOpen className="inline h-4 w-4 mr-1" />
                      Materials Needed
                    </label>
                    <div className="space-y-2">
                      {editData.materials.map((material, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={material}
                            onChange={(e) => updateMaterial(index, e.target.value)}
                            placeholder="Material needed..."
                            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                          />
                          {editData.materials.length > 1 && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeMaterial(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addMaterial}
                      >
                        Add Material
                      </Button>
                    </div>
                  </div>

                  {/* Homework */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Homework Assignment
                    </label>
                    <textarea
                      value={editData.homework}
                      onChange={(e) => setEditData(prev => ({ ...prev, homework: e.target.value }))}
                      rows={3}
                      placeholder="Homework for the student..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display mode */}
                  {session.notes && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Session Notes</h3>
                      <p className="text-gray-900 dark:text-gray-100">{session.notes}</p>
                    </div>
                  )}

                  {session.lesson_plan?.title && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Lesson Title</h3>
                      <p className="text-gray-900 dark:text-gray-100">{session.lesson_plan.title}</p>
                    </div>
                  )}

                  {session.lesson_plan?.objectives && session.lesson_plan.objectives.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Learning Objectives</h3>
                      <ul className="list-disc list-inside space-y-1">
                        {session.lesson_plan.objectives.map((obj, index) => (
                          <li key={index} className="text-gray-900 dark:text-gray-100">{obj}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {session.lesson_plan?.materials && session.lesson_plan.materials.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Materials Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {session.lesson_plan.materials.map((material, index) => (
                          <Badge key={index} variant="secondary">{material}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.homework && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Homework Assignment</h3>
                      <p className="text-gray-900 dark:text-gray-100">{session.homework}</p>
                    </div>
                  )}

                  {!session.notes && !session.lesson_plan?.title && !session.homework && (
                    <p className="text-gray-500 dark:text-gray-400 italic">
                      No notes or lesson plan added yet
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Actions
              </h2>
              
              <div className="space-y-2">
                {session.status === 'scheduled' && (
                  <>
                    <Button
                      variant="solid"
                      leftIcon={<Check className="h-4 w-4" />}
                      onClick={handleMarkComplete}
                      className="w-full"
                    >
                      Mark as Complete
                    </Button>
                    <Button
                      variant="outline"
                      leftIcon={<X className="h-4 w-4" />}
                      onClick={handleCancelSession}
                      className="w-full text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Cancel Session
                    </Button>
                  </>
                )}
                
                <Button
                  variant="outline"
                  leftIcon={<User className="h-4 w-4" />}
                  onClick={() => router.push(`/students/${session.student_id}`)}
                  className="w-full"
                >
                  View Student Profile
                </Button>
              </div>
            </Card>

            {/* Parent Contact */}
            {session.students && (session.students.parent_email || session.students.parent_phone) && (
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Parent Contact
                </h2>
                
                <div className="space-y-2 text-sm">
                  {session.students.parent_email && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Email:</span>
                      <a 
                        href={`mailto:${session.students.parent_email}`}
                        className="ml-2 text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {session.students.parent_email}
                      </a>
                    </div>
                  )}
                  
                  {session.students.parent_phone && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                      <a 
                        href={`tel:${session.students.parent_phone}`}
                        className="ml-2 text-purple-600 dark:text-purple-400 hover:underline"
                      >
                        {session.students.parent_phone}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 