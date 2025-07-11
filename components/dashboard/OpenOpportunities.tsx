'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Search, Clock, DollarSign, User, Calendar, MapPin, TrendingUp, Star } from 'lucide-react'
import { Avatar, Badge, Button, Card } from '@/components/ui'
import { cn } from '@/lib/utils'

interface Opportunity {
  id: string
  studentName: string
  studentAvatar: string
  subject: string
  preferredTimes: string[]
  duration: number
  frequency: string
  payRate: number
  urgency: 'high' | 'medium' | 'low'
  studentLevel: string
  needs: string
  location: string
  startDate: string
  budget: string
  matchScore: number
}

interface OpenOpportunitiesProps {
  opportunities: Opportunity[]
  className?: string
}

export const OpenOpportunities: React.FC<OpenOpportunitiesProps> = ({
  opportunities,
  className
}) => {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'low':
        return 'bg-green-500/20 text-green-400 border-green-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400'
    if (score >= 80) return 'text-yellow-400'
    if (score >= 70) return 'text-orange-400'
    return 'text-red-400'
  }

  return (
    <Card className={cn('glass-effect border-white/10 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Search className="w-6 h-6 text-nerdy-yellow" />
          <h2 className="text-xl font-bold text-white">Open Opportunities</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          className="border-white/20 text-white hover:bg-white/10"
        >
          Browse All
        </Button>
      </div>

      <div className="space-y-4">
        {opportunities.map((opportunity, index) => (
          <motion.div
            key={opportunity.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar
                  src={opportunity.studentAvatar}
                  fallback={opportunity.studentName.split(' ').map(n => n[0]).join('')}
                  size="md"
                />
                <div>
                  <h3 className="font-semibold text-white">{opportunity.studentName}</h3>
                  <p className="text-sm text-gray-300">{opportunity.subject}</p>
                  <p className="text-xs text-gray-400">{opportunity.studentLevel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge 
                  variant="secondary" 
                  size="sm"
                  className={getUrgencyColor(opportunity.urgency)}
                >
                  {opportunity.urgency} urgency
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className={cn('text-sm font-bold', getMatchScoreColor(opportunity.matchScore))}>
                    {opportunity.matchScore}%
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {opportunity.duration} min • {opportunity.frequency}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    ${opportunity.payRate}/hr • {opportunity.budget}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    Starts {new Date(opportunity.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">
                    {opportunity.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-3 p-2 rounded bg-white/5 border border-white/10">
              <p className="text-sm text-gray-300">
                <span className="font-medium">Student needs:</span> {opportunity.needs}
              </p>
            </div>

            <div className="mb-3">
              <p className="text-xs text-gray-400 mb-1">Preferred times:</p>
              <div className="flex flex-wrap gap-1">
                {opportunity.preferredTimes.map((time, i) => (
                  <Badge 
                    key={i}
                    variant="secondary" 
                    size="sm"
                    className="bg-white/10 text-white border-white/20"
                  >
                    {time}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="gradient" 
                gradientType="nerdy"
                leftIcon={<TrendingUp className="w-4 h-4" />}
                xpReward={25}
                className="flex-1"
              >
                Apply Now
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                View Details
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {opportunities.length === 0 && (
        <div className="text-center py-8">
          <Search className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400">No matching opportunities</p>
          <p className="text-sm text-gray-500 mt-1">
            Check your preferences or expand your availability
          </p>
        </div>
      )}
    </Card>
  )
}

export default OpenOpportunities 