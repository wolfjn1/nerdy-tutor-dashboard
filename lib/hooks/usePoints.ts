import { useState, useEffect } from 'react';

interface PointsData {
  totalPoints: number;
  level: string;
  recentTransactions: Array<{
    id: string;
    points: number;
    reason: string;
    created_at: string;
    metadata?: any;
  }>;
}

interface UsePointsReturn {
  pointsData: PointsData | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const usePoints = (): UsePointsReturn => {
  const [pointsData, setPointsData] = useState<PointsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoints = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/gamification/points', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch points');
      }

      const data = await response.json();
      setPointsData({
        totalPoints: data.totalPoints,
        level: data.level,
        recentTransactions: data.recentTransactions || []
      });
    } catch (err) {
      console.error('Error fetching points:', err);
      setError('Failed to load points data');
      setPointsData({
        totalPoints: 0,
        level: 'Beginner',
        recentTransactions: []
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  return {
    pointsData,
    loading,
    error,
    refetch: fetchPoints,
  };
}; 