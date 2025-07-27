import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding'

export default async function OnboardingPage() {
  const supabase = await createClient()
  
  // Get authenticated user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  
  if (userError || !user) {
    redirect('/login')
  }

  // Check if user has already completed onboarding
  const { data: onboardingData } = await supabase
    .from('tutor_onboarding')
    .select('step_completed')
    .eq('tutor_id', user.id)

  // If they have completed all 5 steps, redirect to dashboard
  if (onboardingData && onboardingData.length >= 5) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen">
      <OnboardingWizard tutorId={user.id} />
    </div>
  )
} 