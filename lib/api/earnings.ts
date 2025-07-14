import { createClient } from '@/lib/supabase-browser'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfYear, endOfYear } from 'date-fns'

const supabase = createClient()

export interface InvoiceData {
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
  }
}

// Get earnings summary for different periods
export async function getEarningsSummary(tutorId: string) {
  const now = new Date()
  
  // This week
  const weekStart = startOfWeek(now)
  const weekEnd = endOfWeek(now)
  
  // This month
  const monthStart = startOfMonth(now)
  const monthEnd = endOfMonth(now)
  
  // This year
  const yearStart = startOfYear(now)
  const yearEnd = endOfYear(now)

  // Get completed sessions for different periods
  const [weekData, monthData, yearData] = await Promise.all([
    supabase
      .from('sessions')
      .select('earnings')
      .eq('tutor_id', tutorId)
      .eq('status', 'completed')
      .gte('scheduled_at', weekStart.toISOString())
      .lte('scheduled_at', weekEnd.toISOString()),
    
    supabase
      .from('sessions')
      .select('earnings')
      .eq('tutor_id', tutorId)
      .eq('status', 'completed')
      .gte('scheduled_at', monthStart.toISOString())
      .lte('scheduled_at', monthEnd.toISOString()),
    
    supabase
      .from('sessions')
      .select('earnings')
      .eq('tutor_id', tutorId)
      .eq('status', 'completed')
      .gte('scheduled_at', yearStart.toISOString())
      .lte('scheduled_at', yearEnd.toISOString())
  ])

  const weekEarnings = weekData.data?.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0) || 0
  const monthEarnings = monthData.data?.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0) || 0
  const yearEarnings = yearData.data?.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0) || 0

  // Get pending invoices total
  const { data: pendingInvoices } = await supabase
    .from('invoices')
    .select('total')
    .eq('tutor_id', tutorId)
    .in('status', ['sent', 'overdue'])

  const pendingTotal = pendingInvoices?.reduce((sum, inv) => sum + (Number(inv.total) || 0), 0) || 0

  // Get average hourly rate from recent sessions
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('earnings, duration')
    .eq('tutor_id', tutorId)
    .eq('status', 'completed')
    .gte('scheduled_at', monthStart.toISOString())
    .limit(10)

  let avgHourlyRate = 85 // Default
  if (recentSessions && recentSessions.length > 0) {
    const totalHours = recentSessions.reduce((sum, s) => sum + (s.duration / 60), 0)
    const totalEarnings = recentSessions.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0)
    if (totalHours > 0) {
      avgHourlyRate = Math.round(totalEarnings / totalHours)
    }
  }

  return {
    thisWeek: weekEarnings,
    thisMonth: monthEarnings,
    thisYear: yearEarnings,
    pending: pendingTotal,
    avgHourlyRate
  }
}

// Get monthly earnings data for chart
export async function getMonthlyEarnings(tutorId: string, months: number = 12) {
  const monthlyData = []
  const now = new Date()

  for (let i = months - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const start = startOfMonth(date)
    const end = endOfMonth(date)

    const { data } = await supabase
      .from('sessions')
      .select('earnings')
      .eq('tutor_id', tutorId)
      .eq('status', 'completed')
      .gte('scheduled_at', start.toISOString())
      .lte('scheduled_at', end.toISOString())

    const total = data?.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0) || 0

    monthlyData.push({
      month: date.toLocaleString('default', { month: 'short' }),
      year: date.getFullYear(),
      earnings: total
    })
  }

  return monthlyData
}

