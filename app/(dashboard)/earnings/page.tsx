'use client'

import React, { useState } from 'react'
import { DollarSign, TrendingUp, CreditCard, Calendar, Download, FileText, Clock, ChevronDown, ChevronUp, Filter, Search, BanknoteIcon, Receipt, TrendingDown, AlertCircle, CheckCircle, XCircle, Send, Eye, Plus, Check } from 'lucide-react'
import { Button, Badge, Modal } from '@/components/ui'
import { cn } from '@/lib/utils'

// Mock completed sessions that need invoicing
const uninvoicedSessions = [
  {
    id: 'session-006',
    studentName: 'Emma Watson',
    subject: 'Math', 
    date: '2025-01-12',
    duration: 60,
    rate: 75,
    amount: 75,
    status: 'completed',
    notes: 'Emma did great with linear equations. Ready to move to quadratics.'
  },
  {
    id: 'session-007',
    studentName: 'Alex Thompson',
    subject: 'Chemistry',
    date: '2025-01-10',
    duration: 90,
    rate: 75,
    amount: 112.50,
    status: 'completed',
    notes: 'Good progress on stoichiometry. Still needs practice with limiting reagents.'
  },
  {
    id: 'session-008',
    studentName: 'Sophia Brown',
    subject: 'English',
    date: '2025-01-08',
    duration: 60,
    rate: 75,
    amount: 75,
    status: 'completed',
    notes: 'Sophia\'s creative writing is improving. Worked on character development.'
  },
  {
    id: 'session-009',
    studentName: 'Marcus Johnson',
    subject: 'Math',
    date: '2025-01-11',
    duration: 90,
    rate: 75,
    amount: 112.50,
    status: 'completed',
    notes: 'Marcus was more focused today. Good work on trigonometry basics.'
  },
  {
    id: 'session-010',
    studentName: 'Olivia Martinez',
    subject: 'Biology',
    date: '2025-01-09',
    duration: 60,
    rate: 75,
    amount: 75,
    status: 'completed',
    notes: 'Excellent session on photosynthesis. Olivia is ready for advanced topics.'
  }
]

// Mock invoice data
const invoices = [
  {
    id: 'inv-001',
    invoiceNumber: 'INV-2025-001',
    studentName: 'Sarah Chen',
    date: '2025-01-05',
    dueDate: '2025-01-20',
    amount: 340,
    status: 'paid',
    sessions: 4,
    paidDate: '2025-01-12'
  },
  {
    id: 'inv-002',
    invoiceNumber: 'INV-2025-002',
    studentName: 'David Kim',
    date: '2025-01-01',
    dueDate: '2025-01-16',
    amount: 450,
    status: 'sent',
    sessions: 5
  },
  {
    id: 'inv-003',
    invoiceNumber: 'INV-2024-089',
    studentName: 'Lisa Wang',
    date: '2024-12-28',
    dueDate: '2025-01-12',
    amount: 285,
    status: 'overdue',
    sessions: 3
  }
]

// Mock transaction data
const transactions = [
  {
    id: 'trans-001',
    date: '2025-01-14',
    studentName: 'Sarah Chen',
    subject: 'AP Calculus',
    duration: 60,
    rate: 85,
    amount: 85,
    status: 'completed',
    type: 'session',
    paymentMethod: 'Direct Deposit',
    invoiced: true,
    invoiceId: 'inv-001'
  },
  {
    id: 'trans-002', 
    date: '2025-01-14',
    studentName: 'Marcus Johnson',
    subject: 'SAT Math',
    duration: 90,
    rate: 120,
    amount: 180,
    status: 'completed',
    type: 'session',
    paymentMethod: 'Direct Deposit',
    invoiced: false
  },
  {
    id: 'trans-003',
    date: '2025-01-13',
    studentName: 'Emily Rodriguez',
    subject: 'Statistics',
    duration: 60,
    rate: 75,
    amount: 75,
    status: 'pending',
    type: 'session',
    paymentMethod: 'Direct Deposit',
    invoiced: false
  },
  {
    id: 'trans-004',
    date: '2025-01-12',
    studentName: 'David Kim',
    subject: 'Algebra',
    duration: 60,
    rate: 70,
    amount: 70,
    status: 'completed',
    type: 'session',
    paymentMethod: 'Direct Deposit',
    invoiced: true,
    invoiceId: 'inv-002'
  },
  {
    id: 'trans-005',
    date: '2025-01-10',
    studentName: 'Platform',
    subject: 'Weekly Payout',
    duration: 0,
    rate: 0,
    amount: 1250,
    status: 'paid',
    type: 'payout',
    paymentMethod: 'Bank Transfer'
  },
  {
    id: 'trans-006',
    date: '2025-01-08',
    studentName: 'Lisa Wang',
    subject: 'Calculus',
    duration: 90,
    rate: 95,
    amount: 142.50,
    status: 'completed',
    type: 'session',
    paymentMethod: 'Direct Deposit',
    invoiced: true,
    invoiceId: 'inv-003'
  }
]

