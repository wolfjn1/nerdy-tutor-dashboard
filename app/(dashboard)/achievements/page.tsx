import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import AchievementsClient from './achievements-client';

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
    redirect('/dashboard');
  }

  return <AchievementsClient tutorId={tutor.id} />;
} 