// Get invoices with filters
export async function getInvoices(
  tutorId: string,
  filters?: {
    status?: string
    studentId?: string
    startDate?: string
    endDate?: string
  }
) {
  let query = supabase
    .from('invoices')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name
      )
    `)
    .eq('tutor_id', tutorId)
    .order('issue_date', { ascending: false })

  // Apply filters
  if (filters?.status && filters.status !== 'all') {
    query = query.eq('status', filters.status)
  }

  if (filters?.studentId) {
    query = query.eq('student_id', filters.studentId)
  }

  if (filters?.startDate) {
    query = query.gte('issue_date', filters.startDate)
  }

  if (filters?.endDate) {
    query = query.lte('issue_date', filters.endDate)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching invoices:', error)
    return []
  }

  return data || []
}

// Get a single invoice with details
export async function getInvoice(invoiceId: string) {
  const { data: invoice, error } = await supabase
    .from('invoices')
    .select(`
      *,
      students:student_id (
        first_name,
        last_name,
        email
      ),
      invoice_sessions!invoice_sessions_invoice_id_fkey (
        sessions!invoice_sessions_session_id_fkey (
          id,
          scheduled_at,
          subject,
          duration,
          earnings
        )
      )
    `)
    .eq('id', invoiceId)
    .single()

  if (error) {
    console.error('Error fetching invoice:', error)
    return null
  }

  return invoice
}

// Create a new invoice
export async function createInvoice(
  tutorId: string,
  studentId: string,
  sessionIds: string[],
  dueDate: string,
  notes?: string
) {
  // Get sessions to calculate total
  const { data: sessions } = await supabase
    .from('sessions')
    .select('earnings')
    .in('id', sessionIds)

  const subtotal = sessions?.reduce((sum, s) => sum + (Number(s.earnings) || 0), 0) || 0
  const tax = subtotal * 0.13 // 13% tax rate
  const total = subtotal + tax

  // Generate invoice number
  const invoiceNumber = `INV-${Date.now()}`

  // Create invoice
  const { data: invoice, error: invoiceError } = await supabase
    .from('invoices')
    .insert({
      invoice_number: invoiceNumber,
      tutor_id: tutorId,
      student_id: studentId,
      amount: subtotal,
      tax: tax,
      total: total,
      status: 'draft',
      issue_date: new Date().toISOString().split('T')[0],
      due_date: dueDate,
      notes: notes
    })
    .select()
    .single()

  if (invoiceError) {
    console.error('Error creating invoice:', invoiceError)
    throw invoiceError
  }

  // Link sessions to invoice
  const sessionLinks = sessionIds.map(sessionId => ({
    invoice_id: invoice.id,
    session_id: sessionId
  }))

  const { error: linkError } = await supabase
    .from('invoice_sessions')
    .insert(sessionLinks)

  if (linkError) {
    console.error('Error linking sessions to invoice:', linkError)
    // Rollback invoice creation
    await supabase.from('invoices').delete().eq('id', invoice.id)
    throw linkError
  }

  return invoice
}

// Update invoice status
export async function updateInvoiceStatus(
  invoiceId: string,
  status: InvoiceData['status'],
  paidDate?: string,
  paymentMethod?: string
) {
  const updates: any = { status }
  
  if (status === 'paid' && paidDate) {
    updates.paid_date = paidDate
    updates.payment_method = paymentMethod
  }

  const { data, error } = await supabase
    .from('invoices')
    .update(updates)
    .eq('id', invoiceId)
    .select()
    .single()

  if (error) {
    console.error('Error updating invoice:', error)
    throw error
  }

  return data
}

// Get unpaid sessions for a student
export async function getUnpaidSessions(tutorId: string, studentId: string) {
  // Get all completed sessions that are not linked to any invoice
  const { data: sessions } = await supabase
    .from('sessions')
    .select(`
      *,
      invoice_sessions!invoice_sessions_session_id_fkey (
        invoice_id
      )
    `)
    .eq('tutor_id', tutorId)
    .eq('student_id', studentId)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false })

  // Filter out sessions that are already invoiced
  const unpaidSessions = sessions?.filter(
    session => !session.invoice_sessions || session.invoice_sessions.length === 0
  ) || []

  return unpaidSessions.map(({ invoice_sessions, ...session }) => session)
} 