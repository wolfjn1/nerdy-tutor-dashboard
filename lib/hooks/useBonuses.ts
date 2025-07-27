import { useState, useEffect } from 'react';
import { Bonus, BonusSummary } from '@/lib/gamification/BonusCalculator';

interface UseBonusesReturn {
  summary: BonusSummary | null;
  bonuses: Bonus[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBonuses = (): UseBonusesReturn => {
  const [summary, setSummary] = useState<BonusSummary | null>(null);
  const [bonuses, setBonuses] = useState<Bonus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBonuses = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/bonuses/summary');
      if (!response.ok) {
        throw new Error('Failed to fetch bonuses');
      }

      const data = await response.json();
      setSummary(data.summary);
      setBonuses(data.recentBonuses || []);
    } catch (err) {
      console.error('Error fetching bonuses:', err);
      setError('Failed to load bonus information');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBonuses();
  }, []);

  const calculateBonus = async (type: string, params: Record<string, any>) => {
    try {
      const response = await fetch('/api/bonuses/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type, ...params }),
      });

      if (!response.ok) {
        throw new Error('Failed to calculate bonus');
      }

      const result = await response.json();
      
      // Refresh data if bonus was recorded
      if (result.recorded) {
        await fetchBonuses();
      }

      return result;
    } catch (err) {
      console.error('Error calculating bonus:', err);
      throw err;
    }
  };

  return {
    summary,
    bonuses,
    loading,
    error,
    refetch: fetchBonuses,
  };
}; 