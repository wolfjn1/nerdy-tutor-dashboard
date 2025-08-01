'use client';

import { useState, useEffect } from 'react';
import { TierProgress } from '@/lib/gamification/TierSystem';

// Enhanced TierProgress with additional UI properties
interface EnhancedTierProgress extends TierProgress {
  tierBenefits?: string[];
  currentRateIncrease?: number;
  nextTierRateIncrease?: number;
}

interface UseGameificationReturn {
  stats: EnhancedTierProgress | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useGameification = (): UseGameificationReturn => {
  const [stats, setStats] = useState<EnhancedTierProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTierData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/gamification/tier', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch tier data');
      }

      const data = await response.json();
      setStats(data.tierProgress);
    } catch (err) {
      console.error('Error fetching tier data:', err);
      setError('Failed to load tier information');
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTierData();
  }, []);

  return {
    stats,
    loading,
    error,
    refetch: fetchTierData,
  };
}; 