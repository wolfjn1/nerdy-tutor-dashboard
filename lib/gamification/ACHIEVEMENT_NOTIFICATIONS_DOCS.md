# Achievement Notifications System Documentation

## Overview
This document describes the achievement notification system implemented in Phase 3 Task 3.4. The system provides real-time notifications for all gamification achievements including points, milestones, streaks, bonuses, level-ups, and tier promotions.

## Architecture

### Core Components

#### 1. AchievementManager Service
**Location**: `/lib/gamification/AchievementManager.ts`

Central service for creating and managing achievement notifications:
- Subscribes to achievement events
- Creates appropriate notifications based on achievement type
- Manages notification queue
- Integrates with other gamification services

#### 2. Achievement Toast Component
**Location**: `/components/gamification/AchievementToast.tsx`

The primary notification UI component:
- **Features**:
  - 6 achievement types with unique icons and colors
  - Auto-dismiss with visual countdown
  - Manual dismiss option
  - Points display when applicable
  - Smooth animations
  - Customizable position and duration

**Achievement Types**:
- `points`: Green gradient - for points earned
- `milestone`: Purple/pink gradient - for milestones reached  
- `streak`: Orange/red gradient - for maintaining streaks
- `bonus`: Yellow/amber gradient - for monetary bonuses
- `level_up`: Blue/indigo gradient - for level progression
- `tier_promotion`: Purple/pink gradient - for tier advancement

#### 3. Achievement Notification Container
**Location**: `/components/gamification/AchievementNotificationContainer.tsx`

Container that manages multiple notifications:
- **Features**:
  - Stacked notification preview
  - Queue management
  - Badge and achievement coordination
  - Pending notification indicator
  - Visual queue with "+X more" indicator

#### 4. Achievement Notifications Hook
**Location**: `/lib/hooks/useAchievementNotifications.ts`

React hook for managing achievement state:
- Real-time achievement listening
- Queue management (max 5 by default)
- Manual achievement creation
- Integration with Supabase real-time

## Integration Points

### 1. Points System Integration
Updated `/lib/gamification/PointsTriggers.ts`:
```typescript
// After awarding points, check for achievements
await this.achievementManager.checkAchievements(tutorId, 'session_completed', {
  totalSessions: count,
  currentStreak: await this.calculateStreak(tutorId)
});
```

### 2. Real-time Updates
Listens to Supabase real-time channels:
- `gamification_points` - for point achievements
- `tutor_bonuses` - for bonus notifications
- `tutor_tiers` - for tier promotions

### 3. Manual Achievement Triggers
```typescript
const { showMilestoneAchievement, showStreakAchievement } = useAchievementNotifications(tutorId);

// Trigger custom achievements
await showMilestoneAchievement('sessions', 100);
await showStreakAchievement(30);
```

## Usage Guide

### Basic Setup in Dashboard/Layout
```typescript
import { AchievementNotificationContainer } from '@/components/gamification';

function DashboardLayout({ children, tutorId }) {
  return (
    <>
      {/* Achievement notifications */}
      <AchievementNotificationContainer 
        tutorId={tutorId}
        position="bottom-right"
        maxVisible={3}
        showBadges={true}
        showAchievements={true}
        achievementDuration={5000}
      />
      
      {/* Rest of your layout */}
      {children}
    </>
  );
}
```

### Advanced Usage with Hook
```typescript
import { useAchievementNotifications } from '@/lib/hooks';

function MyComponent({ tutorId }) {
  const {
    currentAchievement,
    achievementQueue,
    showCustomAchievement,
    checkForAchievements
  } = useAchievementNotifications(tutorId);

  // Show custom achievement
  const handleSpecialEvent = () => {
    showCustomAchievement({
      id: 'custom-1',
      type: 'milestone',
      title: 'Special Achievement!',
      description: 'You did something amazing!',
      points: 100
    });
  };

  // Check for achievements after an event
  const handleSessionComplete = async () => {
    await checkForAchievements('session_completed', {
      totalSessions: 50,
      currentStreak: 7
    });
  };
}
```

## Achievement Types Reference

### Points Achievements
- Triggered when points are earned
- Shows point value and reason
- Green color scheme
- 5-second duration

