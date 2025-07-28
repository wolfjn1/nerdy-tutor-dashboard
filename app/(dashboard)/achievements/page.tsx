import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { GamificationCenter } from '@/components/gamification';

export default async function AchievementsPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  // Fetch the tutor record to get the correct tutor ID
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .select('id')
    .eq('auth_user_id', user.id)
    .single();
  
  if (tutorError || !tutor) {
    // If no tutor record exists, redirect to dashboard or onboarding
    console.error('No tutor record found for user:', user.id);
    redirect('/dashboard');
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <GamificationCenter tutorId={tutor.id} />
    </div>
  );
} 