'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft,
  Download,
  Printer,
  Send,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Calendar,
  User,
  MapPin,
  Phone,
  Mail,
  FileText,
  Loader
} from 'lucide-react'
import { Card, Button, Badge } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase-browser'

interface InvoiceDetail {
  id: string
  invoice_number: string
  tutor_id: string
  student_id: string
  amount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issue_date: string
  due_date: string
  paid_date?: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
  students?: {
    first_name: string
    last_name: string
    grade: string
    parent_name?: string
    parent_email?: string
    parent_phone?: string
    address?: string
  }
  sessions?: Array<{
    id: string
    subject: string
    scheduled_at: string
    duration_minutes: number
    price: number
  }>
}

export default function InvoiceDetailPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const { tutor } = useAuth()
  const supabase = createClient()
  
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .select(`
            *,
            students:student_id (
              first_name,
              last_name,
              grade,
              parent_name,
              parent_email,
              parent_phone,
              address
            )
          `)
          .eq('id', invoiceId)
          .single()

        if (error) throw error

        // Get related sessions
        const { data: sessions } = await supabase
          .from('sessions')
          .select('id, subject, scheduled_at, duration_minutes, price')
          .eq('student_id', data.student_id)
          .gte('scheduled_at', data.issue_date)
          .lte('scheduled_at', data.due_date)
          .eq('status', 'completed')
          .order('scheduled_at', { ascending: true })

        setInvoice({ ...data, sessions: sessions || [] })
      } catch (err) {
        console.error('Error fetching invoice:', err)
        setError('Failed to load invoice')
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvoice()
  }, [invoiceId, supabase])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
      case 'sent': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800'
      case 'overdue': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
      case 'draft': return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="h-4 w-4" />
      case 'sent': return <Send className="h-4 w-4" />
      case 'overdue': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownload = () => {
    // In a real app, this would generate a PDF
    alert('PDF download functionality would be implemented here')
  }

  const handleSendInvoice = async () => {
    if (!invoice || invoice.status !== 'draft') return
    
    setSending(true)
    try {
      // Update invoice status to sent
      const { error } = await supabase
        .from('invoices')
        .update({ status: 'sent' })
        .eq('id', invoice.id)

      if (error) throw error

      // In a real app, this would send an email
      alert('Invoice sent successfully!')
      
      // Refresh invoice
      setInvoice({ ...invoice, status: 'sent' })
    } catch (err) {
      console.error('Error sending invoice:', err)
      alert('Failed to send invoice')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader className="h-8 w-8 text-purple-600 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Loading invoice...</p>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            {error || 'Invoice not found'}
          </h3>
          <Button
            variant="outline"
            onClick={() => router.push('/billing')}
            className="mt-4"
          >
            Back to Billing
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light print:bg-white">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Actions - Hidden in print */}
        <div className="mb-6 print:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/billing')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Billing
          </Button>
          
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Invoice {invoice.invoice_number}
            </h1>
            
            <div className="flex items-center gap-2">
              {invoice.status === 'draft' && (
                <Button
                  variant="gradient"
                  gradientType="nerdy"
                  leftIcon={sending ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  onClick={handleSendInvoice}
                  disabled={sending}
                >
                  {sending ? 'Sending...' : 'Send Invoice'}
                </Button>
              )}
              <Button
                variant="outline"
                leftIcon={<Printer className="h-4 w-4" />}
                onClick={handlePrint}
              >
                Print
              </Button>
              <Button
                variant="outline"
                leftIcon={<Download className="h-4 w-4" />}
                onClick={handleDownload}
              >
                Download PDF
              </Button>
            </div>
          </div>
        </div>

        {/* Invoice Content */}
        <Card className="p-8 print:p-12 print:shadow-none print:border-0">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">INVOICE</h2>
              <p className="text-lg text-gray-600 dark:text-gray-400">#{invoice.invoice_number}</p>
              <Badge 
                variant="secondary" 
                className={cn('mt-2', getStatusColor(invoice.status))}
              >
                <span className="flex items-center gap-1">
                  {getStatusIcon(invoice.status)}
                  {invoice.status.toUpperCase()}
                </span>
              </Badge>
            </div>
            
            <div className="text-right">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {tutor?.first_name} {tutor?.last_name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{tutor?.email}</p>
              {tutor?.phone && <p className="text-sm text-gray-600 dark:text-gray-400">{tutor.phone}</p>}
            </div>
          </div>

          {/* Bill To Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Bill To:</h4>
              <div className="text-gray-600 dark:text-gray-400">
                <p className="font-medium text-gray-900 dark:text-gray-100">
                  {invoice.students?.parent_name || `${invoice.students?.first_name} ${invoice.students?.last_name}`}
                </p>
                <p>{invoice.students?.parent_email}</p>
                {invoice.students?.parent_phone && <p>{invoice.students?.parent_phone}</p>}
                {invoice.students?.address && <p>{invoice.students?.address}</p>}
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Invoice Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(invoice.issue_date)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatDate(invoice.due_date)}
                  </span>
                </div>
                {invoice.paid_date && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Paid Date:</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDate(invoice.paid_date)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sessions Table */}
          <div className="mb-8">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Sessions</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Date
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Subject
                    </th>
                    <th className="text-left py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Duration
                    </th>
                    <th className="text-right py-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.sessions?.map((session) => (
                    <tr key={session.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                        {new Date(session.scheduled_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                        {session.subject}
                      </td>
                      <td className="py-3 text-sm text-gray-900 dark:text-gray-100">
                        {session.duration_minutes} min
                      </td>
                      <td className="py-3 text-sm text-right font-medium text-gray-900 dark:text-gray-100">
                        {formatCurrency(session.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                <span className="font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(invoice.amount)}
                </span>
              </div>
              {invoice.tax > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Tax</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {formatCurrency(invoice.tax)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-900 dark:text-gray-100">Total</span>
                <span className="text-gray-900 dark:text-gray-100">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Notes</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.notes}</p>
            </div>
          )}

          {/* Payment Instructions - Only show for unpaid invoices */}
          {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
            <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Payment Instructions</h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Please make payment by {formatDate(invoice.due_date)} to avoid late fees.
                Payment can be made via bank transfer, check, or online payment.
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
} 