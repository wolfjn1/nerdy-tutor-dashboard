import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TutorTier } from './TierSystem';

// Types
export interface TutorRate {
  baseRate: number;
  currentRate: number;
  tierAdjustment: number;
  customAdjustment: number;
  effectiveRate: number;
  lastUpdated: string | null;
}

export interface RateHistory {
  id?: string;
  tutorId?: string;
  oldRate: number;
  newRate: number;
  changeType: 'manual_adjustment' | 'tier_promotion' | 'custom_adjustment';
  changeReason: string;
  createdAt: string;
}

export interface RateComparison {
  tutorRate: number;
  tierAverage: number;
  percentileDifference: number;
  position: 'above_average' | 'below_average' | 'at_average';
}

// Constants
const MIN_BASE_RATE = 20;
const MAX_BASE_RATE = 200;
const DEFAULT_BASE_RATE = 40;
const MIN_CUSTOM_ADJUSTMENT = -20;
const MAX_CUSTOM_ADJUSTMENT = 50;

const TIER_PERCENTAGES: Record<TutorTier, number> = {
  standard: 0,
  silver: 5,
  gold: 10,
  elite: 15,
};

export class RateAdjustmentService {
  private supabase: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || createClientComponentClient();
  }

  /**
   * Get the current rate information for a tutor
   */
  async getCurrentRate(tutorId: string): Promise<TutorRate> {
    try {
      const { data, error } = await this.supabase
        .from('tutor_rates')
        .select('*')
        .eq('tutor_id', tutorId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        return {
          baseRate: DEFAULT_BASE_RATE,
          currentRate: DEFAULT_BASE_RATE,
          tierAdjustment: 0,
          customAdjustment: 0,
          effectiveRate: DEFAULT_BASE_RATE,
          lastUpdated: null,
        };
      }

      return {
        baseRate: data.base_rate,
        currentRate: data.current_rate,
        tierAdjustment: data.tier_adjustment || 0,
        customAdjustment: data.custom_adjustment || 0,
        effectiveRate: data.current_rate,
        lastUpdated: data.updated_at,
      };
    } catch (error) {
      console.error('Error getting current rate:', error);
      throw error;
    }
  }

  /**
   * Calculate tier adjustment percentage based on tier
   */
  calculateTierAdjustment(baseRate: number, tier: TutorTier): number {
    const percentage = TIER_PERCENTAGES[tier];
    return (baseRate * percentage) / 100;
  }

  /**
   * Update the base rate for a tutor
   */
  async updateBaseRate(tutorId: string, newBaseRate: number): Promise<TutorRate> {
    // Validate rate
    if (newBaseRate < MIN_BASE_RATE || newBaseRate > MAX_BASE_RATE) {
      throw new Error(`Base rate must be between $${MIN_BASE_RATE} and $${MAX_BASE_RATE} per hour`);
    }

    try {
      // Get current rate info
      const currentRateInfo = await this.getCurrentRate(tutorId);
      
      // Get tutor's tier
      const { data: tierData } = await this.supabase
        .from('tutor_tiers')
        .select('current_tier')
        .eq('tutor_id', tutorId)
        .single();

      const tier = tierData?.current_tier || 'standard';
      
      // Calculate new values
      const tierAdjustment = this.calculateTierAdjustment(newBaseRate, tier);
      const customAmount = (newBaseRate * currentRateInfo.customAdjustment) / 100;
      const newCurrentRate = newBaseRate + tierAdjustment + customAmount;

      // Update or insert rate
      const updateData = {
        tutor_id: tutorId,
        base_rate: newBaseRate,
        current_rate: newCurrentRate,
        tier_adjustment: tierAdjustment,
        custom_adjustment: currentRateInfo.customAdjustment,
        updated_at: new Date().toISOString(),
      };

      const { error } = currentRateInfo.lastUpdated
        ? await this.supabase
            .from('tutor_rates')
            .update(updateData)
            .eq('tutor_id', tutorId)
        : await this.supabase
            .from('tutor_rates')
            .insert(updateData);

      if (error) throw error;

      // Record history
      await this.recordRateChange(
        tutorId,
        currentRateInfo.currentRate,
        newCurrentRate,
        'manual_adjustment',
        'Base rate updated'
      );

      return {
        baseRate: newBaseRate,
        currentRate: newCurrentRate,
        tierAdjustment: tierAdjustment,
        customAdjustment: currentRateInfo.customAdjustment,
        effectiveRate: newCurrentRate,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error updating base rate:', error);
      throw error;
    }
  }

  /**
   * Apply a custom percentage adjustment
   */
  async applyCustomAdjustment(tutorId: string, adjustmentPercentage: number): Promise<TutorRate> {
    // Validate adjustment
    if (adjustmentPercentage < MIN_CUSTOM_ADJUSTMENT || adjustmentPercentage > MAX_CUSTOM_ADJUSTMENT) {
      throw new Error(`Custom adjustment must be between ${MIN_CUSTOM_ADJUSTMENT}% and ${MAX_CUSTOM_ADJUSTMENT}%`);
    }

    try {
      const currentRateInfo = await this.getCurrentRate(tutorId);
      
      // Calculate new rate with custom adjustment
      const baseAmount = currentRateInfo.baseRate;
      const tierAmount = currentRateInfo.tierAdjustment;
      const customAmount = (baseAmount * adjustmentPercentage) / 100;
      const newCurrentRate = baseAmount + tierAmount + customAmount;

      // Update rate
      const { error } = await this.supabase
        .from('tutor_rates')
        .update({
          current_rate: newCurrentRate,
          custom_adjustment: adjustmentPercentage,
          updated_at: new Date().toISOString(),
        })
        .eq('tutor_id', tutorId);

      if (error) throw error;

      // Record history
      await this.recordRateChange(
        tutorId,
        currentRateInfo.currentRate,
        newCurrentRate,
        'custom_adjustment',
        `Custom adjustment of ${adjustmentPercentage}% applied`
      );

      return {
        baseRate: currentRateInfo.baseRate,
        currentRate: newCurrentRate,
        tierAdjustment: currentRateInfo.tierAdjustment,
        customAdjustment: adjustmentPercentage,
        effectiveRate: newCurrentRate,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error applying custom adjustment:', error);
      throw error;
    }
  }

  /**
   * Apply tier promotion rate adjustment
   */
  async applyTierPromotion(
    tutorId: string,
    oldTier: TutorTier,
    newTier: TutorTier
  ): Promise<TutorRate | null> {
    if (oldTier === newTier) return null;

    try {
      const currentRateInfo = await this.getCurrentRate(tutorId);
      
      // Calculate new tier adjustment
      const newTierAdjustment = this.calculateTierAdjustment(currentRateInfo.baseRate, newTier);
      const customAmount = (currentRateInfo.baseRate * currentRateInfo.customAdjustment) / 100;
      const newCurrentRate = currentRateInfo.baseRate + newTierAdjustment + customAmount;

      // Update rate
      const { error } = await this.supabase
        .from('tutor_rates')
        .update({
          current_rate: newCurrentRate,
          tier_adjustment: newTierAdjustment,
          updated_at: new Date().toISOString(),
        })
        .eq('tutor_id', tutorId);

      if (error) throw error;

      // Record history
      await this.recordRateChange(
        tutorId,
        currentRateInfo.currentRate,
        newCurrentRate,
        'tier_promotion',
        `Promoted to ${newTier.charAt(0).toUpperCase() + newTier.slice(1)} tier`
      );

      return {
        baseRate: currentRateInfo.baseRate,
        currentRate: newCurrentRate,
        tierAdjustment: newTierAdjustment,
        customAdjustment: currentRateInfo.customAdjustment,
        effectiveRate: newCurrentRate,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error applying tier promotion:', error);
      throw error;
    }
  }

  /**
   * Get rate change history
   */
  async getRateHistory(tutorId: string, limit: number = 10): Promise<RateHistory[]> {
    try {
      const { data, error } = await this.supabase
        .from('rate_history')
        .select('*')
        .eq('tutor_id', tutorId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data?.map((record: any) => ({
        id: record.id,
        tutorId: record.tutor_id,
        oldRate: record.old_rate,
        newRate: record.new_rate,
        changeType: record.change_type,
        changeReason: record.change_reason,
        createdAt: record.created_at,
      })) || [];
    } catch (error) {
      console.error('Error getting rate history:', error);
      throw error;
    }
  }

  /**
   * Calculate effective rate with all adjustments
   */
  calculateEffectiveRate(params: {
    baseRate: number;
    tierAdjustment: number;
    customAdjustment: number;
  }): number {
    const { baseRate, tierAdjustment, customAdjustment } = params;
    const tierAmount = (baseRate * tierAdjustment) / 100;
    const customAmount = (baseRate * customAdjustment) / 100;
    const total = baseRate + tierAmount + customAmount;
    return Math.round(total * 100) / 100; // Round to cents
  }

  /**
   * Compare tutor's rate to tier average
   */
  async getRateComparison(tutorId: string): Promise<RateComparison> {
    try {
      // Get tutor's current rate
      const { data: rateData } = await this.supabase
        .from('tutor_rates')
        .select('current_rate')
        .eq('tutor_id', tutorId)
        .single();

      const tutorRate = rateData?.current_rate || DEFAULT_BASE_RATE;

      // Get tutor's tier
      const { data: tierData } = await this.supabase
        .from('tutor_tiers')
        .select('current_tier')
        .eq('tutor_id', tutorId)
        .single();

      const tier = tierData?.current_tier || 'standard';

      // Get all rates for the same tier
      const { data: tierRates } = await this.supabase
        .from('tutor_rates')
        .select('current_rate')
        .eq('tutor_tiers.current_tier', tier);

      const rates = tierRates?.map((r: any) => r.current_rate) || [];
      const tierAverage = rates.length > 0
        ? rates.reduce((sum: number, rate: number) => sum + rate, 0) / rates.length
        : tutorRate;

      const percentileDifference = ((tutorRate - tierAverage) / tierAverage) * 100;
      
      return {
        tutorRate,
        tierAverage: Math.round(tierAverage * 100) / 100,
        percentileDifference: Math.round(percentileDifference * 100) / 100,
        position: percentileDifference > 0.5 
          ? 'above_average' 
          : percentileDifference < -0.5 
            ? 'below_average' 
            : 'at_average',
      };
    } catch (error) {
      console.error('Error getting rate comparison:', error);
      throw error;
    }
  }

  /**
   * Record a rate change in history
   */
  private async recordRateChange(
    tutorId: string,
    oldRate: number,
    newRate: number,
    changeType: RateHistory['changeType'],
    changeReason: string
  ): Promise<void> {
    try {
      await this.supabase
        .from('rate_history')
        .insert({
          tutor_id: tutorId,
          old_rate: oldRate,
          new_rate: newRate,
          change_type: changeType,
          change_reason: changeReason,
          created_at: new Date().toISOString(),
        });
    } catch (error) {
      console.error('Error recording rate change:', error);
      // Don't throw - history is not critical
    }
  }
} 