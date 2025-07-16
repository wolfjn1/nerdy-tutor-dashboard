'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  User, 
  BookOpen,
  AlertCircle,
  Check,
  ChevronLeft,
  Plus,
  Loader
} from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getStudents } from '@/lib/api/students'
import { createSession } from '@/lib/api/sessions'

interface FormData {
  studentId: string
  subject: string
  date: string
  time: string
  duration: number
  price: number
  notes: string
  recurring: boolean
  recurringType: 'weekly' | 'biweekly' | 'monthly'
  recurringCount: number
}

export default function NewSessionPage() {
  const router = useRouter()
  const { tutor } = useAuth()
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState<FormData>({
    studentId: '',
    subject: '',
    date: '',
    time: '',
    duration: 60,
    price: 0,
    notes: '',
    recurring: false,
    recurringType: 'weekly',
    recurringCount: 4
  })

  // Fetch students
  useEffect(() => {
    const fetchStudents = async () => {
      if (!tutor?.id) return
      
      try {
        const data = await getStudents(tutor.id)
        setStudents(data.filter(s => s.is_active))
        
        // Set default price based on tutor's hourly rate
        if (tutor.hourly_rate) {
          setFormData(prev => ({ ...prev, price: tutor.hourly_rate }))
        }
      } catch (err) {
        console.error('Error fetching students:', err)
        setError('Failed to load students')
      } finally {
        setLoading(false)
      }
    }
    
    fetchStudents()
  }, [tutor])

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({ ...prev, [name]: checked }))
    } else if (name === 'duration' || name === 'price' || name === 'recurringCount') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
    
    // Auto-update subject when student is selected
    if (name === 'studentId' && value) {
      const student = students.find(s => s.id === value)
      if (student && student.subjects?.length > 0) {
        setFormData(prev => ({ ...prev, subject: student.subjects[0] }))
      }
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!tutor?.id) {
      setError('No tutor found')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      // Combine date and time
      const scheduledAt = new Date(`${formData.date}T${formData.time}`)
      
      if (formData.recurring) {
        // Create multiple sessions
        const sessions = []
        for (let i = 0; i < formData.recurringCount; i++) {
          const sessionDate = new Date(scheduledAt)
          
          if (formData.recurringType === 'weekly') {
            sessionDate.setDate(sessionDate.getDate() + (i * 7))
          } else if (formData.recurringType === 'biweekly') {
            sessionDate.setDate(sessionDate.getDate() + (i * 14))
          } else if (formData.recurringType === 'monthly') {
            sessionDate.setMonth(sessionDate.getMonth() + i)
          }
          
          sessions.push({
            tutor_id: tutor.id,
            student_id: formData.studentId,
            subject: formData.subject,
            scheduled_at: sessionDate.toISOString(),
            duration: formData.duration,
            notes: formData.notes
          })
        }
        
        // Create all sessions
        await Promise.all(sessions.map(session => createSession(session)))
        setSuccess(true)
        
        setTimeout(() => {
          router.push('/sessions')
        }, 1500)
      } else {
        // Create single session
        await createSession({
          tutor_id: tutor.id,
          student_id: formData.studentId,
          subject: formData.subject,
          scheduled_at: scheduledAt.toISOString(),
          duration: formData.duration,
          notes: formData.notes
        })
        
        setSuccess(true)
        
        setTimeout(() => {
          router.push('/sessions')
        }, 1500)
      }
    } catch (err) {
      console.error('Error creating session:', err)
      setError('Failed to create session. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/sessions')}
            className="mb-4"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back to Sessions
          </Button>
          
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Schedule New Session
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create a new tutoring session with one of your students
          </p>
        </div>

        {/* Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Student Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <User className="inline h-4 w-4 mr-1" />
                Student
              </label>
              <select
                name="studentId"
                value={formData.studentId}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="">Select a student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.first_name} {student.last_name} - {student.grade}
                  </option>
                ))}
              </select>
              {students.length === 0 && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No active students found. Add students first.
                </p>
              )}
            </div>

            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <BookOpen className="inline h-4 w-4 mr-1" />
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="e.g., Mathematics, Physics, English"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>

            {/* Date and Time */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline h-4 w-4 mr-1" />
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Clock className="inline h-4 w-4 mr-1" />
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Duration and Price */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (minutes)
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                >
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="90">90 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <DollarSign className="inline h-4 w-4 mr-1" />
                  Price ($)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Notes (optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Any special topics, homework, or preparation needed..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>

            {/* Recurring Sessions */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  id="recurring"
                  name="recurring"
                  checked={formData.recurring}
                  onChange={handleChange}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label htmlFor="recurring" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Create recurring sessions
                </label>
              </div>

              {formData.recurring && (
                <div className="grid grid-cols-2 gap-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Frequency
                    </label>
                    <select
                      name="recurringType"
                      value={formData.recurringType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="biweekly">Bi-weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Number of sessions
                    </label>
                    <input
                      type="number"
                      name="recurringCount"
                      value={formData.recurringCount}
                      onChange={handleChange}
                      min="2"
                      max="52"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error/Success Messages */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  Session{formData.recurring ? 's' : ''} created successfully! Redirecting...
                </p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/sessions')}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
                gradientType="nerdy"
                disabled={submitting || students.length === 0}
                leftIcon={submitting ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              >
                {submitting ? 'Creating...' : `Create Session${formData.recurring ? 's' : ''}`}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
} 