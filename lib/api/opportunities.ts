import { createClient } from '@/lib/supabase-browser'

const supabase = createClient()

export interface OpportunityData {
  id: string
  student_name: string
  student_avatar?: string
  student_level?: string
  subject: string
  duration: number
  frequency?: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  pay_rate?: number
  start_date?: string
  preferred_times?: string[]
  needs?: string
  match_score?: number
  is_active: boolean
  created_at: string
  updated_at: string
}

// Get all opportunities
export async function getOpportunities(filters?: {
  subject?: string
  urgency?: string
  isActive?: boolean
}) {
  let query = supabase
    .from('opportunities')
    .select('*')
    .order('match_score', { ascending: false })
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters?.subject) {
    query = query.eq('subject', filters.subject)
  }

  if (filters?.urgency) {
    query = query.eq('urgency', filters.urgency)
  }

  if (filters?.isActive !== undefined) {
    query = query.eq('is_active', filters.isActive)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching opportunities:', error)
    return []
  }

  return data || []
}

// Get a single opportunity
export async function getOpportunity(opportunityId: string) {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .eq('id', opportunityId)
    .single()

  if (error) {
    console.error('Error fetching opportunity:', error)
    return null
  }

  return data
}

// Apply to an opportunity (create a message/application)
export async function applyToOpportunity(
  opportunityId: string,
  tutorId: string,
  message: string
) {
  // In a real app, this would create an application record
  // For now, we'll just log it
  console.log('Applying to opportunity:', { opportunityId, tutorId, message })
  
  // You could create an applications table and insert a record here
  // const { data, error } = await supabase
  //   .from('applications')
  //   .insert({
  //     opportunity_id: opportunityId,
  //     tutor_id: tutorId,
  //     message,
  //     status: 'pending'
  //   })
  
  return { success: true }
}

// Calculate match score for opportunities
export async function calculateMatchScores(tutorId: string) {
  // Get tutor's subjects
  const { data: tutor } = await supabase
    .from('tutors')
    .select('subjects, hourly_rate')
    .eq('id', tutorId)
    .single()

  if (!tutor) return

  // Get all active opportunities
  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('*')
    .eq('is_active', true)

  if (!opportunities) return

  // Calculate match scores
  const updates = opportunities.map(opp => {
    let score = 50 // Base score

    // Subject match
    if (tutor.subjects?.includes(opp.subject)) {
      score += 30
    }

    // Pay rate match
    if (opp.pay_rate && tutor.hourly_rate) {
      if (opp.pay_rate >= tutor.hourly_rate) {
        score += 20
      } else if (opp.pay_rate >= tutor.hourly_rate * 0.8) {
        score += 10
      }
    }

    return {
      id: opp.id,
      match_score: Math.min(100, score)
    }
  })

  // Update match scores in batch
  for (const update of updates) {
    await supabase
      .from('opportunities')
      .update({ match_score: update.match_score })
      .eq('id', update.id)
  }
} 