import { useState, useEffect, useCallback } from 'react';
import { TutorRate, RateHistory, RateComparison } from '@/lib/gamification/RateAdjustmentService';
import { TutorTier } from '@/lib/gamification/TierSystem';

interface UseRateAdjustmentReturn {
  rate: TutorRate | null;
  history: RateHistory[];
  comparison: RateComparison | null;
  tier: TutorTier;
  loading: boolean;
  error: string | null;
  isUpdating: boolean;
  recentPromotion: boolean;
  updateBaseRate: (newRate: number) => Promise<void>;
  applyCustomAdjustment: (percentage: number) => Promise<void>;
  refetch: () => void;
}

export const useRateAdjustment = (): UseRateAdjustmentReturn => {
  const [rate, setRate] = useState<TutorRate | null>(null);
  const [history, setHistory] = useState<RateHistory[]>([]);
  const [comparison, setComparison] = useState<RateComparison | null>(null);
  const [tier, setTier] = useState<TutorTier>('standard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [recentPromotion, setRecentPromotion] = useState(false);

  const fetchRateData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/rates');
      
      if (!response.ok) {
        throw new Error('Failed to fetch rate data');
      }

      const data = await response.json();
      
      setRate(data.rate);
      setHistory(data.history);
      setTier(data.tier);

      // Check if there was a recent tier promotion
      const recentTierChange = data.history.find(
        (h: RateHistory) => 
          h.changeType === 'tier_promotion' && 
          new Date(h.createdAt).getTime() > Date.now() - 24 * 60 * 60 * 1000
      );
      setRecentPromotion(!!recentTierChange);

      // Fetch comparison data
      const comparisonResponse = await fetch('/api/rates/compare', {
        method: 'POST',
      });

      if (comparisonResponse.ok) {
        const comparisonData = await comparisonResponse.json();
        setComparison(comparisonData.comparison);
      }
    } catch (err) {
      console.error('Error fetching rate data:', err);
      setError('Failed to load rate information');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRateData();
  }, [fetchRateData]);

  const updateBaseRate = useCallback(async (newRate: number) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await fetch('/api/rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ baseRate: newRate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update rate');
      }

      setRate(data.rate);
      
      // Refresh all data
      await fetchRateData();
    } catch (err: any) {
      console.error('Error updating base rate:', err);
      setError(err.message || 'Failed to update rate');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchRateData]);

  const applyCustomAdjustment = useCallback(async (percentage: number) => {
    try {
      setIsUpdating(true);
      setError(null);

      const response = await fetch('/api/rates', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customAdjustment: percentage }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to apply adjustment');
      }

      setRate(data.rate);
      
      // Refresh all data
      await fetchRateData();
    } catch (err: any) {
      console.error('Error applying custom adjustment:', err);
      setError(err.message || 'Failed to apply adjustment');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, [fetchRateData]);

  return {
    rate,
    history,
    comparison,
    tier,
    loading,
    error,
    isUpdating,
    recentPromotion,
    updateBaseRate,
    applyCustomAdjustment,
    refetch: fetchRateData,
  };
}; 