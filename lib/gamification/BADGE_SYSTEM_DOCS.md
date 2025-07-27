# Badge System Implementation Documentation

## Overview
This document describes the badge system implemented in Phase 3 Task 3.3. The system automatically awards badges based on tutor achievements and provides real-time notifications.

## Components Created

### 1. BadgeManager Service
**Location**: `/lib/gamification/BadgeManager.ts`

Handles automatic badge checking and awarding for:
- **Session Milestone**: 50, 100, 250, 500 sessions
- **Retention Star**: 10+ students for 3+ months
- **Five-Star Tutor**: 4.8+ rating with 20+ reviews
- **Quick Starter**: 10 sessions in first month
- **Student Champion**: 5+ students reached 20 sessions
- **Consistent Educator**: 95%+ completion rate
- **Elite Performer**: Reached elite tier
- **Marathon Tutor**: 100+ hours completed

### 2. API Endpoints

#### Check Badges
**Endpoint**: `POST /api/gamification/check-badges`
```json
{
  "tutorId": "uuid" // Optional, defaults to authenticated user
}
```

**Response**:
```json
{
  "success": true,
  "newBadges": ["session_milestone", "quick_starter"],
  "currentBadges": [...],
  "progress": {
    "session_milestone": 75,
    "retention_star": 60,
    "marathon_tutor": 45
  },
  "message": "Congratulations! You earned 2 new badge(s)!"
}
```

#### Get Badge Status
**Endpoint**: `GET /api/gamification/check-badges?tutorId=uuid`

Returns current badges and progress without checking for new ones.

### 3. UI Components

#### BadgeNotification
**Location**: `/components/gamification/BadgeNotification.tsx`

Features:
- Animated entrance/exit
- Auto-dismiss after 8 seconds
- Progress bar showing time remaining
- Particle celebration effects
- Badge tier colors (bronze/silver/gold/platinum)

#### BadgeShowcase (Updated)
Already displays earned badges in the achievements page with:
- Hover tooltips
- Lock icons for unearned badges
- Progress indicators

### 4. Hooks

#### useBadgeNotifications
**Location**: `/lib/hooks/useBadgeNotifications.ts`

Provides:
- Real-time badge notifications
- Badge queue management
- Manual badge checking
- Notification dismissal

## Integration Guide

### 1. Add Badge Notifications to Your App
```typescript
// In your main layout or dashboard
import { useBadgeNotifications } from '@/lib/hooks';
import { BadgeNotification } from '@/components/gamification';

function Dashboard({ tutorId }) {
  const { currentBadge, closeBadgeNotification } = useBadgeNotifications(tutorId);
  
  return (
    <>
      <BadgeNotification 
        badge={currentBadge} 
        onClose={closeBadgeNotification} 
      />
      {/* Your dashboard content */}
    </>
  );
}
```

### 2. Check Badges After Key Events
```typescript
// After session completion
await fetch('/api/gamification/session-completed', {
  method: 'POST',
  body: JSON.stringify({ sessionId, tutorId })
});

// Then check for new badges
await fetch('/api/gamification/check-badges', {
  method: 'POST',
  body: JSON.stringify({ tutorId })
});
```

### 3. Manual Badge Check
```typescript
const { checkForNewBadges } = useBadgeNotifications(tutorId);

// Check badges on demand
const handleCheckBadges = async () => {
  const result = await checkForNewBadges();
  if (result?.newBadges.length > 0) {
    console.log('New badges earned!', result.newBadges);
  }
};
```

## Badge Requirements

| Badge | Requirement | Check Method |
|-------|-------------|--------------|
| Session Milestone | 50, 100, 250, 500 sessions | Automatic on milestones |
| Retention Star | 10+ students for 3+ months | Monthly check |
| Five-Star Tutor | 4.8+ rating, 20+ reviews | After reviews |
| Quick Starter | 10 sessions in first month | Monthly check |
| Student Champion | 5 students with 20+ sessions | After sessions |
| Consistent Educator | 95%+ completion rate (50 sessions) | After sessions |
| Elite Performer | Reach elite tier | On tier promotion |
| Marathon Tutor | 100+ tutoring hours | After sessions |

## Testing

### Test Badge Awards
```bash
# Check badges for a tutor
curl -X POST http://localhost:3000/api/gamification/check-badges \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"tutorId": "test-tutor-id"}'
```

### Test Badge Progress
```bash
# Get current badge status
curl -X GET http://localhost:3000/api/gamification/check-badges?tutorId=test-tutor-id \
  -H "Cookie: [auth-cookie]"
```

### Test Notifications
1. Open the achievements page
2. Trigger a badge-earning event
3. See the notification appear in top-right
4. Watch the auto-dismiss countdown
5. Try manual dismiss with X button

### Create Test Data for Badges
```sql
-- Quick Starter Badge (10 sessions in first month)
INSERT INTO tutoring_sessions (tutor_id, student_id, status, session_date, duration_minutes)
SELECT 
  '[TUTOR_ID]',
  gen_random_uuid(),
  'completed',
  CURRENT_DATE - (i || ' days')::interval,
  60
FROM generate_series(1, 10) AS i;

-- Session Milestone Badge (50 sessions)
-- Run the above query 5 times with different student IDs

-- Marathon Tutor Badge (100+ hours)
UPDATE tutoring_sessions 
SET duration_minutes = 120 
WHERE tutor_id = '[TUTOR_ID]' 
LIMIT 50;
```

## Badge Showcase Integration

The BadgeShowcase component on the achievements page automatically:
- Displays all earned badges
- Shows locked badges with requirements
- Updates in real-time when new badges are earned
- Provides hover tooltips with details

## Security Considerations

1. **Authentication**: All endpoints require authenticated user
2. **Authorization**: Users can only check their own badges (except admins)
3. **Duplicate Prevention**: System prevents awarding same badge twice
4. **Rate Limiting**: Consider adding rate limits for badge checks

## Performance Optimization

1. **Badge Checking**: Only checks unearned badges
2. **Batch Operations**: Checks all badges in one pass
3. **Progress Caching**: Consider caching progress calculations
4. **Real-time Updates**: Uses efficient Supabase subscriptions

## Future Enhancements

1. **Custom Badge Icons**: Map specific icons to each badge type
2. **Badge Rarity**: Add rarity levels (common/rare/legendary)
3. **Badge Collections**: Group related badges
4. **Social Sharing**: Share badge achievements
5. **Badge Leaderboard**: Show badge collectors ranking

---

*Last Updated: January 2025*
*Phase 3 Task 3.3 Complete* 