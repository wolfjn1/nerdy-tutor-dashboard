import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

interface GamificationUpdate {
  type: 'points' | 'badge' | 'tier' | 'bonus';
  data: any;
  timestamp: string;
}

export function useGamificationRealtime(tutorId: string) {
  const [updates, setUpdates] = useState<GamificationUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!tutorId) return;

    const supabase = createClient();
    let channel: RealtimeChannel;

    const setupSubscription = async () => {
      // Subscribe to gamification updates for this tutor
      channel = supabase
        .channel(`gamification_${tutorId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'gamification_points',
            filter: `tutor_id=eq.${tutorId}`
          },
          (payload) => {
            console.log('New points earned:', payload);
            setUpdates(prev => [{
              type: 'points' as const,
              data: payload.new,
              timestamp: new Date().toISOString()
            }, ...prev].slice(0, 10)); // Keep last 10 updates
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tutor_badges',
            filter: `tutor_id=eq.${tutorId}`
          },
          (payload) => {
            console.log('New badge earned:', payload);
            setUpdates(prev => [{
              type: 'badge' as const,
              data: payload.new,
              timestamp: new Date().toISOString()
            }, ...prev].slice(0, 10));
          }
        )
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'tutor_tiers',
            filter: `tutor_id=eq.${tutorId}`
          },
          (payload) => {
            console.log('Tier update:', payload);
            setUpdates(prev => [{
              type: 'tier' as const,
              data: payload.new,
              timestamp: new Date().toISOString()
            }, ...prev].slice(0, 10));
          }
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'tutor_bonuses',
            filter: `tutor_id=eq.${tutorId}`
          },
          (payload) => {
            console.log('New bonus:', payload);
            setUpdates(prev => [{
              type: 'bonus' as const,
              data: payload.new,
              timestamp: new Date().toISOString()
            }, ...prev].slice(0, 10));
          }
        )
        .subscribe((status) => {
          setIsConnected(status === 'SUBSCRIBED');
        });
    };

    setupSubscription();

    // Cleanup function
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [tutorId]);

  return {
    updates,
    isConnected,
    clearUpdates: () => setUpdates([])
  };
} 