# Rate Adjustment System Implementation Documentation

## Overview

The Rate Adjustment System allows tutors to manage their hourly rates with automatic tier-based adjustments and custom modifications. The system integrates with the tier system to provide automatic rate increases as tutors progress through tiers.

## Implementation Details

### 1. Core Components

#### RateAdjustmentService (`lib/gamification/RateAdjustmentService.ts`)
Core service managing all rate-related operations:
- **Rate Retrieval**: Get current rate with all adjustments
- **Base Rate Updates**: Modify the base hourly rate
- **Tier Adjustments**: Automatic percentage increases per tier
- **Custom Adjustments**: Manual rate modifications
- **History Tracking**: Complete audit trail of rate changes
- **Rate Comparison**: Compare to tier averages

#### Key Features:
- **Rate Limits**: $20-$200 per hour base rate
- **Custom Adjustment Range**: -20% to +50%
- **Tier Percentages**:
  - Standard: 0%
  - Silver: +5%
  - Gold: +10%
  - Elite: +15%

### 2. Database Schema

#### tutor_rates table
```sql
CREATE TABLE tutor_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES profiles(id) NOT NULL,
  base_rate decimal(10,2) NOT NULL,
  current_rate decimal(10,2) NOT NULL,
  tier_adjustment decimal(10,2) DEFAULT 0,
  custom_adjustment decimal(5,2) DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  UNIQUE(tutor_id)
);
```

#### rate_history table
```sql
CREATE TABLE rate_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id uuid REFERENCES profiles(id) NOT NULL,
  old_rate decimal(10,2) NOT NULL,
  new_rate decimal(10,2) NOT NULL,
  change_type varchar(50) NOT NULL,
  change_reason text,
  created_at timestamptz DEFAULT now()
);
```

### 3. API Endpoints

#### GET `/api/rates`
Fetches current rate information for the authenticated tutor.

```typescript
// Response
{
  rate: {
    baseRate: number,
    currentRate: number,
    tierAdjustment: number,
    customAdjustment: number,
    effectiveRate: number,
    lastUpdated: string | null
  },
  history: RateHistory[],
  tier: TutorTier
}
```

#### PUT `/api/rates`
Updates base rate or applies custom adjustment.

```typescript
// Request
{
  baseRate?: number,        // New base rate ($20-$200)
  customAdjustment?: number // Percentage adjustment (-20 to +50)
}

// Response
{
  rate: TutorRate
}
```

#### POST `/api/rates/compare`
Gets rate comparison data for the tutor's tier.

```typescript
// Response
{
  comparison: {
    tutorRate: number,
    tierAverage: number,
    percentileDifference: number,
    position: 'above_average' | 'below_average' | 'at_average'
  }
}
```

### 4. User Interface

#### RateAdjustment Component (`components/gamification/RateAdjustment.tsx`)
Comprehensive UI for rate management:
- **Rate Cards**: Display base, tier adjustment, and current rate
- **Base Rate Editor**: Inline editing with validation
- **Custom Adjustment Slider**: Visual adjustment control
- **Rate Breakdown**: Detailed calculation display
- **Tier Comparison**: Shows position relative to peers
- **Change History**: Complete audit trail
- **Promotion Banner**: Celebrates tier advancements

#### useRateAdjustment Hook (`lib/hooks/useRateAdjustment.ts`)
React hook managing rate data and operations:
- Fetches rate data and history
- Handles rate updates
- Manages loading and error states
- Detects recent promotions
- Provides refetch capability

### 5. Rate Calculation

#### Effective Rate Formula
```
Effective Rate = Base Rate + Tier Adjustment + Custom Adjustment

Where:
- Tier Adjustment = Base Rate × Tier Percentage
- Custom Adjustment = Base Rate × Custom Percentage
```

#### Example Calculation
```
Base Rate: $50/hour
Tier: Gold (+10%)
Custom: +5%

Tier Adjustment = $50 × 0.10 = $5
Custom Adjustment = $50 × 0.05 = $2.50
Effective Rate = $50 + $5 + $2.50 = $57.50/hour
```

### 6. Integration Points

#### Tier System Integration
- Automatic rate adjustments on tier promotion
- Rate recalculation when tier changes
- Tier benefits display in UI

#### Dashboard Integration
- Rate summary card in earnings page
- Quick access to rate management
- Current rate display

#### Session/Invoice Integration
- Effective rate used for session pricing
- Rate at time of session preserved
- Historical rate tracking

### 7. Security & Validation

#### Authentication
- Tutor-only access to rate endpoints
- User can only modify their own rates
- Admin access for system-wide views

#### Validation Rules
- Base rate must be $20-$200
- Custom adjustment -20% to +50%
- Rate changes logged with user ID
- Prevents invalid rate combinations

### 8. User Experience

#### Rate Management Flow
1. Tutor navigates to `/rates` or earnings page
2. Views current rate breakdown
3. Can edit base rate or apply custom adjustment
4. Changes take effect immediately
5. History tracks all modifications

#### Visual Feedback
- Real-time rate preview during adjustments
- Clear breakdown of all components
- Comparison to tier average
- Success/error notifications

### 9. Testing Strategy

#### Unit Tests
- Rate calculation accuracy
- Validation boundaries
- History recording
- Tier adjustment logic

#### Integration Tests
- API endpoint functionality
- Authentication/authorization
- Database operations
- Service integration

#### UI Tests
- Component rendering
- User interactions
- Form validation
- Error handling

### 10. Performance Considerations

#### Optimizations
- Rate data cached in component state
- Debounced API calls for adjustments
- Minimal database queries
- Efficient rate calculations

#### Scalability
- Indexed database queries
- Paginated history retrieval
- Optimized comparison queries
- Lightweight API responses

## Usage Examples

### Updating Base Rate
```typescript
const rateService = new RateAdjustmentService();
const newRate = await rateService.updateBaseRate('tutor-123', 60);
// Returns updated rate with recalculated adjustments
```

### Applying Custom Adjustment
```typescript
const adjustedRate = await rateService.applyCustomAdjustment('tutor-123', 15);
// Applies 15% increase on top of base and tier rates
```

### Getting Rate Comparison
```typescript
const comparison = await rateService.getRateComparison('tutor-123');
// Returns position relative to tier average
```

## Future Enhancements

1. **Market-Based Adjustments**
   - Regional rate recommendations
   - Subject-specific rate guidance
   - Demand-based pricing suggestions

2. **Advanced Analytics**
   - Rate optimization recommendations
   - Historical rate performance
   - Competitive analysis tools

3. **Automated Adjustments**
   - Performance-based rate increases
   - Market condition responses
   - Seasonal rate modifications

4. **Student Visibility**
   - Rate transparency options
   - Discount management
   - Package pricing

## Troubleshooting

### Common Issues

1. **Rate Not Updating**
   - Verify authentication
   - Check rate limits
   - Ensure valid adjustment range

2. **History Not Recording**
   - Check database permissions
   - Verify rate_history table exists
   - Ensure proper error handling

3. **Tier Adjustment Incorrect**
   - Verify tutor_tiers data
   - Check tier calculation logic
   - Ensure tier is properly set

### Debug Queries

```sql
-- Check current rate
SELECT * FROM tutor_rates WHERE tutor_id = 'TUTOR_ID';

-- View rate history
SELECT * FROM rate_history 
WHERE tutor_id = 'TUTOR_ID' 
ORDER BY created_at DESC;

-- Verify tier
SELECT current_tier FROM tutor_tiers 
WHERE tutor_id = 'TUTOR_ID';
``` 