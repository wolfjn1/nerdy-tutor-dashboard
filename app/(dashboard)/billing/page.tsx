'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  DollarSign, 
  TrendingUp, 
  Calendar,
  Download,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader,
  CreditCard,
  Plus
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { getEarningsSummary, getMonthlyEarnings, getInvoices } from '@/lib/api/earnings'

interface EarningsSummary {
  thisWeek: number
  thisMonth: number
  thisYear: number
  pending: number
  avgHourlyRate: number
}

interface MonthlyEarning {
  month: string
  year: number
  earnings: number
}

interface Invoice {
  id: string
  student_id: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  due_date: string
  paid_date?: string
  created_at: string
  invoice_number: string
  students?: {
    first_name: string
    last_name: string
  }
}

export default function BillingPage() {
  const router = useRouter()
  const { tutor } = useAuth()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [summary, setSummary] = useState<EarningsSummary | null>(null)
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarning[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  
  // Filters
  const [timeFilter, setTimeFilter] = useState<'week' | 'month' | 'year' | 'all'>('month')
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all')
  
  // Fetch data
  useEffect(() => {
    const fetchBillingData = async () => {
      if (!tutor?.id) return
      
      setLoading(true)
      setError(null)
      
      try {
        const [summaryData, monthlyData, invoicesData] = await Promise.all([
          getEarningsSummary(tutor.id),
          getMonthlyEarnings(tutor.id),
          getInvoices(tutor.id)
        ])
        
        setSummary(summaryData)
        setMonthlyEarnings(monthlyData)
        setInvoices(invoicesData)
      } catch (err) {
        console.error('Error fetching billing data:', err)
        setError('Failed to load billing information')
      } finally {
        setLoading(false)
      }
    }
    
    fetchBillingData()
  }, [tutor?.id])

  // Filter invoices
  const filteredInvoices = invoices.filter(invoice => {
    if (invoiceFilter === 'all') return true
    return invoice.status === invoiceFilter
  })

  // Calculate chart data
  const chartData = monthlyEarnings.slice(-6).map(item => ({
    month: item.month,
    earnings: item.earnings
  }))

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-3 w-3" />
      case 'pending': return <Clock className="h-3 w-3" />
      case 'overdue': return <AlertCircle className="h-3 w-3" />
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading billing information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Error loading billing</h3>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Billing & Payments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your earnings and manage invoices
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <Badge variant="secondary" className="text-xs">All Time</Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary?.thisYear || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Year to Date</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <Badge variant="secondary" className="text-xs">This Month</Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary?.thisMonth || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Monthly Earnings</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <Badge variant="secondary" className="text-xs">This Week</Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary?.thisWeek || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Earnings</p>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              </div>
              <Badge variant="secondary" className="text-xs">Pending</Badge>
            </div>
            <div className="mt-3">
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {formatCurrency(summary?.pending || 0)}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Pending Payments</p>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Earnings Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Earnings Overview
              </h2>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
                <option value="all">All Time</option>
              </select>
            </div>
            
            {/* Simple bar chart */}
            <div className="h-48 flex items-end justify-between gap-2">
              {chartData.map((item, index) => {
                const maxEarnings = Math.max(...chartData.map(d => d.earnings))
                const height = maxEarnings > 0 ? (item.earnings / maxEarnings) * 100 : 0
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-t relative" style={{ height: '100%' }}>
                      <div 
                        className="absolute bottom-0 w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t transition-all duration-500"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{item.month}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      ${(item.earnings / 1000).toFixed(1)}k
                    </span>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Statistics */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
              Session Statistics
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Total Sessions</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {monthlyEarnings.reduce((sum, m) => sum + (m.earnings > 0 ? 1 : 0), 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Average per Hour</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(summary?.avgHourlyRate || 0)}
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Hourly Rate</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatCurrency(tutor?.hourly_rate || 0)}/hr
                </span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">Payment Method</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Direct Deposit
                </span>
              </div>
            </div>
            
            <div className="mt-6">
              <Button 
                variant="outline" 
                className="w-full"
                leftIcon={<CreditCard className="h-4 w-4" />}
              >
                Update Payment Method
              </Button>
            </div>
          </Card>
        </div>

        {/* Invoices Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Recent Invoices
            </h2>
            <div className="flex items-center gap-3">
              <select
                value={invoiceFilter}
                onChange={(e) => setInvoiceFilter(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              >
                <option value="all">All Invoices</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
              
              <Button
                variant="gradient"
                gradientType="nerdy"
                size="sm"
                leftIcon={<Plus className="h-4 w-4" />}
                onClick={() => router.push('/billing/invoice/new')}
              >
                Create Invoice
              </Button>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Invoice #
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Student
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Due Date
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {invoice.invoice_number}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-900 dark:text-gray-100">
                          {invoice.students?.first_name} {invoice.students?.last_name}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {formatCurrency(invoice.amount)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge 
                          variant="secondary" 
                          className={cn('text-xs', getStatusColor(invoice.status))}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(invoice.status)}
                            {invoice.status}
                          </span>
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          {formatDate(invoice.due_date)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => router.push(`/billing/invoice/${invoice.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500 dark:text-gray-400">
                      <FileText className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                      <p>No invoices found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredInvoices.length > 0 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredInvoices.length} of {invoices.length} invoices
              </p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 