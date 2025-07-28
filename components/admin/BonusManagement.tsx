'use client';

import React, { useState } from 'react';
import { Card, Button, Badge, Modal } from '@/components/ui';
import {
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Eye,
  AlertCircle,
  TrendingUp,
  Calendar,
  RefreshCw,
  Users,
  Trophy,
  Star,
} from 'lucide-react';
import { useBonusManagement, BonusData } from '@/lib/hooks';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';
import { BonusType, BonusStatus } from '@/lib/gamification/BonusCalculator';

const bonusTypeConfig: Record<BonusType, { label: string; icon: any; color: string }> = {
  student_retention: { label: 'Student Retention', icon: Users, color: 'text-blue-600' },
  session_milestone: { label: 'Session Milestone', icon: Trophy, color: 'text-purple-600' },
  five_star_review: { label: '5-Star Review', icon: Star, color: 'text-yellow-600' },
  student_referral: { label: 'Referral Bonus', icon: TrendingUp, color: 'text-green-600' },
};

const statusConfig: Record<BonusStatus, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Pending', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  approved: { label: 'Approved', color: 'text-green-700', bgColor: 'bg-green-100' },
  paid: { label: 'Paid', color: 'text-blue-700', bgColor: 'bg-blue-100' },
  cancelled: { label: 'Cancelled', color: 'text-gray-700', bgColor: 'bg-gray-100' },
};

const tierConfig = {
  standard: { label: 'Standard', color: 'text-gray-600', multiplier: 0 },
  silver: { label: 'Silver', color: 'text-gray-400', multiplier: 10 },
  gold: { label: 'Gold', color: 'text-yellow-600', multiplier: 20 },
  elite: { label: 'Elite', color: 'text-purple-600', multiplier: 50 },
};