// Mock upcoming payouts
const upcomingPayouts = [
  {
    id: 'payout-001',
    date: '2025-01-17',
    amount: 875,
    method: 'Direct Deposit',
    status: 'scheduled'
  },
  {
    id: 'payout-002',
    date: '2025-01-24',
    amount: 425,
    method: 'Direct Deposit',
    status: 'processing'
  }
]

export default function EarningsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [showTransactions, setShowTransactions] = useState(true)
  const [transactionFilter, setTransactionFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSessions, setSelectedSessions] = useState<string[]>([])
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [showInvoicePreview, setShowInvoicePreview] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  // Calculate earnings based on period
  const calculateEarnings = () => {
    const now = new Date()
    const thisMonth = transactions
      .filter(t => t.type === 'session' && new Date(t.date).getMonth() === now.getMonth())
      .reduce((sum, t) => sum + t.amount, 0)
    
    const lastMonth = transactions
      .filter(t => t.type === 'session' && new Date(t.date).getMonth() === now.getMonth() - 1)
      .reduce((sum, t) => sum + t.amount, 0)
    
    const thisYear = transactions
      .filter(t => t.type === 'session' && new Date(t.date).getFullYear() === now.getFullYear())
      .reduce((sum, t) => sum + t.amount, 0)
    
    const lifetime = transactions
      .filter(t => t.type === 'session')
      .reduce((sum, t) => sum + t.amount, 0)

    const pending = transactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0)

    const unpaid = transactions
      .filter(t => t.status === 'completed' && !t.invoiced)
      .reduce((sum, t) => sum + t.amount, 0)

    return { thisMonth, lastMonth, thisYear, lifetime, pending, unpaid }
  }

  const earnings = calculateEarnings()

  // Filter transactions
  const filteredTransactions = transactions.filter(t => {
    if (transactionFilter !== 'all' && t.type !== transactionFilter) return false
    if (searchTerm && !t.studentName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !t.subject.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
      case 'paid':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'sent':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800'
      case 'overdue':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'cancelled':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'session':
        return <Clock className="w-4 h-4" />
      case 'payout':
        return <BanknoteIcon className="w-4 h-4" />
      case 'bonus':
        return <TrendingUp className="w-4 h-4" />
      default:
        return <DollarSign className="w-4 h-4" />
    }
  }

  const handleSelectSession = (sessionId: string) => {
    setSelectedSessions(prev => 
      prev.includes(sessionId) 
        ? prev.filter(id => id !== sessionId)
        : [...prev, sessionId]
    )
  }

  const handleSelectAllSessions = () => {
    if (selectedSessions.length === uninvoicedSessions.length) {
      setSelectedSessions([])
    } else {
      setSelectedSessions(uninvoicedSessions.map(s => s.id))
    }
  }

  const calculateSelectedTotal = () => {
    return uninvoicedSessions
      .filter(s => selectedSessions.includes(s.id))
      .reduce((sum, s) => sum + s.amount, 0)
  }

  const handleCreateInvoice = () => {
    if (selectedSessions.length > 0) {
      setShowInvoiceModal(true)
    }
  }

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setShowInvoicePreview(true)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Earnings & Billing</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Track your income and manage payments</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Tax Documents
          </Button>
          <Button variant="gradient" gradientType="nerdy">
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Earnings Overview */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Earnings Overview</h2>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          >
            <option value="month">This Month</option>
            <option value="year">This Year</option>
            <option value="lifetime">Lifetime</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-green-700 dark:text-green-400">Current Period</span>
              <TrendingUp className="w-4 h-4 text-green-600 dark:text-green-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              ${selectedPeriod === 'month' ? earnings.thisMonth.toFixed(2) : 
                 selectedPeriod === 'year' ? earnings.thisYear.toFixed(2) : 
                 earnings.lifetime.toFixed(2)}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              +12.5% from last period
            </div>
          </div>

          <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-blue-700 dark:text-blue-400">Unpaid Balance</span>
              <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${earnings.unpaid.toFixed(2)}</div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Next payout: Jan 17
            </div>
          </div>

          <div className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-yellow-700 dark:text-yellow-400">Pending</span>
              <Clock className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">${earnings.pending.toFixed(2)}</div>
            <div className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
              2 sessions awaiting confirmation
            </div>
          </div>

          <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-purple-700 dark:text-purple-400">Avg Per Session</span>
              <DollarSign className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">$87.50</div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Based on last 30 days
            </div>
          </div>
        </div>

        {/* Earnings Chart Placeholder */}
        <div className="mt-6 p-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 text-center">
          <div className="text-gray-500 dark:text-gray-400">
            <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400 dark:text-gray-500" />
            <p className="text-sm">Earnings chart visualization would go here</p>
          </div>
        </div>
      </div>

      {/* Uninvoiced Sessions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Uninvoiced Sessions</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Select sessions to create an invoice</p>
          </div>
          {selectedSessions.length > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedSessions.length} selected • ${calculateSelectedTotal().toFixed(2)}
              </span>
              <Button 
                variant="gradient" 
                gradientType="nerdy"
                onClick={handleCreateInvoice}
              >
                <FileText className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </div>
          )}
        </div>

        {uninvoicedSessions.length > 0 ? (
          <div className="space-y-2">
            {/* Select All */}
            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <input
                type="checkbox"
                checked={selectedSessions.length === uninvoicedSessions.length}
                onChange={handleSelectAllSessions}
                className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Select All</span>
            </div>

            {/* Sessions List */}
            {uninvoicedSessions.map((session) => (
              <div 
                key={session.id} 
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border transition-all",
                  selectedSessions.includes(session.id) 
                    ? "border-purple-300 bg-purple-50 dark:border-purple-700 dark:bg-purple-900/20" 
                    : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
                )}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedSessions.includes(session.id)}
                    onChange={() => handleSelectSession(session.id)}
                    className="w-4 h-4 text-purple-600 border-gray-300 dark:border-gray-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900 dark:text-gray-100">{session.studentName}</p>
                      <Badge variant="secondary" size="sm" className="bg-gray-100 dark:bg-gray-700 dark:text-gray-300">
                        {session.subject}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(session.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric' 
                      })} • {session.duration} min
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">${session.amount.toFixed(2)}</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">${session.rate}/hr</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 dark:text-green-400 mx-auto mb-3" />
            <p className="text-gray-600 dark:text-gray-400">All sessions have been invoiced!</p>
          </div>
        )}
      </div>

      {/* Invoices */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Recent Invoices</h2>
          <Button variant="outline" size="sm">
            View All
          </Button>
        </div>

        <div className="space-y-3">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">{invoice.invoiceNumber}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.studentName} • {invoice.sessions} sessions</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-gray-100">${invoice.amount.toFixed(2)}</p>
                  <Badge variant="secondary" size="sm" className={getStatusColor(invoice.status)}>
                    {invoice.status}
                  </Badge>
                </div>
                <div className="flex gap-1">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming Payouts */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Upcoming Payouts</h2>
        <div className="space-y-3">
          {upcomingPayouts.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <BanknoteIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-gray-900 dark:text-gray-100">${payout.amount.toFixed(2)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{payout.method}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {new Date(payout.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
                <Badge variant="secondary" size="sm" className={
                  payout.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800' :
                  'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800'
                }>
                  {payout.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Transaction History</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowTransactions(!showTransactions)}
          >
            {showTransactions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {showTransactions && (
          <>
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                />
              </div>
              <select
                value={transactionFilter}
                onChange={(e) => setTransactionFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              >
                <option value="all">All Transactions</option>
                <option value="session">Sessions</option>
                <option value="payout">Payouts</option>
                <option value="bonus">Bonuses</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>

            {/* Transactions Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Description</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Status</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Amount</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="py-3 px-2">
                        <p className="text-sm text-gray-900 dark:text-gray-100">
                          {new Date(transaction.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </p>
                      </td>
                      <td className="py-3 px-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{transaction.studentName}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{transaction.subject}</p>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-1">
                          {getTypeIcon(transaction.type)}
                          <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{transaction.type}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="secondary" size="sm" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 text-right">
                        <p className={cn(
                          "text-sm font-medium",
                          transaction.type === 'payout' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'
                        )}>
                          {transaction.type === 'payout' ? '+' : ''}${transaction.amount.toFixed(2)}
                        </p>
                      </td>
                      <td className="py-3 px-2 text-center">
                        {transaction.type === 'session' && (
                          transaction.invoiced ? (
                            <Badge variant="secondary" size="sm" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
                              <Check className="w-3 h-3 mr-1" />
                              Invoiced
                            </Badge>
                          ) : (
                            <Badge variant="secondary" size="sm" className="bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-400 dark:border-gray-600">
                              Pending
                            </Badge>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>Previous</Button>
                <Button variant="outline" size="sm">Next</Button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Methods */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Payment Methods</h2>
          <Button variant="outline" size="sm">
            Add Method
          </Button>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">Direct Deposit - Bank of America</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">****1234 • Primary Account</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">
              Default
            </Badge>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-gray-100">PayPal</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">john.doe@example.com</p>
              </div>
            </div>
            <Button variant="outline" size="sm">Make Default</Button>
          </div>
        </div>
      </div>

      {/* Create Invoice Modal */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title="Create Invoice"
        description="Generate an invoice for the selected sessions"
        size="lg"
      >
        <div className="space-y-4">
          {/* Invoice Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Invoice Number</label>
              <input
                type="text"
                defaultValue={`INV-2025-00${invoices.length + 1}`}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
              <input
                type="date"
                defaultValue={new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </div>
          </div>

          {/* Selected Sessions Summary */}
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Selected Sessions</h3>
            <div className="space-y-2">
              {uninvoicedSessions
                .filter(s => selectedSessions.includes(s.id))
                .map(session => (
                  <div key={session.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {session.studentName} - {session.subject} ({session.duration} min)
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">${session.amount.toFixed(2)}</span>
                  </div>
                ))}
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between">
              <span className="font-medium text-gray-900 dark:text-gray-100">Total</span>
              <span className="font-bold text-lg text-gray-900 dark:text-gray-100">${calculateSelectedTotal().toFixed(2)}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Method</label>
            <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400">
              <option>Request Direct Deposit</option>
              <option>Request PayPal Transfer</option>
              <option>Request Check</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes (Optional)</label>
            <textarea
              rows={3}
              placeholder="Add any additional notes for this invoice..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <Button 
              variant="outline"
              onClick={() => setShowInvoiceModal(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="gradient"
              gradientType="nerdy"
              onClick={() => {
                setShowInvoiceModal(false)
                setSelectedSessions([])
                // In a real app, this would create the invoice
              }}
            >
              <Send className="w-4 h-4 mr-2" />
              Create & Send Invoice
            </Button>
          </div>
        </div>
      </Modal>

      {/* Invoice Preview Modal */}
      <Modal
        isOpen={showInvoicePreview}
        onClose={() => setShowInvoicePreview(false)}
        title="Invoice Preview"
        size="lg"
      >
        {selectedInvoice && (
          <div className="space-y-4">
            {/* Invoice Header */}
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{selectedInvoice.invoiceNumber}</h2>
                <p className="text-gray-600 dark:text-gray-400">Issued: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
              </div>
              <Badge 
                variant="secondary" 
                size="lg" 
                className={getStatusColor(selectedInvoice.status)}
              >
                {selectedInvoice.status}
              </Badge>
            </div>

            {/* Invoice Details */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Student:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedInvoice.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Sessions:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">{selectedInvoice.sessions}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                </span>
              </div>
              {selectedInvoice.paidDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid Date:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">
                    {new Date(selectedInvoice.paidDate).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="border-t pt-4 flex justify-between items-center">
              <span className="text-lg font-medium text-gray-900 dark:text-gray-100">Total Amount</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">${selectedInvoice.amount.toFixed(2)}</span>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline">
                <Download className="w-4 h-4 mr-2" />
                Download PDF
              </Button>
              <Button variant="gradient" gradientType="nerdy">
                <Send className="w-4 h-4 mr-2" />
                Resend Invoice
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
} 