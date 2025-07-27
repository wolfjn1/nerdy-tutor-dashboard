# Onboarding Flow Testing Instructions

## Overview

This document provides step-by-step instructions for testing the complete onboarding flow integration.

## Setup Test Account

### 1. Create Auth User in Supabase

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Invite User" or "Create User"
4. Use these credentials:
   - Email: `onboarding.test@tutor.com`
   - Password: `TestPassword123!`
5. Copy the user's UUID after creation

### 2. Create Tutor Profile

Run this SQL in Supabase SQL Editor (replace the UUID):

```sql
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the actual UUID from step 1
INSERT INTO tutors (
  auth_user_id,
  email,
  first_name,
  last_name,
  title,
  specialties,
  rating,
  total_sessions,
  total_earnings,
  status,
  location,
  level,
  total_xp,
  streak,
  rank
) VALUES (
  'YOUR_AUTH_USER_ID_HERE',
  'onboarding.test@tutor.com',
  'Test',
  'Onboarding',
  'New Tutor',
  ARRAY['Math', 'Science'],
  5.0,
  0,
  0,
  'available',
  'New York, NY',
  1,
  0,
  0,
  'Bronze'
) ON CONFLICT (email) DO NOTHING;
```

### 3. Clear Any Existing Onboarding Data

```sql
-- Replace with the actual UUID
DELETE FROM tutor_onboarding WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';
DELETE FROM tutor_badges WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';
DELETE FROM gamification_points WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';
```

## Testing Scenarios

### Test 1: New Tutor Onboarding Flow

1. **Login as new tutor**
   - Go to `/login`
   - Use credentials: `onboarding.test@tutor.com` / `TestPassword123!`
   - Should automatically redirect to `/onboarding`

2. **Complete onboarding steps**
   - Step 1: Welcome - Click "Let's Get Started!"
   - Step 2: Profile Setup - Click "Continue to Next Step"
   - Step 3: Best Practices - Check all boxes, then click "I'm Ready to Excel!"
   - Step 4: AI Tools - Review tools and click "Explore AI Tools"
   - Step 5: First Student - Click "Complete Onboarding!"

3. **Verify completion**
   - Should redirect to `/dashboard`
   - Should see congratulations banner
   - Banner should show:
     - "Quick Learner" badge earned
     - 100 points awarded

### Test 2: Partial Completion & Resume

1. **Start onboarding but don't finish**
   - Complete only steps 1-2
   - Navigate away or close browser

2. **Return and resume**
   - Login again as same user
   - Should redirect to `/onboarding`
   - Should start at Step 3 (where you left off)
   - Progress bar should show 40% complete

### Test 3: Completed User Access

1. **Try to access onboarding after completion**
   - Complete all onboarding steps
   - Navigate to `/onboarding`
   - Should redirect to `/dashboard`

### Test 4: Direct Dashboard Access (New User)

1. **Try to bypass onboarding**
   - As a new user, try going directly to `/dashboard`
   - Should redirect to `/onboarding`

## Verification Queries

Run these in Supabase SQL Editor to verify data:

### Check Onboarding Progress
```sql
SELECT * FROM tutor_onboarding 
WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE'
ORDER BY completed_at;
```

### Check Badges Earned
```sql
SELECT * FROM tutor_badges 
WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';
```

### Check Points Awarded
```sql
SELECT * FROM gamification_points 
WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';
```

### Full Status Check
```sql
SELECT 
  t.email,
  COUNT(DISTINCT o.step_completed) as completed_steps,
  COUNT(DISTINCT b.badge_type) as badges_earned,
  COALESCE(SUM(p.points), 0) as total_points
FROM tutors t
LEFT JOIN tutor_onboarding o ON t.auth_user_id = o.tutor_id
LEFT JOIN tutor_badges b ON t.auth_user_id = b.tutor_id
LEFT JOIN gamification_points p ON t.auth_user_id = p.tutor_id
WHERE t.email = 'onboarding.test@tutor.com'
GROUP BY t.email;
```

## Edge Cases to Test

1. **Browser refresh during onboarding**
   - Should maintain current step
   - Progress should persist

2. **Back button usage**
   - Should allow going back to previous steps
   - Cannot skip ahead

3. **Multiple browser tabs**
   - Complete a step in one tab
   - Other tab should reflect progress when navigated

4. **API errors**
   - Simulate network failure
   - Should show error message
   - Should allow retry

## Clean Up Between Tests

To reset the test account for fresh testing:

```sql
DELETE FROM tutor_onboarding WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';
DELETE FROM tutor_badges WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';
DELETE FROM gamification_points WHERE tutor_id = 'YOUR_AUTH_USER_ID_HERE';

-- Optionally clear the banner shown flag in browser localStorage
-- Run in browser console: localStorage.removeItem('onboarding_completion_banner_shown')
``` 