### Milestone Achievements
- Session milestones: 10, 25, 50, 100, 250, 500, 1000
- Point milestones: 100, 500, 1K, 5K, 10K, 25K, 50K, 100K
- Student milestones: 10, 25, 50, 100 students helped
- Purple/pink color scheme

### Streak Achievements
- Every 7 days of consecutive tutoring
- Orange/red color scheme
- Encourages consistency

### Bonus Achievements
- Student retention bonus
- Session milestone bonus
- Quality review bonus
- Referral bonus
- Yellow/amber color scheme
- Shows dollar amount

### Level Up Achievements
- Beginner → Proficient (501 points)
- Proficient → Advanced (2,001 points)
- Advanced → Expert (5,001 points)
- Expert → Master (10,001 points)
- Blue/indigo color scheme

### Tier Promotion Achievements
- Standard → Silver
- Silver → Gold
- Gold → Elite
- Shows benefits of new tier
- Purple color scheme

## Configuration Options

### AchievementNotificationContainer Props
```typescript
interface Props {
  tutorId: string;
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  maxVisible?: number;        // Max notifications shown in stack (default: 3)
  showBadges?: boolean;       // Show badge notifications (default: true)
  showAchievements?: boolean; // Show achievement toasts (default: true)
  achievementDuration?: number; // Duration in ms (default: 5000)
}
```

### useAchievementNotifications Options
```typescript
interface Options {
  maxQueueSize?: number;           // Max queue size (default: 5)
  showBadgeNotifications?: boolean; // Include badges (default: false)
  showPointNotifications?: boolean; // Show point notifications (default: true)
  showBonusNotifications?: boolean; // Show bonus notifications (default: true)
}
```

## Testing

### Test Achievement Notifications
```bash
# Trigger point achievement
curl -X POST http://localhost:3000/api/gamification/award-points \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"tutorId": "test-tutor-id", "reason": "sessionCompletion", "points": 10}'

# Complete a session (triggers multiple checks)
curl -X POST http://localhost:3000/api/gamification/session-completed \
  -H "Content-Type: application/json" \
  -H "Cookie: [auth-cookie]" \
  -d '{"sessionId": "session-id", "tutorId": "tutor-id"}'
```

### Test Queue Management
1. Trigger multiple achievements rapidly
2. Observe stacking behavior
3. Check "+X more" indicator
4. Verify queue processing order

### Create Test Achievements
```javascript
// In browser console with achievement hook
showCustomAchievement({
  id: 'test-1',
  type: 'milestone',
  title: '100 Sessions!',
  description: 'You completed 100 tutoring sessions!',
  points: 50
});

// Test different types
['points', 'milestone', 'streak', 'bonus', 'level_up', 'tier_promotion'].forEach((type, i) => {
  setTimeout(() => {
    showCustomAchievement({
      id: `test-${i}`,
      type,
      title: `Test ${type}`,
      description: `Testing ${type} achievement`,
      points: type === 'points' ? 25 : undefined
    });
  }, i * 1000);
});
```

## Performance Considerations

1. **Queue Management**: Limited to 5 achievements by default
2. **Animation Performance**: Uses Framer Motion for optimized animations
3. **Real-time Subscriptions**: Single subscription per table
4. **Auto-dismiss**: Prevents notification buildup

## Styling & Customization

### Custom Icons
```typescript
showCustomAchievement({
  id: 'custom',
  type: 'milestone',
  title: 'Custom Achievement',
  description: 'With custom icon',
  icon: <CustomIcon className="w-6 h-6" />
});
```

### Position Examples
- `top-right`: Good for desktop apps
- `bottom-right`: Standard for web apps (default)
- `top-center`: Prominent notifications
- `bottom-center`: Mobile-friendly

## Future Enhancements

1. **Sound Effects**: Add optional sound notifications
2. **Persistence**: Save achievement history
3. **Sharing**: Social media integration
4. **Analytics**: Track notification engagement
5. **Themes**: Custom color schemes per user
6. **Grouping**: Combine similar achievements

---

*Last Updated: January 2025*
*Phase 3 Task 3.4 Complete* 