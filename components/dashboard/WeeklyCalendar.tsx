'use client'

import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { Calendar, Clock, User, DollarSign, Video, FileText, CheckCircle, AlertCircle, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Session {
  id: string
  studentName: string
  studentAvatar: string
  subject: string
  date: string
  time: string
  duration: number
  sessionType: 'regular' | 'intensive' | 'trial'
  payRate: number
  notes: string
  status: 'confirmed' | 'pending_confirmation' | 'cancelled'
  meetingLink: string | null
  materials: string[]
}

interface WeeklyCalendarProps {
  sessions: Session[]
  className?: string
}

export const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  sessions,
  className
}) => {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null)
  const calendarRef = useRef<FullCalendar>(null)

  // Convert sessions to FullCalendar events
  const calendarEvents = sessions.map((session) => {
    const sessionDateTime = new Date(`${session.date}T${session.time}`)
    const endDateTime = new Date(sessionDateTime.getTime() + session.duration * 60000)
    
    const getEventColor = (status: string) => {
      switch (status) {
        case 'confirmed':
          return '#10b981' // green
        case 'pending_confirmation':
          return '#f59e0b' // yellow
        case 'cancelled':
          return '#ef4444' // red
        default:
          return '#6b7280' // gray
      }
    }

    return {
      id: session.id,
      title: `${session.studentName} - ${session.subject}`,
      start: sessionDateTime,
      end: endDateTime,
      backgroundColor: getEventColor(session.status),
      borderColor: getEventColor(session.status),
      extendedProps: {
        session: session
      }
    }
  })

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-100 text-green-700 border-green-200'
      case 'pending_confirmation':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4" />
      case 'pending_confirmation':
        return <AlertCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  const handleEventClick = (clickInfo: any) => {
    const session = clickInfo.event.extendedProps.session
    setSelectedSession(session)
  }

  const closeModal = () => {
    setSelectedSession(null)
  }

  return (
    <>
      <Card className={cn('glass-effect border-white/30 p-4', className)}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-cyan-500" />
            <h2 className="text-lg font-bold text-slate-800">Weekly Schedule</h2>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => calendarRef.current?.getApi().today()}
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              className="border-slate-300 text-slate-600 hover:bg-slate-100"
            >
              View All
            </Button>
          </div>
        </div>

        {/* Calendar */}
        <div className="calendar-container">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: 'prev,next',
              center: 'title',
              right: 'timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            eventClick={handleEventClick}
            height={400}
            slotMinTime="08:00:00"
            slotMaxTime="20:00:00"
            allDaySlot={false}
            weekends={true}
            eventDisplay="block"
            eventTextColor="white"
            dayHeaderFormat={{ weekday: 'short', day: 'numeric' }}
            slotLabelFormat={{
              hour: 'numeric',
              minute: '2-digit',
              hour12: true
            }}
          />
        </div>

        {sessions.length === 0 && (
          <div className="text-center py-6">
            <Calendar className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-slate-600">No upcoming sessions</p>
            <p className="text-sm text-slate-500 mt-1">
              Check out available opportunities to book more sessions
            </p>
          </div>
        )}
      </Card>

      {/* Session Detail Modal */}
      {selectedSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full glass-effect border border-white/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-800">Session Details</h3>
              <button 
                onClick={closeModal}
                className="p-1 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Student Info */}
              <div className="flex items-center gap-3">
                <Avatar
                  src={selectedSession.studentAvatar}
                  fallback={selectedSession.studentName.split(' ').map(n => n[0]).join('')}
                  size="md"
                />
                <div>
                  <h4 className="font-semibold text-slate-800">{selectedSession.studentName}</h4>
                  <p className="text-sm text-slate-600">{selectedSession.subject}</p>
                </div>
                <Badge 
                  variant="secondary" 
                  size="sm"
                  className={getStatusColor(selectedSession.status)}
                >
                  {getStatusIcon(selectedSession.status)}
                  <span className="ml-1 capitalize">
                    {selectedSession.status.replace('_', ' ')}
                  </span>
                </Badge>
              </div>

              {/* Session Details */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {formatTime(selectedSession.time)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {selectedSession.duration} min
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    ${selectedSession.payRate}/hr
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-600">
                    {selectedSession.materials.length} materials
                  </span>
                </div>
              </div>

              {/* Notes */}
              {selectedSession.notes && (
                <div className="p-3 rounded-lg bg-slate-100 border border-slate-200">
                  <p className="text-sm text-slate-700">
                    <span className="font-medium">Notes:</span> {selectedSession.notes}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-2 pt-2">
                {selectedSession.meetingLink && (
                  <Button 
                    size="sm" 
                    variant="gradient" 
                    gradientType="pink-cyan"
                    leftIcon={<Video className="w-4 h-4" />}
                    className="flex-1"
                  >
                    Join Session
                  </Button>
                )}
                {selectedSession.status === 'pending_confirmation' && (
                  <Button 
                    size="sm" 
                    variant="gradient" 
                    gradientType="yellow-pink"
                    xpReward={10}
                    className="flex-1"
                  >
                    Confirm
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx global>{`
        .calendar-container .fc {
          font-family: 'Inter', system-ui, sans-serif;
          font-size: 0.875rem;
        }
        .calendar-container .fc-theme-standard .fc-scrollgrid {
          border: 1px solid rgb(203 213 225 / 0.5);
          border-radius: 0.5rem;
        }
        .calendar-container .fc-theme-standard th {
          background: rgb(248 250 252);
          border-color: rgb(203 213 225 / 0.3);
          color: rgb(71 85 105);
          font-weight: 600;
          padding: 0.5rem 0.25rem;
          font-size: 0.75rem;
        }
        .calendar-container .fc-theme-standard td {
          border-color: rgb(203 213 225 / 0.2);
        }
        .calendar-container .fc-event {
          border-radius: 4px;
          font-size: 0.625rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
          padding: 1px 2px;
        }
        .calendar-container .fc-event:hover {
          opacity: 0.8;
          transform: translateY(-1px);
        }
        .calendar-container .fc-timegrid-slot {
          height: 1.5rem;
        }
        .calendar-container .fc-timegrid-slot-label {
          font-size: 0.75rem;
          color: rgb(71 85 105);
        }
        .calendar-container .fc-toolbar-title {
          color: rgb(30 41 59);
          font-weight: 700;
          font-size: 1rem;
        }
        .calendar-container .fc-button {
          background: rgb(248 250 252);
          border: 1px solid rgb(203 213 225);
          color: rgb(71 85 105);
          font-weight: 500;
          font-size: 0.75rem;
          padding: 0.25rem 0.5rem;
        }
        .calendar-container .fc-button:hover {
          background: rgb(241 245 249);
        }
        .calendar-container .fc-button-active {
          background: linear-gradient(135deg, #ec4899 0%, #06b6d4 100%) !important;
          border-color: transparent !important;
          color: white !important;
        }
        .calendar-container .fc-scrollgrid-sync-table {
          font-size: 0.75rem;
        }
      `}</style>
    </>
  )
}

export default WeeklyCalendar 