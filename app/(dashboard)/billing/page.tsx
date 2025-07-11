'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, CreditCard, Calendar, Download } from 'lucide-react'
import { Card, Button } from '@/components/ui'

export default function BillingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Billing & Earnings 💰
          </h1>
          <p className="text-gray-600">
            Track your income and manage payments
          </p>
        </div>
        <Button variant="gradient" gradientType="nerdy">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">$2,450</div>
                <div className="text-sm text-gray-500">This Month</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">$425</div>
                <div className="text-sm text-gray-500">Today</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">$1,200</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">45</div>
                <div className="text-sm text-gray-500">Sessions</div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Coming Soon */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center py-12"
      >
        <div className="text-6xl mb-4">🚧</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Full Billing Dashboard Coming Soon!</h2>
        <p className="text-gray-600">
          Detailed invoices, payment history, and financial reports are in development
        </p>
      </motion.div>
    </div>
  )
} 