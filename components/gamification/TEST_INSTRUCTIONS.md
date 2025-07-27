# Gamification Center Testing Instructions

## Overview
The Gamification Center provides a comprehensive view of a tutor's achievements, points, badges, tier progress, and monetary bonuses.

## Components Created

### 1. GamificationCenter
- Main container component
- Grid layout for all gamification features
- Location: `/app/(dashboard)/achievements`

### 2. PointsDisplay
- Shows total points and level
- Recent point transactions
- Level calculation based on points

### 3. TierProgress
- Current tier (Standard/Silver/Gold/Elite)
- Progress to next tier
- Requirements tracking

### 4. BadgeShowcase
- Earned badges display
- Available badges with requirements
- Hover tooltips for details

### 5. AchievementsFeed
- Recent achievements timeline
- Points earned per achievement
- Badge notifications

### 6. BonusTracker
- Pending/Approved/Paid bonuses
- Total earnings display
- Next payout date

## Testing Steps

### 1. Access the Gamification Center
```bash
# Navigate to achievements page
http://localhost:3000/achievements
```

### 2. Test with New User (No Data)
- Login with `onboarding.test@tutor.com`
- Should see:
  - 0 points, Beginner level
  - Standard tier
  - "Welcome Aboard" badge (if onboarding completed)
  - No bonuses
  - Empty achievements feed

### 3. Test with Existing User
- Login with existing tutor account
- Components should display any existing:
  - Points from previous activities
  - Tier status
  - Earned badges
  - Recent achievements

### 4. Create Test Data
To test with sample data, run these SQL queries:

```sql
-- Add sample points
INSERT INTO gamification_points (tutor_id, points, reason, created_at)
VALUES 
  ('[TUTOR_ID]', 100, 'onboarding_complete', NOW()),
  ('[TUTOR_ID]', 75, 'session_completed', NOW() - INTERVAL '1 day'),
  ('[TUTOR_ID]', 50, 'positive_review', NOW() - INTERVAL '2 days');

-- Add sample badges
INSERT INTO tutor_badges (tutor_id, badge_type, earned_at)
VALUES 
  ('[TUTOR_ID]', 'onboarding_complete', NOW()),
  ('[TUTOR_ID]', 'quick_starter', NOW() - INTERVAL '1 day');

-- Add sample tier data
INSERT INTO tutor_tiers (tutor_id, current_tier, total_sessions, average_rating, retention_rate)
VALUES ('[TUTOR_ID]', 'silver', 55, 4.6, 82.5);

-- Add sample bonuses
INSERT INTO tutor_bonuses (tutor_id, bonus_type, amount, status, created_at)
VALUES 
  ('[TUTOR_ID]', 'session_milestone', 25.00, 'pending', NOW()),
  ('[TUTOR_ID]', 'quality_bonus', 5.00, 'approved', NOW() - INTERVAL '1 day'),
  ('[TUTOR_ID]', 'student_retention', 10.00, 'paid', NOW() - INTERVAL '1 week');
```

### 5. Responsive Testing
- Test on mobile viewport (375px)
- Test on tablet viewport (768px)
- Test on desktop viewport (1440px)

### 6. Dark Mode Testing
- Toggle dark mode using theme switcher
- Verify all components display correctly
- Check contrast and readability

### 7. Performance Testing
- Components should load without lag
- Animations should be smooth
- No layout shifts during data loading

## Expected Behavior

### Points Display
- Shows formatted point total (e.g., "1,234")
- Correct level calculation:
  - Beginner: 0-500
  - Proficient: 501-2,000
  - Advanced: 2,001-5,000
  - Expert: 5,001-10,000
  - Master: 10,001+

### Tier Progress
- Progress bar shows % to next tier
- Requirements clearly displayed
- Elite tier shows congratulations message

### Badge Showcase
- Earned badges in color
- Locked badges grayed out
- Tooltips show details on hover

### Achievements Feed
- Chronological order (newest first)
- Time ago formatting (e.g., "2h ago")
- Points displayed in green

### Bonus Tracker
- Status indicators (pending/approved/paid)
- Next payout shows upcoming Friday
- Total earnings calculation correct

## Common Issues

1. **No data showing**: Check user authentication and database connection
2. **Loading forever**: Verify Supabase RLS policies allow read access
3. **Incorrect calculations**: Check data types in database (numeric vs string)
4. **Missing icons**: Ensure lucide-react is properly imported

## Next Steps

After Task 3.1 is verified:
- Task 3.2: Implement points tracking triggers
- Task 3.3: Badge system automation
- Task 3.4: Dashboard integration

---

*Last Updated: January 2025* 