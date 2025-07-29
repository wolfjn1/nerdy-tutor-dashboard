'use client';

import { GamificationCenter } from '@/components/gamification';

interface AchievementsClientProps {
  tutorId: string;
}

export default function AchievementsClient({ tutorId }: AchievementsClientProps) {
  console.log('[AchievementsClient] Rendering with tutorId:', tutorId);
  
  return (
    <div className="container max-w-7xl mx-auto p-6">
      <GamificationCenter tutorId={tutorId} />
    </div>
  );
} 