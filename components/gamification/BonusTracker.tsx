'use client';

import React, { useState } from 'react';
import { Card, Button } from '@/components/ui';
import { 
  DollarSign, 
  TrendingUp, 
  Star, 
  Users, 
  Trophy,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Calendar
} from 'lucide-react';
import { useBonuses } from '@/lib/hooks/useBonuses';
import { BonusStatus, BonusType } from '@/lib/gamification/BonusCalculator';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';

const bonusTypeConfig: Record<BonusType, { label: string; icon: any; color: string }> = {
  student_retention: { label: 'Student Retention Bonus', icon: Users, color: 'text-blue-600' },
  session_milestone: { label: 'Session Milestone', icon: Trophy, color: 'text-purple-600' },
  five_star_review: { label: '5-Star Review Bonus', icon: Star, color: 'text-yellow-600' },
  student_referral: { label: 'Referral Bonus', icon: TrendingUp, color: 'text-green-600' },
};

const statusConfig: Record<BonusStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  paid: { label: 'Paid', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

export function BonusTracker() {
  const { summary, bonuses, loading, error, refetch } = useBonuses();
  const [filter, setFilter] = useState<BonusStatus | 'all'>('all');
  const [expandedBonus, setExpandedBonus] = useState<string | null>(null);

  if (loading) {
    return (
      <Card className="p-6" data-testid="bonus-tracker-skeleton">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
          </div>
          <Button
            onClick={refetch}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  const filteredBonuses = filter === 'all' 
    ? bonuses 
    : bonuses.filter(b => b.status === filter);

  const formatBonusDescription = (bonus: any) => {
    const { metadata } = bonus;
    
    switch (bonus.bonus_type) {
      case 'student_retention':
        return `${metadata?.studentName || 'Student'} - ${metadata?.monthsRetained || 0} months`;
      case 'session_milestone':
        return `${metadata?.milestone || metadata?.totalSessions || 0} sessions completed`;
      case 'five_star_review':
        return 'Excellent feedback received';
      case 'student_referral':
        return 'Successfully referred student';
      default:
        return '';
    }
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}`;
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${summary.pendingTotal}
                </p>
                <p className="text-xs text-gray-500">
                  {summary.pendingCount} bonuses
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Approved</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${summary.approvedTotal}
                </p>
                <p className="text-xs text-gray-500">
                  {summary.approvedCount} bonuses
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">This Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${summary.paidThisMonth}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Lifetime Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${summary.lifetimeEarnings || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Bonus List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Bonus History
          </h2>
          
          {/* Filter Buttons */}
          <div className="flex gap-2">
            {(['all', 'pending', 'approved', 'paid'] as const).map(status => (
              <Button
                key={status}
                size="sm"
                variant={filter === status ? 'solid' : 'outline'}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {filteredBonuses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              No bonuses yet
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Keep up the great work and earn bonuses for your achievements!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredBonuses.map(bonus => {
              const config = bonusTypeConfig[bonus.bonus_type];
              const statusCfg = statusConfig[bonus.status];
              const Icon = config.icon;
              const isExpanded = expandedBonus === bonus.id;

              return (
                <div
                  key={bonus.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div 
                        className={cn("p-2 rounded-full bg-gray-100 dark:bg-gray-800", config.color)}
                        data-testid={`icon-${bonus.bonus_type.split('_')[0]}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {config.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatBonusDescription(bonus)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {formatDate(bonus.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          ${bonus.amount}
                        </p>
                        {bonus.metadata?.baseAmount && bonus.metadata.baseAmount !== bonus.amount && (
                          <p className="text-xs text-gray-500">
                            (base: ${bonus.metadata.baseAmount})
                          </p>
                        )}
                      </div>
                      
                      <span 
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded",
                          statusCfg.bgColor,
                          statusCfg.color
                        )}
                        data-testid={`status-${bonus.status}`}
                      >
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {bonus.metadata && Object.keys(bonus.metadata).length > 0 && (
                    <div className="mt-3">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpandedBonus(isExpanded ? null : (bonus.id || null))}
                        className="flex items-center gap-1 text-sm"
                      >
                        View Details
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                      
                      {isExpanded && (
                        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                          {bonus.bonus_type === 'student_retention' && (
                            <>
                              <p>Months retained: {bonus.metadata.monthsRetained}</p>
                              <p>Bonus months: {bonus.metadata.bonusMonths}</p>
                              <p>Rate: $10/month</p>
                            </>
                          )}
                          {bonus.metadata.tierMultiplier && (
                            <p className="text-green-600 dark:text-green-400 mt-2">
                              Tier bonus applied: +{((bonus.metadata.tierMultiplier - 1) * 100).toFixed(0)}%
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}


      </Card>
    </div>
  );
}

export default BonusTracker; 