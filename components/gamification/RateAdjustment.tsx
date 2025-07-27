'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Badge } from '@/components/ui';
import {
  DollarSign,
  TrendingUp,
  Edit2,
  Check,
  X,
  AlertCircle,
  Award,
  Info,
  Clock,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react';
import { useRateAdjustment } from '@/lib/hooks/useRateAdjustment';
import { cn } from '@/lib/utils/cn';
import { formatDistanceToNow } from 'date-fns';

const tierConfig = {
  standard: { label: 'Standard', color: 'text-gray-600', bgColor: 'bg-gray-100', percentage: 0 },
  silver: { label: 'Silver', color: 'text-gray-400', bgColor: 'bg-gray-200', percentage: 5 },
  gold: { label: 'Gold', color: 'text-yellow-600', bgColor: 'bg-yellow-100', percentage: 10 },
  elite: { label: 'Elite', color: 'text-purple-600', bgColor: 'bg-purple-100', percentage: 15 },
};

export function RateAdjustment() {
  const {
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
    refetch,
  } = useRateAdjustment();

  const [isEditingBase, setIsEditingBase] = useState(false);
  const [newBaseRate, setNewBaseRate] = useState('');
  const [baseRateError, setBaseRateError] = useState('');
  const [customAdjustmentValue, setCustomAdjustmentValue] = useState(0);
  const [showHistory, setShowHistory] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(true);

  useEffect(() => {
    if (rate) {
      setNewBaseRate(rate.baseRate.toString());
      setCustomAdjustmentValue(rate.customAdjustment);
    }
  }, [rate]);

  const validateBaseRate = (value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setBaseRateError('Please enter a valid number');
      return false;
    }
    if (numValue < 20 || numValue > 200) {
      setBaseRateError('Rate must be between $20 and $200');
      return false;
    }
    setBaseRateError('');
    return true;
  };

  const handleBaseRateUpdate = async () => {
    if (!validateBaseRate(newBaseRate)) return;
    
    try {
      await updateBaseRate(parseFloat(newBaseRate));
      setIsEditingBase(false);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const handleCustomAdjustment = async () => {
    try {
      await applyCustomAdjustment(customAdjustmentValue);
    } catch (error) {
      // Error is handled in the hook
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6" data-testid="rate-adjustment-skeleton">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
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

  if (!rate) return null;

  const tierCfg = tierConfig[tier];
  const tierAmount = rate.baseRate * (tierCfg.percentage / 100);
  const customAmount = rate.baseRate * (rate.customAdjustment / 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <DollarSign className="w-6 h-6 text-purple-600" />
          Rate Management
        </h2>
        <Badge
          variant="secondary"
          size="lg"
          className={cn(tierCfg.bgColor, tierCfg.color)}
        >
          <Award className="w-4 h-4 mr-1" />
          {tierCfg.label}
        </Badge>
      </div>

      {/* Promotion Banner */}
      {recentPromotion && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white dark:bg-gray-800 rounded-full">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-white">
                Congratulations on reaching {tierCfg.label} tier!
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Your rate has been automatically adjusted to reflect your {tierCfg.percentage}% tier bonus.
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Rate Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Base Rate */}
        <Card className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Base Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(rate.baseRate)}
              </p>
              <p className="text-xs text-gray-500 mt-1">per hour</p>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditingBase(true)}
              disabled={isEditingBase || isUpdating}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
          </div>
        </Card>

        {/* Tier Adjustment */}
        <Card className="p-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Tier Adjustment</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              +{tierCfg.percentage}%
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {formatCurrency(tierAmount)} bonus
            </p>
          </div>
        </Card>

        {/* Current Rate */}
        <Card className="p-4 border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-900/20">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Current Rate</p>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {formatCurrency(rate.currentRate)}
            </p>
            <p className="text-xs text-gray-500 mt-1">effective rate</p>
          </div>
        </Card>
      </div>

      {/* Edit Base Rate Modal */}
      {isEditingBase && (
        <Card className="p-4 border-purple-200 dark:border-purple-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
            Update Base Rate
          </h3>
          <div className="space-y-3">
            <div>
              <label
                htmlFor="baseRate"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                New Base Rate (per hour)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                  $
                </span>
                <input
                  id="baseRate"
                  type="number"
                  step="0.01"
                  min="20"
                  max="200"
                  value={newBaseRate}
                  onChange={(e) => {
                    setNewBaseRate(e.target.value);
                    validateBaseRate(e.target.value);
                  }}
                  className={cn(
                    "w-full pl-8 pr-3 py-2 border rounded-lg",
                    "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100",
                    "focus:outline-none focus:ring-2 focus:ring-purple-500",
                    baseRateError
                      ? "border-red-300 dark:border-red-600"
                      : "border-gray-300 dark:border-gray-600"
                  )}
                />
              </div>
              {baseRateError && (
                <p className="text-sm text-red-600 mt-1">{baseRateError}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="gradient"
                gradientType="nerdy"
                onClick={handleBaseRateUpdate}
                disabled={!!baseRateError || isUpdating}
                className="flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditingBase(false);
                  setNewBaseRate(rate.baseRate.toString());
                  setBaseRateError('');
                }}
                disabled={isUpdating}
              >
                <X className="w-4 h-4" />
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Custom Adjustment */}
      <Card className="p-6">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          Custom Adjustment
        </h3>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Adjustment Percentage
              </label>
              <span className="text-lg font-semibold text-gray-900 dark:text-white">
                {customAdjustmentValue > 0 ? '+' : ''}{customAdjustmentValue}%
              </span>
            </div>
            <input
              type="range"
              min="-20"
              max="50"
              value={customAdjustmentValue}
              onChange={(e) => setCustomAdjustmentValue(parseInt(e.target.value))}
              disabled={isUpdating}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>-20%</span>
              <span>0%</span>
              <span>+50%</span>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              This adjustment will change your effective rate to{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(
                  rate.baseRate + tierAmount + (rate.baseRate * customAdjustmentValue / 100)
                )}
              </span>
            </p>
          </div>

          <Button
            variant="gradient"
            gradientType="nerdy"
            onClick={handleCustomAdjustment}
            disabled={customAdjustmentValue === rate.customAdjustment || isUpdating}
            className="w-full"
          >
            Apply Adjustment
          </Button>
        </div>
      </Card>

      {/* Rate Breakdown */}
      <Card className="p-6">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowBreakdown(!showBreakdown)}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white">
            Rate Breakdown
          </h3>
          {showBreakdown ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
        
        {showBreakdown && (
          <div className="mt-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Base Rate:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(rate.baseRate)}
              </span>
            </div>
            
            {tierAmount > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Tier Adjustment (+{tierCfg.percentage}%):
                </span>
                <span className="font-medium text-green-600 dark:text-green-400">
                  +{formatCurrency(tierAmount)}
                </span>
              </div>
            )}
            
            {rate.customAdjustment !== 0 && (
              <div className="flex justify-between items-center">
                <span className="text-gray-600 dark:text-gray-400">
                  Custom Adjustment ({rate.customAdjustment > 0 ? '+' : ''}{rate.customAdjustment}%):
                </span>
                <span className={cn(
                  "font-medium",
                  rate.customAdjustment > 0
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                )}>
                  {rate.customAdjustment > 0 ? '+' : ''}{formatCurrency(customAmount)}
                </span>
              </div>
            )}
            
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900 dark:text-white">
                  Effective Rate:
                </span>
                <span className="text-xl font-bold text-purple-600 dark:text-purple-400">
                  {formatCurrency(rate.currentRate)}
                </span>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Rate Comparison */}
      {comparison && (
        <Card className="p-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
            Rate Comparison
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Your Rate:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(comparison.tutorRate)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Tier Average:</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {formatCurrency(comparison.tierAverage)}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 dark:text-gray-400">Position:</span>
                <span className={cn(
                  "font-semibold",
                  comparison.position === 'above_average'
                    ? "text-green-600 dark:text-green-400"
                    : comparison.position === 'below_average'
                    ? "text-orange-600 dark:text-orange-400"
                    : "text-gray-600 dark:text-gray-400"
                )}>
                  {comparison.percentileDifference > 0 ? '+' : ''}
                  {comparison.percentileDifference.toFixed(2)}% {comparison.position.replace('_', ' ')}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Rate History */}
      <Card className="p-6">
        <div
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowHistory(!showHistory)}
        >
          <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Rate History
          </h3>
          {showHistory ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </div>
        
        {showHistory && (
          <div className="mt-4 space-y-3">
            {history.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No rate changes yet</p>
            ) : (
              history.map((change, index) => (
                <div
                  key={change.id || index}
                  className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                >
                  <div className={cn(
                    "p-2 rounded-full",
                    change.changeType === 'tier_promotion'
                      ? "bg-purple-100 dark:bg-purple-900/50"
                      : change.changeType === 'custom_adjustment'
                      ? "bg-blue-100 dark:bg-blue-900/50"
                      : "bg-gray-100 dark:bg-gray-700"
                  )}>
                    {change.changeType === 'tier_promotion' ? (
                      <Award className="w-4 h-4 text-purple-600" />
                    ) : change.changeType === 'custom_adjustment' ? (
                      <TrendingUp className="w-4 h-4 text-blue-600" />
                    ) : (
                      <Edit2 className="w-4 h-4 text-gray-600" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(change.oldRate)} → {formatCurrency(change.newRate)}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {change.changeReason}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(change.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </Card>

      {/* Information */}
      <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-sm text-gray-700 dark:text-gray-300">
            <p className="font-semibold mb-1">Rate Adjustment Guidelines</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Your {tierCfg.label} tier provides a {tierCfg.percentage}% rate increase</li>
              <li>Custom adjustments can range from -20% to +50%</li>
              <li>All rate changes are tracked in your history</li>
              <li>Your effective rate is what students see and pay</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default RateAdjustment; 