'use client'

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Calendar, 
  Clock, 
  User,
  BookOpen,
  FileText,
  Target,
  Plus,
  X,
  Search,
  ChevronDown,
  Save,
  Send,
  AlertCircle,
  CheckCircle,
  Timer,
  Users,
  MapPin,
  Video,
  Phone,
  MessageCircle,
  DollarSign,
  Repeat
} from 'lucide-react'
import { Card, Button, Badge, Avatar } from '@/components/ui'
import { cn } from '@/lib/utils'
import studentsData from '@/lib/mock-data/students.json'
import { Student } from '@/lib/types'

// Type the imported data
const students = studentsData.map(student => ({
  ...student,
  nextSession: student.nextSession ? new Date(student.nextSession) : undefined,
  createdAt: new Date(student.createdAt)
})) as Student[]

export default function NewSessionPage() {
  const router = useRouter()
  
  // Form state
  const [step, setStep] = useState(1)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [studentSearch, setStudentSearch] = useState('')
  const [showStudentDropdown, setShowStudentDropdown] = useState(false)
  
  // Session details
  const [sessionDate, setSessionDate] = useState('')
  const [sessionTime, setSessionTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [subject, setSubject] = useState('')
  const [sessionType, setSessionType] = useState<'in-person' | 'online'>('online')
  const [location, setLocation] = useState('')
  const [hourlyRate, setHourlyRate] = useState(75)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurringPattern, setRecurringPattern] = useState<'weekly' | 'biweekly' | 'monthly'>('weekly')
  const [recurringEnd, setRecurringEnd] = useState('')
  
  // Lesson plan
  const [lessonTitle, setLessonTitle] = useState('')
  const [objectives, setObjectives] = useState<string[]>([''])
  const [materials, setMaterials] = useState<string[]>([''])
  const [sessionNotes, setSessionNotes] = useState('')
  
  // Validation and submission
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Filter students based on search
  const filteredStudents = useMemo(() => {
    if (!studentSearch) return students
    return students.filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.subjects.some(subject => subject.toLowerCase().includes(studentSearch.toLowerCase()))
    )
  }, [studentSearch])

  // Get available subjects based on selected student
  const availableSubjects = useMemo(() => {
    if (!selectedStudent) return ['Math', 'Science', 'English', 'History', 'Physics', 'Chemistry', 'Biology']
    return selectedStudent.subjects
  }, [selectedStudent])

  // Calculate session cost
  const sessionCost = useMemo(() => {
    return (duration / 60) * hourlyRate
  }, [duration, hourlyRate])

  // Validation functions
  const validateStep = (stepNumber: number) => {
    const newErrors: Record<string, string> = {}
    
    if (stepNumber === 1) {
      if (!selectedStudent) newErrors.student = 'Please select a student'
      if (!subject) newErrors.subject = 'Please select a subject'
      if (!sessionDate) newErrors.date = 'Please select a date'
      if (!sessionTime) newErrors.time = 'Please select a time'
      if (sessionType === 'in-person' && !location) newErrors.location = 'Please enter a location'
    }
    
    if (stepNumber === 2 && lessonTitle) {
      const validObjectives = objectives.filter(obj => obj.trim() !== '')
      if (validObjectives.length === 0) newErrors.objectives = 'Please add at least one learning objective'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleStudentSelect = (student: Student) => {
    setSelectedStudent(student)
    setStudentSearch(`${student.firstName} ${student.lastName}`)
    setShowStudentDropdown(false)
    if (student.subjects.length === 1) {
      setSubject(student.subjects[0])
    }
  }

  const addObjective = () => {
    setObjectives([...objectives, ''])
  }

  const updateObjective = (index: number, value: string) => {
    const newObjectives = [...objectives]
    newObjectives[index] = value
    setObjectives(newObjectives)
  }

  const removeObjective = (index: number) => {
    setObjectives(objectives.filter((_, i) => i !== index))
  }

  const addMaterial = () => {
    setMaterials([...materials, ''])
  }

  const updateMaterial = (index: number, value: string) => {
    const newMaterials = [...materials]
    newMaterials[index] = value
    setMaterials(newMaterials)
  }

  const removeMaterial = (index: number) => {
    setMaterials(materials.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!validateStep(1)) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false)
      router.push('/sessions')
    }, 2000)
  }

  const getMinDate = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  const getMinTime = () => {
    const today = new Date()
    const selectedDate = new Date(sessionDate)
    
    if (selectedDate.toDateString() === today.toDateString()) {
      const currentTime = new Date()
      currentTime.setHours(currentTime.getHours() + 1) // Minimum 1 hour from now
      return currentTime.toTimeString().slice(0, 5)
    }
    return '08:00'
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-4xl mx-auto p-6">
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

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Schedule New Session
              </h1>
              <p className="text-gray-600">
                Create a new tutoring session with your students
              </p>
            </div>
            
            {/* Progress indicator */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
                    step >= stepNumber 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-600'
                  )}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div className={cn(
                      'w-8 h-0.5 mx-2 transition-colors',
                      step > stepNumber ? 'bg-purple-600' : 'bg-gray-200'
                    )} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <AnimatePresence mode="wait">
            {/* Step 1: Session Details */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Session Details</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Student Selection */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Select Student *
                        </label>
                        <div className="relative">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search students by name or subject..."
                              value={studentSearch}
                              onChange={(e) => {
                                setStudentSearch(e.target.value)
                                setShowStudentDropdown(true)
                                if (!e.target.value) setSelectedStudent(null)
                              }}
                              onFocus={() => setShowStudentDropdown(true)}
                              className={cn(
                                'pl-10 w-full px-3 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500',
                                errors.student ? 'border-red-300' : 'border-gray-300'
                              )}
                            />
                          </div>
                          
                          {/* Student Dropdown */}
                          {showStudentDropdown && (
                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {filteredStudents.length > 0 ? (
                                filteredStudents.map((student) => (
                                  <button
                                    key={student.id}
                                    onClick={() => handleStudentSelect(student)}
                                    className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                                  >
                                    <Avatar
                                      src={student.avatar}
                                      fallback={`${student.firstName[0]}${student.lastName[0]}`}
                                      size="sm"
                                    />
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {student.firstName} {student.lastName}
                                      </div>
                                      <div className="text-sm text-gray-500">
                                        Grade {student.grade} • {student.subjects.join(', ')}
                                      </div>
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <div className="px-4 py-3 text-center text-gray-500">
                                  No students found
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        {errors.student && (
                          <p className="mt-1 text-sm text-red-600">{errors.student}</p>
                        )}
                      </div>

                      {/* Subject Selection */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <select
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className={cn(
                            'w-full px-3 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500',
                            errors.subject ? 'border-red-300' : 'border-gray-300'
                          )}
                        >
                          <option value="">Select a subject</option>
                          {availableSubjects.map(sub => (
                            <option key={sub} value={sub}>{sub}</option>
                          ))}
                        </select>
                        {errors.subject && (
                          <p className="mt-1 text-sm text-red-600">{errors.subject}</p>
                        )}
                      </div>

                      {/* Duration */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Duration (minutes)
                        </label>
                        <select
                          value={duration}
                          onChange={(e) => setDuration(parseInt(e.target.value))}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value={30}>30 minutes</option>
                          <option value={45}>45 minutes</option>
                          <option value={60}>1 hour</option>
                          <option value={90}>1.5 hours</option>
                          <option value={120}>2 hours</option>
                        </select>
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={sessionDate}
                          onChange={(e) => setSessionDate(e.target.value)}
                          min={getMinDate()}
                          className={cn(
                            'w-full px-3 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500',
                            errors.date ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.date && (
                          <p className="mt-1 text-sm text-red-600">{errors.date}</p>
                        )}
                      </div>

                      {/* Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Time *
                        </label>
                        <input
                          type="time"
                          value={sessionTime}
                          onChange={(e) => setSessionTime(e.target.value)}
                          min={sessionDate ? getMinTime() : '08:00'}
                          className={cn(
                            'w-full px-3 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500',
                            errors.time ? 'border-red-300' : 'border-gray-300'
                          )}
                        />
                        {errors.time && (
                          <p className="mt-1 text-sm text-red-600">{errors.time}</p>
                        )}
                      </div>

                      {/* Session Type */}
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setSessionType('online')}
                            className={cn(
                              'p-4 border-2 rounded-lg text-left transition-colors',
                              sessionType === 'online'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400'
                            )}
                          >
                            <Video className="h-5 w-5 text-purple-600 mb-2" />
                            <div className="font-medium text-gray-900">Online Session</div>
                            <div className="text-sm text-gray-500">Video call via Zoom/Google Meet</div>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => setSessionType('in-person')}
                            className={cn(
                              'p-4 border-2 rounded-lg text-left transition-colors',
                              sessionType === 'in-person'
                                ? 'border-purple-500 bg-purple-50'
                                : 'border-gray-300 hover:border-gray-400'
                            )}
                          >
                            <MapPin className="h-5 w-5 text-purple-600 mb-2" />
                            <div className="font-medium text-gray-900">In-Person</div>
                            <div className="text-sm text-gray-500">Meet at a physical location</div>
                          </button>
                        </div>
                      </div>

                      {/* Location (if in-person) */}
                      {sessionType === 'in-person' && (
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <input
                            type="text"
                            placeholder="Enter meeting location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className={cn(
                              'w-full px-3 py-3 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500',
                              errors.location ? 'border-red-300' : 'border-gray-300'
                            )}
                          />
                          {errors.location && (
                            <p className="mt-1 text-sm text-red-600">{errors.location}</p>
                          )}
                        </div>
                      )}

                      {/* Hourly Rate */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Hourly Rate ($)
                        </label>
                        <input
                          type="number"
                          value={hourlyRate}
                          onChange={(e) => setHourlyRate(parseInt(e.target.value) || 0)}
                          min="0"
                          step="5"
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Session Cost */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Cost
                        </label>
                        <div className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-gray-50 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-gray-500" />
                          <span className="font-medium text-gray-900">{sessionCost.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Recurring Options */}
                      <div className="lg:col-span-2">
                        <div className="flex items-center gap-2 mb-3">
                          <input
                            type="checkbox"
                            id="recurring"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                          />
                          <label htmlFor="recurring" className="text-sm font-medium text-gray-700">
                            Make this a recurring session
                          </label>
                        </div>
                        
                        {isRecurring && (
                          <div className="grid grid-cols-2 gap-4 mt-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Repeat Pattern
                              </label>
                              <select
                                value={recurringPattern}
                                onChange={(e) => setRecurringPattern(e.target.value as any)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              >
                                <option value="weekly">Weekly</option>
                                <option value="biweekly">Bi-weekly</option>
                                <option value="monthly">Monthly</option>
                              </select>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                End Date
                              </label>
                              <input
                                type="date"
                                value={recurringEnd}
                                onChange={(e) => setRecurringEnd(e.target.value)}
                                min={sessionDate}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Lesson Plan (Optional) */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold text-gray-900">Lesson Plan (Optional)</h2>
                      <Badge variant="secondary" className="text-xs">
                        You can add this later
                      </Badge>
                    </div>
                    
                    <div className="space-y-6">
                      {/* Lesson Title */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Lesson Title
                        </label>
                        <input
                          type="text"
                          placeholder="e.g., Introduction to Quadratic Equations"
                          value={lessonTitle}
                          onChange={(e) => setLessonTitle(e.target.value)}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                      </div>

                      {/* Learning Objectives */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Learning Objectives
                        </label>
                        <div className="space-y-2">
                          {objectives.map((objective, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <Target className="h-4 w-4 text-purple-500 flex-shrink-0" />
                              <input
                                type="text"
                                placeholder="What will the student learn?"
                                value={objective}
                                onChange={(e) => updateObjective(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              {objectives.length > 1 && (
                                <button
                                  onClick={() => removeObjective(index)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addObjective}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Add objective
                          </button>
                        </div>
                        {errors.objectives && (
                          <p className="mt-1 text-sm text-red-600">{errors.objectives}</p>
                        )}
                      </div>

                      {/* Materials */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Materials Needed
                        </label>
                        <div className="space-y-2">
                          {materials.map((material, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <BookOpen className="h-4 w-4 text-purple-500 flex-shrink-0" />
                              <input
                                type="text"
                                placeholder="e.g., Calculator, textbook, worksheets"
                                value={material}
                                onChange={(e) => updateMaterial(index, e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                              />
                              {materials.length > 1 && (
                                <button
                                  onClick={() => removeMaterial(index)}
                                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            onClick={addMaterial}
                            className="flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 transition-colors"
                          >
                            <Plus className="h-4 w-4" />
                            Add material
                          </button>
                        </div>
                      </div>

                      {/* Session Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Session Notes
                        </label>
                        <textarea
                          placeholder="Any additional notes or special instructions for this session..."
                          value={sessionNotes}
                          onChange={(e) => setSessionNotes(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-3 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Review & Confirm */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <Card className="bg-white/80 backdrop-blur-sm border-0">
                  <div className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Review & Confirm</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Session Summary */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Session Details</h3>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            {selectedStudent && (
                              <>
                                <Avatar
                                  src={selectedStudent.avatar}
                                  fallback={`${selectedStudent.firstName[0]}${selectedStudent.lastName[0]}`}
                                  size="sm"
                                />
                                <div>
                                  <div className="font-medium text-gray-900">
                                    {selectedStudent.firstName} {selectedStudent.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">Grade {selectedStudent.grade}</div>
                                </div>
                              </>
                            )}
                          </div>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Subject:</span>
                              <span className="font-medium text-gray-900">{subject}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Date:</span>
                              <span className="font-medium text-gray-900">
                                {new Date(sessionDate).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Time:</span>
                              <span className="font-medium text-gray-900">{sessionTime}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Duration:</span>
                              <span className="font-medium text-gray-900">{duration} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Type:</span>
                              <span className="font-medium text-gray-900 capitalize">{sessionType.replace('-', ' ')}</span>
                            </div>
                            {sessionType === 'in-person' && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Location:</span>
                                <span className="font-medium text-gray-900">{location}</span>
                              </div>
                            )}
                            <div className="flex justify-between">
                              <span className="text-gray-600">Cost:</span>
                              <span className="font-medium text-gray-900">${sessionCost.toFixed(2)}</span>
                            </div>
                            {isRecurring && (
                              <div className="flex justify-between">
                                <span className="text-gray-600">Recurring:</span>
                                <span className="font-medium text-gray-900 capitalize">
                                  {recurringPattern} until {recurringEnd}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Lesson Plan Summary */}
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-4">Lesson Plan</h3>
                        {lessonTitle ? (
                          <div className="space-y-3">
                            <div>
                              <div className="font-medium text-gray-900 mb-1">{lessonTitle}</div>
                              {objectives.filter(obj => obj.trim()).length > 0 && (
                                <div>
                                  <div className="text-sm text-gray-600 mb-1">Objectives:</div>
                                  <ul className="text-sm text-gray-700 space-y-1">
                                    {objectives.filter(obj => obj.trim()).map((objective, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <Target className="h-3 w-3 text-purple-500 mt-0.5 flex-shrink-0" />
                                        {objective}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {materials.filter(mat => mat.trim()).length > 0 && (
                                <div className="mt-2">
                                  <div className="text-sm text-gray-600 mb-1">Materials:</div>
                                  <div className="flex flex-wrap gap-1">
                                    {materials.filter(mat => mat.trim()).map((material, index) => (
                                      <Badge key={index} variant="secondary" size="sm">
                                        {material}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 italic">No lesson plan added</p>
                        )}
                      </div>
                    </div>

                    {/* Submit Warning */}
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <div className="font-medium text-blue-900">Ready to schedule?</div>
                          <div className="text-sm text-blue-700 mt-1">
                            The student and their parent will receive a notification about this session. 
                            You can always edit the details later if needed.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Navigation Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mt-8"
        >
          <div>
            {step > 1 && (
              <Button variant="outline" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => router.push('/sessions')}>
              Cancel
            </Button>
            
            {step < 3 ? (
              <Button variant="gradient" gradientType="nerdy" onClick={handleNext}>
                Continue
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            ) : (
              <Button 
                variant="gradient" 
                gradientType="nerdy" 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Schedule Session
                  </>
                )}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
} 