import { useState, useEffect } from 'react';

interface Badge {
  id: string;
  tutor_id: string;
  badge_type: string;
  earned_at: string;
  metadata?: any;
}

interface UseBadgesReturn {
  badges: Badge[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useBadges = (): UseBadgesReturn => {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBadges = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/gamification/badges', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch badges');
      }

      const data = await response.json();
      setBadges(data.badges || []);
    } catch (err) {
      console.error('Error fetching badges:', err);
      setError('Failed to load badges');
      setBadges([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBadges();
  }, []);

  return {
    badges,
    loading,
    error,
    refetch: fetchBadges,
  };
}; 