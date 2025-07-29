# Database Scripts

This directory contains SQL scripts for database setup, migrations, and testing.

## Core Migration Scripts

### Gamification Setup
- **add-gamification-tables.sql** - Creates all gamification-related tables (points, badges, tiers, bonuses)
- **fix-achievements-403-error.sql** - Comprehensive fix for auth linkage and RLS policies
- **verify-gamification-tables.sql** - Verifies all gamification tables are properly set up

### User Management
- **ensure-demo-tutor.sql** - Ensures demo user (sarah_chen@hotmail.com) has proper tutor record
- **ensure-sarah-chen-complete.sql** - Complete setup for Sarah Chen test user
- **delete-orphaned-tutors.sql** - Removes tutor records with no auth users
- **link-remaining-tutors.sql** - Links tutors to their auth users

### Verification & Debugging
- **verify-auth-setup.sql** - Diagnostic script for auth setup
- **verify-complete-setup.sql** - Comprehensive system verification
- **simple-verification.sql** - Quick health check
- **debug-403-error.sql** - Debug authentication issues
- **check-sarah-chen.sql** - Check Sarah Chen test user status
- **check-rls-policies.sql** - Verify Row Level Security policies

### Testing & Seeding
- **seed-production.sql** - Seeds production data for demo accounts
- **test-bonus-system.sql** - Creates test bonus data
- **test-tier-system.sql** - Tests tier calculations

### Other Scripts
- **fix-onboarding-foreign-key.sql** - Fixes foreign key issues between auth users and tutors
- **fix-demo-gamification.sql** - Fixes gamification data for demo user
- **handle-orphaned-tutors.sql** - Options for handling orphaned records
- **bypass-onboarding-for-testing.sql** - Skip onboarding for test users
- **seed-database.ts** - TypeScript seeding script

## Common Issues and Solutions

### 403 Errors on Achievements/Bonuses Pages

If you're getting 403 errors when accessing gamification features:

1. Run the `fix-achievements-403-error.sql` script in your Supabase SQL editor
2. This will:
   - Ensure the tutors table has auth_user_id column
   - Link existing tutors to their auth accounts
   - Update RLS policies to be more flexible
   - Create automatic linking for new users
   - Fix demo user data

### Verify System Health

To check if everything is set up correctly:
```sql
-- Run simple-verification.sql for a quick check
-- Or verify-complete-setup.sql for detailed analysis
```

### Debug Specific Users

To debug issues for a specific user:
1. Update the email in `debug-403-error.sql`
2. Run each query to diagnose the issue
3. Follow the generated fix commands

## Production Deployment

When deploying to production:
1. Always run verification scripts first
2. Apply migrations in order
3. Test with a demo account before real users 