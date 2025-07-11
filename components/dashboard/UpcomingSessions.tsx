'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, User, DollarSign, Video, FileText, Calendar, CheckCircle, AlertCircle } from 'lucide-react'
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

interface UpcomingSessionsProps {
  sessions: Session[]
  className?: string
}

export const UpcomingSessions: React.FC<UpcomingSessionsProps> = ({
  sessions,
  className
}) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const formatDate = (date: string) => {
    const sessionDate = new Date(date)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (sessionDate.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (sessionDate.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow'
    } else {
      return sessionDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
    }
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

  return (
    <Card className={cn('glass-effect border-white/30 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-cyan-500" />
          <h2 className="text-xl font-bold text-slate-800">Upcoming Sessions</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          View All
        </Button>
      </div>

      <div className="space-y-4">
        {sessions.map((session, index) => (
          <motion.div
            key={session.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-white/60 border border-white/40 hover:bg-white/80 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={session.studentAvatar}
                  fallback={session.studentName.split(' ').map(n => n[0]).join('')}
                  size="md"
                />
                <div>
                  <h3 className="font-semibold text-slate-800">{session.studentName}</h3>
                  <p className="text-sm text-slate-600">{session.subject}</p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                size="sm"
                className={getStatusColor(session.status)}
              >
                {getStatusIcon(session.status)}
                <span className="ml-1 capitalize">
                  {session.status.replace('_', ' ')}
                </span>
              </Badge>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {formatDate(session.date)} • {formatTime(session.time)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {session.duration} min • {session.sessionType}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  ${session.payRate}/hr
                </span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-500" />
                <span className="text-sm text-slate-600">
                  {session.materials.length} materials
                </span>
              </div>
            </div>

            {session.notes && (
              <div className="mb-3 p-2 rounded bg-slate-100 border border-slate-200">
                <p className="text-sm text-slate-700">
                  <span className="font-medium">Notes:</span> {session.notes}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              {session.meetingLink && (
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
              <Button 
                size="sm" 
                variant="outline"
                className="border-slate-300 text-slate-600 hover:bg-slate-100"
              >
                View Details
              </Button>
              {session.status === 'pending_confirmation' && (
                <Button 
                  size="sm" 
                  variant="gradient" 
                  gradientType="yellow-pink"
                  xpReward={10}
                >
                  Confirm
                </Button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {sessions.length === 0 && (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600">No upcoming sessions</p>
          <p className="text-sm text-slate-500 mt-1">
            Check out available opportunities to book more sessions
          </p>
        </div>
      )}
    </Card>
  )
}

export default UpcomingSessions 