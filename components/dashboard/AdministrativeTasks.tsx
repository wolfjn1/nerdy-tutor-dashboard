'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, Clock, FileText, Calendar, DollarSign, Settings, CheckCircle2 } from 'lucide-react'
import { Button, Card, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'

interface AdministrativeTask {
  id: string
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  dueDate: string
  category: 'billing' | 'scheduling' | 'compliance' | 'profile'
  actionRequired: boolean
}

interface AdministrativeTasksProps {
  tasks: AdministrativeTask[]
  className?: string
}

export const AdministrativeTasks: React.FC<AdministrativeTasksProps> = ({
  tasks,
  className
}) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'billing':
        return <DollarSign className="w-4 h-4" />
      case 'scheduling':
        return <Calendar className="w-4 h-4" />
      case 'compliance':
        return <FileText className="w-4 h-4" />
      case 'profile':
        return <Settings className="w-4 h-4" />
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'billing':
        return 'text-pink-600'
      case 'scheduling':
        return 'text-cyan-600'
      case 'compliance':
        return 'text-yellow-600'
      case 'profile':
        return 'text-orange-600'
      default:
        return 'text-gray-600'
    }
  }

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const formatDueDate = (dueDate: string) => {
    const due = new Date(dueDate)
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)
    
    if (due.toDateString() === today.toDateString()) {
      return 'Due Today'
    } else if (due.toDateString() === tomorrow.toDateString()) {
      return 'Due Tomorrow'
    } else {
      return `Due ${due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
    }
  }

  const highPriorityTasks = tasks.filter(task => task.priority === 'high')
  const otherTasks = tasks.filter(task => task.priority !== 'high')

  return (
    <Card className={cn('glass-effect border-white/30 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-bold text-slate-800">Administrative Tasks</h2>
          {tasks.length > 0 && (
            <Badge 
              variant="secondary" 
              size="sm"
              className="bg-red-100 text-red-700 border-red-200"
            >
              {tasks.length} pending
            </Badge>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          View All
        </Button>
      </div>

      {/* High Priority Tasks */}
      {highPriorityTasks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Urgent Tasks
          </h3>
          <div className="space-y-3">
            {highPriorityTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-lg bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg bg-white/80 border border-white/40', getCategoryColor(task.category))}>
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{task.title}</h4>
                      <p className="text-sm text-slate-600">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-600 font-medium">
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="gradient"
                    gradientType="orange-magenta"
                    size="sm"
                    xpReward={20}
                    className="flex-1"
                  >
                    Complete Task
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-300 text-slate-600 hover:bg-slate-100"
                  >
                    View Details
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Other Tasks */}
      {otherTasks.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold text-slate-800 mb-3">Other Tasks</h3>
          <div className="space-y-3">
            {otherTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: (highPriorityTasks.length + index) * 0.1 }}
                className="p-4 rounded-lg bg-white/60 border border-white/40 hover:bg-white/80 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={cn('p-2 rounded-lg bg-white/80 border border-white/40', getCategoryColor(task.category))}>
                      {getCategoryIcon(task.category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">{task.title}</h4>
                      <p className="text-sm text-slate-600">{task.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      size="sm"
                      className={getPriorityColor(task.priority)}
                    >
                      {task.priority}
                    </Badge>
                    <span className="text-sm text-slate-500">
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="gradient"
                    gradientType="pink-cyan"
                    size="sm"
                    xpReward={15}
                    leftIcon={<CheckCircle2 className="w-4 h-4" />}
                  >
                    Complete
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                  >
                    Snooze
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* No Tasks */}
      {tasks.length === 0 && (
        <div className="text-center py-8">
          <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <p className="text-green-600 font-medium">All caught up!</p>
          <p className="text-sm text-slate-500 mt-1">
            No administrative tasks pending
          </p>
        </div>
      )}
    </Card>
  )
}

export default AdministrativeTasks 