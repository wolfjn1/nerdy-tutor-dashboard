import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { GamificationCenter } from '@/components/gamification';

export default async function AchievementsPage() {
  const supabase = await createClient();
  
  const { data: { user }, error } = await supabase.auth.getUser();
  
  if (error || !user) {
    redirect('/login');
  }

  return (
    <div className="container max-w-7xl mx-auto p-6">
      <GamificationCenter tutorId={user.id} />
    </div>
  );
} 