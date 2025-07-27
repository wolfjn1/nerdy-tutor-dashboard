# Tier System Implementation Documentation

## Overview

The tier system rewards tutors for sustained excellence in teaching through a progression of tiers: Standard → Silver → Gold → Elite. Each tier offers increasing benefits, including base rate increases and platform privileges.

## Implementation Details

### 1. Core Components

#### TierSystem Service (`lib/gamification/TierSystem.ts`)
- **calculateTier()**: Determines eligible tier based on stats
- **getTutorStats()**: Fetches and calculates tutor performance metrics
- **promoteTier()**: Updates tier and awards associated rewards
- **checkAndPromote()**: Checks eligibility and promotes if qualified
- **getTierProgress()**: Returns detailed progress toward next tier

#### Database Tables
- `tutor_tiers`: Stores current tier and tier history
- `tutoring_sessions`: Source for session count data
- `session_reviews`: Source for rating data
- `gamification_points`: Awards points for tier promotions
- `tutor_badges`: Awards tier-specific badges

### 2. Tier Requirements

| Tier | Sessions | Average Rating | Retention Rate | Rate Increase |
|------|----------|----------------|----------------|---------------|
| Standard | 0 | 0 | 0% | 0% |
| Silver | 50+ | 4.5+ | 80%+ | 5% |
| Gold | 150+ | 4.7+ | 85%+ | 10% |
| Elite | 300+ | 4.8+ | 90%+ | 15% |

**Important**: All three criteria must be met for promotion. Tiers never go down.

### 3. Retention Rate Calculation

Retention is calculated as the percentage of students who have sessions spanning 3+ months:
```
retained_students / total_students * 100
```

### 4. UI Components

#### TierProgress Component (`components/gamification/TierProgress.tsx`)
- Displays current tier with visual badge
- Shows progress bars for each criterion
- Highlights met/unmet requirements
- Expandable benefits section
- Rate increase information
- Close-to-promotion notifications

### 5. API Endpoints

#### GET `/api/gamification/tier-check`
- Checks current tier eligibility
- Automatically promotes if qualified
- Returns promotion status and stats

#### POST `/api/gamification/tier-check`
- Returns detailed tier progress
- No promotion occurs

### 6. Integration Points

1. **Dashboard**: TierProgress widget shows current status
2. **Profile**: Tier badge displayed on tutor profile
3. **Session Pricing**: Rate adjustments applied automatically
4. **Gamification Center**: Full tier details and history

## Testing

### Unit Tests (`lib/gamification/TierSystem.test.ts`)
- Tier calculation logic
- Stats retrieval accuracy
- Promotion mechanics
- Rate adjustments
- Error handling

### Manual Testing
1. Use SQL script: `scripts/test-tier-system.sql`
2. Visit `/tiers` page to view tier status
3. Use "Check Tier" button to test promotion

### Test Scenarios
- New tutor starts at Standard
- Meeting all criteria triggers promotion
- Partial criteria met = no promotion
- Previous tier maintained if stats drop
- Rate increases apply correctly

## Rewards

### Points Awards
- Silver promotion: 200 points
- Gold promotion: 500 points  
- Elite promotion: 1000 points

### Badges
- `silver_tier`: Silver tier achievement
- `gold_tier`: Gold tier achievement
- `elite_tier`: Elite tier achievement

### Benefits by Tier
**Silver**:
- 5% base rate increase
- Priority in search results
- Silver badge on profile
- Advanced scheduling tools

**Gold**:
- 10% base rate increase
- Featured tutor badge
- Priority student matching
- Advanced analytics access

**Elite**:
- 15% base rate increase
- Specialized program access
- Quarterly performance bonuses
- Professional development
- Dedicated support team

## Future Enhancements

1. **Tier-specific features**: Unlock tools at each tier
2. **Seasonal tiers**: Limited-time achievement tiers
3. **Subject-specific tiers**: Excellence in specific subjects
4. **Fast-track programs**: Accelerated tier progression
5. **Tier maintenance bonuses**: Rewards for staying at high tiers

## Troubleshooting

### Common Issues

1. **Tier not updating**: Check if all criteria are met
2. **Stats incorrect**: Verify session status is 'completed'
3. **Retention rate 0**: Ensure students have 3+ month history
4. **Rate not adjusted**: Check `tutor_tiers` table entry

### Debug Queries

```sql
-- Check tutor stats
SELECT * FROM tutor_tiers WHERE tutor_id = 'YOUR_ID';

-- Verify session count
SELECT COUNT(*) FROM tutoring_sessions 
WHERE tutor_id = 'YOUR_ID' AND status = 'completed';

-- Check average rating
SELECT AVG(rating) FROM session_reviews 
WHERE tutor_id = 'YOUR_ID';
```

## Security Considerations

1. **Authorization**: Only tutors can check their own tier
2. **Rate limiting**: API endpoints protected against abuse
3. **Audit trail**: All tier changes logged with timestamps
4. **Data integrity**: Tier demotions prevented by design 