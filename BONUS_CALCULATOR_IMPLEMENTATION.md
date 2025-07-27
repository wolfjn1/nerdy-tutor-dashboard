# Monetary Bonus Calculator Implementation Documentation

## Overview

The Monetary Bonus Calculator provides independent contractor tutors with performance-based bonuses across four categories:
- **Student Retention**: $10/month after month 3
- **Session Milestones**: $25 per 5 sessions
- **Review Bonuses**: $5 per 5-star review
- **Referral Bonuses**: $50 per referred student (after 5 sessions)

## Implementation Details

### 1. Core Components

#### BonusCalculator Service (`lib/gamification/BonusCalculator.ts`)
- **calculateRetentionBonus()**: Calculates monthly retention bonuses
- **calculateMilestoneBonus()**: Awards session milestone bonuses
- **calculateReviewBonus()**: Rewards 5-star reviews
- **calculateReferralBonus()**: Handles referral program bonuses
- **recordBonus()**: Saves bonuses to database
- **approveBonus()**: Admin approval workflow
- **markBonusAsPaid()**: Payment processing
- **getBonusSummary()**: Aggregates bonus totals

#### Database Table: `tutor_bonuses`
```sql
CREATE TABLE tutor_bonuses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES profiles(id),
  bonus_type TEXT CHECK (bonus_type IN ('student_retention', 'session_milestone', 'five_star_review', 'student_referral')),
  amount DECIMAL(10,2),
  status TEXT CHECK (status IN ('pending', 'approved', 'paid', 'cancelled')),
  reference_id TEXT,
  reference_type TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  approved_at TIMESTAMP,
  paid_at TIMESTAMP,
  payment_reference TEXT
);
```

### 2. Bonus Types

#### Student Retention Bonus
- **Amount**: $10/month after month 3
- **Calculation**: (months_retained - 3) × $10
- **Duplicate Check**: Prevents multiple bonuses for same retention period
- **Metadata**: studentName, monthsRetained, bonusMonths

#### Session Milestone Bonus
- **Amount**: $25 per 5 completed sessions
- **Milestones**: 5, 10, 15, 20, 25... sessions
- **Progressive**: Only awards for new milestones
- **Metadata**: milestone number, total sessions

#### Review Bonus
- **Amount**: $5 per 5-star review
- **Requirement**: Rating must be exactly 5 stars
- **One-time**: Each review can only be bonused once
- **Metadata**: reviewId, rating

#### Referral Bonus
- **Amount**: $50 per successful referral
- **Requirement**: Referred student must complete 5+ sessions
- **One-time**: Each referral bonused once
- **Metadata**: referredStudentId, sessionsCompleted

### 3. Tier Multipliers

Bonuses are increased based on tutor tier:
- **Standard**: 1.0x (no multiplier)
- **Silver**: 1.1x (+10%)
- **Gold**: 1.2x (+20%)
- **Elite**: 1.5x (+50%)

Example: Elite tutor's $25 milestone bonus becomes $37.50

### 4. Workflow States

```
PENDING → APPROVED → PAID
    ↓        ↓
CANCELLED CANCELLED
```

- **Pending**: Automatically created when earned
- **Approved**: Admin reviews and approves
- **Paid**: Included in weekly payout
- **Cancelled**: Rejected or reversed

### 5. API Endpoints

#### POST `/api/bonuses/calculate`
Calculates and records a bonus based on type and parameters.

```typescript
// Request
{
  type: 'retention' | 'milestone' | 'review' | 'referral',
  // Type-specific parameters
  studentId?: string,
  monthsRetained?: number,
  completedSessions?: number,
  reviewId?: string,
  rating?: number,
  referredStudentId?: string,
  sessionsCompleted?: number
}

// Response
{
  bonus: {
    amount: number,
    type: string,
    isDuplicate?: boolean,
    metadata: object
  },
  recorded: boolean
}
```

#### GET `/api/bonuses/summary`
Returns bonus summary and recent bonuses for the authenticated tutor.

```typescript
// Response
{
  summary: {
    pendingTotal: number,
    pendingCount: number,
    approvedTotal: number,
    approvedCount: number,
    paidTotal: number,
    paidThisMonth: number,
    lifetimeEarnings: number
  },
  recentBonuses: Bonus[]
}
```

#### POST `/api/bonuses/approve`
Admin endpoint to approve pending bonuses.

```typescript
// Request
{
  bonusId: string
}

// Response
{
  bonus: Bonus
}
```

### 6. UI Components

#### BonusTracker Component
- **Summary Cards**: Display totals by status
- **Bonus History**: List with filtering by status
- **Expandable Details**: View bonus metadata
- **Status Badges**: Visual status indicators
- **Empty States**: Friendly messaging

#### Hook: useBonuses
- Fetches bonus data from API
- Provides loading/error states
- Auto-refreshes after calculations
- Manages UI state

### 7. Integration Points

1. **Session Completion**: Triggers milestone check
2. **Review Submission**: Checks for 5-star bonuses
3. **Monthly Cron**: Calculates retention bonuses
4. **Referral Tracking**: Monitors referred student progress
5. **Weekly Payouts**: Processes approved bonuses

## Testing

### Manual Testing
1. Run SQL script: `scripts/test-bonus-system.sql`
2. Visit `/bonuses` page to view UI
3. Test calculation via API or UI triggers

### Test Scenarios
- Retention bonus after 4+ months
- Multiple milestone achievements
- 5-star vs lower ratings
- Duplicate prevention
- Tier multiplier application

## Security Considerations

1. **Authorization**: Only tutors can view their own bonuses
2. **Admin Access**: Approval restricted to admin role
3. **Duplicate Prevention**: Database-level checks
4. **Audit Trail**: All state changes timestamped
5. **Amount Validation**: Prevents negative/invalid amounts

## Payment Processing

### Weekly Payout Schedule
- **Cutoff**: Thursday midnight
- **Processing**: Friday morning
- **Payment**: Friday afternoon
- **Status Update**: Automatic after payment

### Payout Requirements
- Bonus must be in 'approved' status
- Minimum payout threshold: $10
- Valid payment method on file

## Future Enhancements

1. **Automated Approval**: Rule-based auto-approval
2. **Bonus Notifications**: Real-time alerts
3. **Custom Bonus Types**: Special promotions
4. **Bonus History Export**: CSV/PDF reports
5. **Retroactive Calculations**: Back-dating bonuses
6. **Bonus Caps**: Maximum limits per period

## Troubleshooting

### Common Issues

1. **Bonus Not Appearing**
   - Check calculation parameters
   - Verify no duplicates exist
   - Confirm eligibility met

2. **Wrong Amount**
   - Verify tier multiplier
   - Check calculation logic
   - Review metadata

3. **Stuck in Pending**
   - Admin approval needed
   - Check approval queue
   - Verify admin access

### Debug Queries

```sql
-- Check tutor's bonuses
SELECT * FROM tutor_bonuses 
WHERE tutor_id = 'YOUR_ID' 
ORDER BY created_at DESC;

-- Summary by type
SELECT bonus_type, status, COUNT(*), SUM(amount) 
FROM tutor_bonuses 
WHERE tutor_id = 'YOUR_ID'
GROUP BY bonus_type, status;

-- This month's earnings
SELECT SUM(amount) 
FROM tutor_bonuses 
WHERE tutor_id = 'YOUR_ID' 
  AND status = 'paid'
  AND paid_at >= date_trunc('month', NOW());
``` 