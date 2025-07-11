'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, FileText, Clock, CreditCard } from 'lucide-react'
import { Button, Card, Badge, SimpleAreaChart } from '@/components/ui'
import { cn } from '@/lib/utils'

interface EarningsData {
  thisWeek: number
  thisMonth: number
  lastMonth: number
  unpaidAmount: number
  pendingInvoices: number
}

interface EarningsSummaryProps {
  earnings: EarningsData
  className?: string
}

export const EarningsSummary: React.FC<EarningsSummaryProps> = ({
  earnings,
  className
}) => {
  const monthlyChange = earnings.thisMonth - earnings.lastMonth
  const monthlyChangePercent = ((monthlyChange / earnings.lastMonth) * 100).toFixed(1)
  const isPositiveChange = monthlyChange >= 0

  return (
    <Card className={cn('glass-effect border-white/30 p-6', className)}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <DollarSign className="w-6 h-6 text-pink-500" />
          <h2 className="text-xl font-bold text-slate-800">Earnings Summary</h2>
        </div>
        <Button 
          variant="outline" 
          size="sm"
          leftIcon={<FileText className="w-4 h-4" />}
          className="border-slate-300 text-slate-600 hover:bg-slate-100"
        >
          View Invoices
        </Button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg bg-white/60 border border-white/40"
        >
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">This Week</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-yellow-pink bg-clip-text text-transparent">
            ${earnings.thisWeek.toLocaleString()}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg bg-white/60 border border-white/40"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">This Month</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-pink-cyan bg-clip-text text-transparent">
            ${earnings.thisMonth.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1">
            {isPositiveChange ? (
              <TrendingUp className="w-3 h-3 text-green-500" />
            ) : (
              <TrendingDown className="w-3 h-3 text-red-500" />
            )}
            <span className={cn(
              'text-xs font-medium',
              isPositiveChange ? 'text-green-500' : 'text-red-500'
            )}>
              {isPositiveChange ? '+' : ''}{monthlyChangePercent}%
            </span>
            <span className="text-xs text-slate-500">vs last month</span>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg bg-white/60 border border-white/40"
        >
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-slate-500" />
            <span className="text-sm text-slate-600">Unpaid</span>
          </div>
          <div className="text-2xl font-bold bg-gradient-orange-magenta bg-clip-text text-transparent">
            ${earnings.unpaidAmount.toLocaleString()}
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Badge 
              variant="secondary" 
              size="sm"
              className="bg-yellow-100 text-yellow-700 border-yellow-200"
            >
              {earnings.pendingInvoices} pending
            </Badge>
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Billing Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button
            variant="gradient"
            gradientType="pink-cyan"
            size="sm"
            leftIcon={<FileText className="w-4 h-4" />}
            xpReward={15}
            className="justify-start"
          >
            Create Invoice
          </Button>
          <Button
            variant="gradient"
            gradientType="yellow-pink"
            size="sm"
            leftIcon={<CreditCard className="w-4 h-4" />}
            xpReward={10}
            className="justify-start"
          >
            Submit Timesheet
          </Button>
        </div>
      </div>

      {/* Weekly Breakdown Chart */}
      <div className="mt-6 pt-6 border-t border-slate-200">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Weekly Breakdown</h3>
        <div className="h-64">
          <SimpleAreaChart
            data={[
              { day: 'Mon', amount: 85, sessions: 1 },
              { day: 'Tue', amount: 170, sessions: 2 },
              { day: 'Wed', amount: 0, sessions: 0 },
              { day: 'Thu', amount: 255, sessions: 3 },
              { day: 'Fri', amount: 120, sessions: 1 },
              { day: 'Sat', amount: 0, sessions: 0 },
              { day: 'Sun', amount: 90, sessions: 1 }
            ]}
            xDataKey="day"
            yDataKey="amount"
            height={200}
            color="#06b6d4"
            gradient={true}
          />
        </div>
        
        {/* Quick Stats Below Chart */}
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-800">8</div>
            <div className="text-xs text-slate-600">Total Sessions</div>
          </div>
          <div className="text-center p-3 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-800">$106</div>
            <div className="text-xs text-slate-600">Average Day</div>
          </div>
        </div>
      </div>
    </Card>
  )
}

export default EarningsSummary 