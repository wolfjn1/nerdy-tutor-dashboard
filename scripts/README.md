# Database Scripts

## Seed Database Script

This script populates your Supabase database with realistic test data.

### Prerequisites

1. Ensure you have set up your Supabase project and run the schema from `lib/supabase-schema.sql`
2. Set up your environment variables in `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

### Running the Seed Script

```bash
# Using npm
npm run seed

# Or directly with ts-node
npx ts-node scripts/seed-database.ts
```

### What Gets Created

The script creates:
- **10 Tutors** with diverse subject specializations
- **5-20 Students** per tutor with parent contacts
- **10-50 Sessions** per student (past and future)
- **Lesson Plans** with activities and assessments
- **Homework** assignments with submissions
- **Conversations** and messages between tutors and students
- **Invoices** with payment records
- **15 Opportunities** for new students
- **Achievements** and notifications

### Data Characteristics

- Sessions span from 3 months ago to 2 months in the future
- 70% of past sessions are marked as completed
- 40% of sessions have associated homework
- Invoices are generated monthly for completed sessions
- Each tutor has 2-6 unlocked achievements
- Realistic availability schedules for each tutor

### Clearing Data

The script automatically clears all existing data before seeding. This ensures a clean state each time you run it.

### Customization

You can modify the constants at the top of `seed-database.ts` to adjust:
- Number of tutors/students
- Subject offerings
- Session distribution
- Status weights
- And more... 