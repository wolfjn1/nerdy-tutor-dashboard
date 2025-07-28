import { useState, useEffect, useCallback, useMemo } from 'react';
import { BonusStatus, BonusType } from '@/lib/gamification/BonusCalculator';

export interface BonusData {
  id: string;
  tutor_id: string;
  tutor_name: string;
  tutor_email: string;
  tutor_tier?: string;
  bonus_type: BonusType;
  amount: number;
  status: BonusStatus;
  reference_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  approved_at?: string;
  paid_at?: string;
}

interface BonusStats {
  pendingCount: number;
  pendingTotal: number;
  approvedCount: number;
  approvedTotal: number;
  paidCount: number;
  paidTotal: number;
  thisMonthTotal: number;
  lastMonthTotal: number;
}

interface UseBonusManagementReturn {
  bonuses: BonusData[];
  stats: BonusStats | null;
  loading: boolean;
  error: string | null;
  filter: BonusStatus | 'all';
  setFilter: (filter: BonusStatus | 'all') => void;
  searchTerm: string;
  setSearchTerm: (search: string) => void;
  sortBy: 'date' | 'amount';
  setSortBy: (sort: 'date' | 'amount') => void;
  selectedBonuses: string[];
  toggleBonusSelection: (id: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  approveBonus: (id: string) => Promise<void>;
  rejectBonus: (id: string, reason: string) => Promise<void>;
  approveBulk: (ids: string[]) => Promise<void>;
  refetch: () => void;
}

export const useBonusManagement = (): UseBonusManagementReturn => {
  const [bonuses, setBonuses] = useState<BonusData[]>([]);
  const [stats, setStats] = useState<BonusStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<BonusStatus | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [selectedBonuses, setSelectedBonuses] = useState<string[]>([]);

  // Debounce search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchBonuses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      if (debouncedSearchTerm) params.append('search', debouncedSearchTerm);
      if (sortBy) params.append('sort', sortBy);

      const response = await fetch(`/api/admin/bonuses?${params.toString()}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch bonuses');
      }

      const data = await response.json();
      // Ensure bonus_type is properly typed
      const typedBonuses = (data.bonuses || []).map((bonus: any) => ({
        ...bonus,
        bonus_type: bonus.bonus_type as BonusType,
      }));
      setBonuses(typedBonuses);
      setStats(data.stats || null);
    } catch (err) {
      console.error('Error fetching bonuses:', err);
      setError('Failed to load bonus data');
      setBonuses([]);
    } finally {
      setLoading(false);
    }
  }, [filter, debouncedSearchTerm, sortBy]);

  useEffect(() => {
    fetchBonuses();
  }, [fetchBonuses]);

  const toggleBonusSelection = useCallback((id: string) => {
    setSelectedBonuses(prev => 
      prev.includes(id) 
        ? prev.filter(bonusId => bonusId !== id)
        : [...prev, id]
    );
  }, []);

  const selectAll = useCallback(() => {
    const pendingBonuses = bonuses
      .filter(b => b.status === 'pending')
      .map(b => b.id);
    setSelectedBonuses(pendingBonuses);
  }, [bonuses]);

  const clearSelection = useCallback(() => {
    setSelectedBonuses([]);
  }, []);

  const approveBonus = useCallback(async (id: string) => {
    try {
      const response = await fetch(`/api/admin/bonuses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status: 'approved' }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve bonus');
      }

      await fetchBonuses();
      clearSelection();
    } catch (err) {
      console.error('Error approving bonus:', err);
      setError('Failed to approve bonus');
    }
  }, [fetchBonuses, clearSelection]);

  const rejectBonus = useCallback(async (id: string, reason: string) => {
    try {
      const response = await fetch(`/api/admin/bonuses/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          status: 'cancelled',
          metadata: { rejection_reason: reason }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject bonus');
      }

      await fetchBonuses();
      clearSelection();
    } catch (err) {
      console.error('Error rejecting bonus:', err);
      setError('Failed to reject bonus');
    }
  }, [fetchBonuses, clearSelection]);

  const approveBulk = useCallback(async (ids: string[]) => {
    try {
      const response = await fetch('/api/admin/bonuses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ 
          action: 'approve',
          bonusIds: ids
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to approve bonuses');
      }

      await fetchBonuses();
      clearSelection();
    } catch (err) {
      console.error('Error approving bonuses:', err);
      setError('Failed to approve bonuses');
    }
  }, [fetchBonuses, clearSelection]);

  return {
    bonuses,
    stats,
    loading,
    error,
    filter,
    setFilter,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    selectedBonuses,
    toggleBonusSelection,
    selectAll,
    clearSelection,
    approveBonus,
    rejectBonus,
    approveBulk,
    refetch: fetchBonuses,
  };
}; 