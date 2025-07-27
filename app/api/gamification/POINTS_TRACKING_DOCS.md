# Points Tracking Implementation Documentation

## Overview
This document describes the points tracking system implemented in Phase 3 Task 3.2. The system automatically awards points for various tutor achievements and provides real-time updates.

## Components Created

### 1. PointsTriggers Service
**Location**: `/lib/gamification/PointsTriggers.ts`

Handles automatic point awards for:
- **Session Completion** (every 5 sessions): 25 points
- **First Session with Student**: 20 points
- **10 Session Milestone**: 100 points
- **Positive Reviews** (4-5 stars): 50 points
- **Student Retention** (monthly after 3 months): 50 points
- **High Attendance** (>90% monthly): 30 points
- **Referral Conversions**: 100 points

### 2. API Endpoints

#### Award Points
**Endpoint**: `POST /api/gamification/award-points`
```json
{
  "tutorId": "uuid",
  "reason": "positiveReview",
  "referenceId": "review-id",
  "metadata": {}
}
```

#### Session Completed
**Endpoint**: `POST /api/gamification/session-completed`
```json
{
  "sessionId": "uuid",
  "tutorId": "uuid"
}
```

#### Get Stats
**Endpoint**: `GET /api/gamification/stats/[tutorId]`
Returns comprehensive gamification statistics including:
- Total points and level
- Badges earned
- Current tier information
- Bonus summary
- Recent activity

### 3. Real-time Updates Hook
**Location**: `/lib/hooks/useGamificationRealtime.ts`

Provides real-time updates for:
- New points earned
- Badge achievements
- Tier promotions
- Bonus awards

## Usage Examples

### 1. Awarding Points for Session Completion
```typescript
// When a session is marked complete
const response = await fetch('/api/gamification/session-completed', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sessionId: 'session-123',
    tutorId: 'tutor-456'
  })
});
```

### 2. Manual Points Award
```typescript
// Award points for a specific achievement
const response = await fetch('/api/gamification/award-points', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    tutorId: 'tutor-456',
    reason: 'studentMilestone',
    referenceId: 'student-789'
  })
});
```

### 3. Using Real-time Updates
```typescript
import { useGamificationRealtime } from '@/lib/hooks/useGamificationRealtime';

function MyComponent({ tutorId }) {
  const { updates, isConnected } = useGamificationRealtime(tutorId);
  
  // Listen for updates
  useEffect(() => {
    updates.forEach(update => {
      if (update.type === 'points') {
        console.log('New points:', update.data.points);
      }
    });
  }, [updates]);
}
```

## Integration Points

### Session Management
When sessions are completed, call the session-completed endpoint:
```typescript
// In your session completion handler
await completeSession(sessionId);
await awardPointsForSession(sessionId, tutorId);
```

### Review System
After a review is submitted:
```typescript
// In your review submission handler
if (rating >= 4) {
  await awardPointsForReview(reviewId, tutorId, rating);
}
```

### Monthly Jobs
Set up scheduled jobs to:
1. Check student retention (monthly)
2. Calculate attendance rates (monthly)
3. Process tier promotions (weekly)

## Point Values Reference

| Achievement | Points | Trigger |
|------------|---------|---------|
| Session Completion (per 5) | 25 | Every 5th completed session |
| First Session | 20 | First session with new student |
| 10 Session Milestone | 100 | Student's 10th session |
| Positive Review | 50 | 4-5 star review |
| Monthly Retention | 50 | Per student after 3 months |
| High Attendance | 30 | >90% monthly rate |
| Referral Conversion | 100 | Referred student completes 5 sessions |
| Student Milestone | 75 | Student reaches learning goal |

## Testing

### Test Session Completion
```bash
curl -X POST http://localhost:3000/api/gamification/session-completed \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"sessionId": "test-session", "tutorId": "test-tutor"}'
```

### Test Points Display
1. Navigate to `/achievements`
2. Points should update in real-time
3. Recent transactions show in PointsDisplay

### Test Real-time Updates
1. Open two browser tabs
2. Award points in one tab
3. See updates appear in the other tab

## Security Considerations

1. **Authentication Required**: All endpoints require authenticated user
2. **Authorization**: Users can only award points to themselves (except admins)
3. **Validation**: All inputs are validated before processing
4. **Rate Limiting**: Consider adding rate limits for production

## Error Handling

All endpoints return standard error responses:
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (wrong user/role)
- `400`: Bad Request (missing fields)
- `404`: Not Found (invalid references)
- `500`: Server Error

## Future Enhancements

1. **Bulk Operations**: Award points to multiple tutors
2. **Point Adjustments**: Admin ability to adjust points
3. **Point Expiry**: Optional point expiration
4. **Leaderboard Caching**: Redis cache for performance
5. **Webhook Support**: Notify external systems

---

*Last Updated: January 2025*
*Phase 3 Task 3.2 Complete* 