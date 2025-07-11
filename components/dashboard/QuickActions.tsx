'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Calendar, Search, FileText, MessageCircle, DollarSign, Zap } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  xpReward: number
  color: 'yellow-pink' | 'pink-cyan' | 'orange-magenta' | 'nerdy'
}

interface QuickActionsProps {
  actions: QuickAction[]
  className?: string
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  actions,
  className
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'brain':
        return <Brain className="w-5 h-5" />
      case 'calendar':
        return <Calendar className="w-5 h-5" />
      case 'search':
        return <Search className="w-5 h-5" />
      case 'fileText':
        return <FileText className="w-5 h-5" />
      case 'messageCircle':
        return <MessageCircle className="w-5 h-5" />
      case 'dollarSign':
        return <DollarSign className="w-5 h-5" />
      default:
        return <Zap className="w-5 h-5" />
    }
  }

  return (
    <Card className={cn('glass-effect border-white/30 p-6', className)}>
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-6 h-6 text-orange-500" />
        <h2 className="text-xl font-bold text-slate-800">Quick Actions</h2>
      </div>

      <div className="space-y-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="gradient"
              gradientType={action.color}
              size="lg"
              leftIcon={getIcon(action.icon)}
              xpReward={action.xpReward}
              className="w-full h-auto p-4 justify-start"
            >
              <div className="flex items-center justify-between w-full">
                <div className="text-left">
                  <div className="font-semibold text-white text-sm mb-1">
                    {action.title}
                  </div>
                  <div className="text-xs text-white/80 leading-tight">
                    {action.description}
                  </div>
                </div>
                <div className="text-xs bg-white/20 px-2 py-1 rounded-full font-medium ml-3">
                  +{action.xpReward}XP
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Additional Quick Actions */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">More Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            size="md"
            leftIcon={<MessageCircle className="w-4 h-4" />}
            className="border-slate-300 text-slate-600 hover:bg-slate-100 justify-start"
          >
            Messages
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<FileText className="w-4 h-4" />}
            className="border-slate-300 text-slate-600 hover:bg-slate-100 justify-start"
          >
            Reports
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<Calendar className="w-4 h-4" />}
            className="border-slate-300 text-slate-600 hover:bg-slate-100 justify-start"
          >
            Calendar
          </Button>
          <Button
            variant="outline"
            size="md"
            leftIcon={<DollarSign className="w-4 h-4" />}
            className="border-slate-300 text-slate-600 hover:bg-slate-100 justify-start"
          >
            Billing
          </Button>
        </div>
      </div>
    </Card>
  )
}

export default QuickActions 