export function BonusManagement() {
  const {
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
    refetch,
  } = useBonusManagement();

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<BonusData | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectingBonusId, setRejectingBonusId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const handleViewDetails = (bonus: any) => {
    setSelectedBonus(bonus);
    setShowDetailsModal(true);
  };

  const handleReject = (bonusId: string) => {
    setRejectingBonusId(bonusId);
    setShowRejectModal(true);
  };

  const confirmReject = async () => {
    if (rejectingBonusId && rejectionReason) {
      await rejectBonus(rejectingBonusId, rejectionReason);
      setShowRejectModal(false);
      setRejectingBonusId(null);
      setRejectionReason('');
    }
  };

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
        return `Referred ${metadata?.referredStudentName || 'student'}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="bonus-management-skeleton">
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
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between">
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

  const pendingBonuses = bonuses.filter((b: BonusData) => b.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Bonus Management
        </h1>
        <Button
          onClick={refetch}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.pendingTotal.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.pendingCount} {stats.pendingCount === 1 ? 'bonus' : 'bonuses'}
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
                  ${stats.approvedTotal.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">
                  {stats.approvedCount} {stats.approvedCount === 1 ? 'bonus' : 'bonuses'}
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
                  ${stats.thisMonthTotal.toFixed(2)}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Last Month</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${stats.lastMonthTotal.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </Card>
        </div>
      )}

      {/* Filters and Actions */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by tutor name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          {/* Status Filter */}
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

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Sort by"
          >
            <option value="date">Sort by Date</option>
            <option value="amount">Sort by Amount</option>
          </select>

          {/* Bulk Actions */}
          {selectedBonuses.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="gradient"
                gradientType="nerdy"
                size="sm"
                onClick={() => approveBulk(selectedBonuses)}
              >
                Approve Selected ({selectedBonuses.length})
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={clearSelection}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Select All for Pending */}
        {filter === 'pending' && pendingBonuses.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedBonuses.length === pendingBonuses.length}
              onChange={selectAll}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Select all pending bonuses
            </span>
          </div>
        )}
      </Card>

      {/* Bonus List */}
      <Card className="p-6">
        {bonuses.length === 0 ? (
          <div className="text-center py-12">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-900 dark:text-white">
              No bonuses found
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Try adjusting your filters or search terms
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {bonuses.map((bonus: BonusData) => {
              const config = bonusTypeConfig[bonus.bonus_type as BonusType];
              const statusCfg = statusConfig[bonus.status as BonusStatus];
              const Icon = config.icon;
              const tierCfg = tierConfig[bonus.tutor_tier as keyof typeof tierConfig];

              return (
                <div
                  key={bonus.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    {/* Checkbox for pending bonuses */}
                    {bonus.status === 'pending' && (
                      <input
                        type="checkbox"
                        checked={selectedBonuses.includes(bonus.id)}
                        onChange={() => toggleBonusSelection(bonus.id)}
                        className="mt-1 mr-3 w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                    )}

                    <div className="flex-1">
                      {/* Tutor Info */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {bonus.tutor_name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {bonus.tutor_email}
                          </p>
                          {tierCfg && (
                            <div className="flex items-center gap-2 mt-1">
                              <Badge 
                                variant="secondary" 
                                size="sm"
                                className={cn("bg-gray-100 dark:bg-gray-700", tierCfg.color)}
                              >
                                {tierCfg.label}
                              </Badge>
                              {tierCfg.multiplier > 0 && (
                                <span className="text-xs text-green-600 dark:text-green-400">
                                  +{tierCfg.multiplier}%
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <span 
                          className={cn(
                            "px-2 py-1 text-xs font-medium rounded",
                            statusCfg.bgColor,
                            statusCfg.color
                          )}
                        >
                          {statusCfg.label}
                        </span>
                      </div>

                      {/* Bonus Details */}
                      <div className="flex items-start gap-3">
                        <div 
                          className={cn("p-2 rounded-full bg-gray-100 dark:bg-gray-800", config.color)}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {config.label}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatBonusDescription(bonus)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(bonus.created_at), { addSuffix: true })}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            ${bonus.amount.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(bonus)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      View Details
                    </Button>
                    
                    {bonus.status === 'pending' && (
                      <>
                        <Button
                          variant="gradient"
                          gradientType="nerdy"
                          size="sm"
                          onClick={() => approveBonus(bonus.id)}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReject(bonus.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Bonus Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Bonus Details"
        size="lg"
      >
        {selectedBonus && (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedBonus.tutor_name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedBonus.tutor_email}
                </p>
              </div>
              <Badge 
                variant="secondary" 
                size="lg" 
                className={cn(
                  statusConfig[selectedBonus.status as BonusStatus].bgColor,
                  statusConfig[selectedBonus.status as BonusStatus].color
                )}
              >
                {statusConfig[selectedBonus.status as BonusStatus].label}
              </Badge>
            </div>

            {/* Bonus Info */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {bonusTypeConfig[selectedBonus.bonus_type as BonusType].label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${selectedBonus.amount.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Created:</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {new Date(selectedBonus.created_at).toLocaleDateString()}
                </span>
              </div>
              {selectedBonus.approved_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Approved:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedBonus.approved_at).toLocaleDateString()}
                  </span>
                </div>
              )}
              {selectedBonus.paid_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Paid:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {new Date(selectedBonus.paid_at).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Metadata */}
            {selectedBonus.metadata && Object.keys(selectedBonus.metadata).length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 dark:text-white">Additional Details</h4>
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-2">
                  {Object.entries(selectedBonus.metadata).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {key.split(/(?=[A-Z])/).map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}:
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reference */}
            {selectedBonus.reference_id && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Reference ID: {selectedBonus.reference_id}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectingBonusId(null);
          setRejectionReason('');
        }}
        title="Reject Bonus"
        description="Please provide a reason for rejecting this bonus."
      >
        <div className="space-y-4">
          <textarea
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Enter rejection reason..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
          />
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setRejectingBonusId(null);
                setRejectionReason('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={confirmReject}
              disabled={!rejectionReason}
              className="bg-red-600 hover:bg-red-700"
            >
              Confirm Rejection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BonusManagement; 