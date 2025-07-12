# Database Seeding Guide

This guide walks you through populating your Supabase database with realistic test data.

## Prerequisites

Before running the seed script, ensure you have:

1. **Created a Supabase project** (see `lib/supabase-setup-guide.md`)
2. **Run the database schema** from `lib/supabase-schema.sql`
3. **Set up environment variables**

## Environment Setup

Create a `.env.local` file in your project root with:

```env
# From Supabase Dashboard > Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# IMPORTANT: Service Role Key is needed for seeding
# This key bypasses Row Level Security - keep it secret!
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

⚠️ **Security Note**: Never commit the service role key to version control!

## Running the Seed Script

```bash
npm run seed
```

The script will:
1. Clear all existing data
2. Create test data in the correct order
3. Display a summary of created records

## Test Data Overview

### Tutors (10 total)
- Dr. Sarah Chen - Mathematics, Calculus, Statistics
- Prof. Michael Rodriguez - Physics, Mathematics, Chemistry
- Emily Thompson - English, Literature, Writing, ESL
- James Liu - Computer Science, Programming, Web Development
- Maria García - Spanish, French, ESL, Literature
- Dr. Robert Johnson - Chemistry, Biology, General Science
- Alexandra Foster - Music Theory, Piano, Guitar
- David Kim - History, Geography, Social Studies
- Sophie Patel - Art, Drawing, Painting
- Thomas Anderson - Algebra, Geometry, General Science

### Per Tutor
- **5-20 Students** with parent contact information
- **10-50 Sessions** per student
- **Lesson Plans** with activities
- **Homework** assignments (40% of sessions)
- **Messages** and conversations
- **Invoices** for completed sessions

### Additional Data
- **15 Opportunities** from prospective students
- **10 Achievement types** with progress tracking
- **Recent notifications** for each tutor

## Data Characteristics

- **Sessions**: Span from 3 months ago to 2 months future
- **Status Distribution**:
  - 70% completed (past sessions)
  - 20% scheduled
  - 5% cancelled
  - 5% no-show
- **Homework Status**:
  - 60% completed
  - 20% in progress
  - 15% assigned
  - 3% late
  - 2% missing

## Accessing Test Data

After seeding, you can:

1. **Log in as any tutor** using their email (password would need to be set via Supabase Auth)
2. **View the dashboard** with realistic data
3. **Test all features** with pre-populated content

## Customizing Seed Data

Edit `scripts/seed-database.ts` to modify:

- Number of records
- Date ranges
- Status distributions
- Subject offerings
- Tutor specializations

## Troubleshooting

### "Missing Supabase environment variables!"
- Ensure `.env.local` exists with all required keys
- Restart your development server after adding environment variables

### "Permission denied" errors
- Make sure you're using the service role key (not anon key) for seeding
- Check that your database schema has been applied

### Type errors
- Run `npm install` to ensure all dependencies are installed
- The script uses `@faker-js/faker` for data generation

## Re-running the Script

The seed script is idempotent - it clears all data before inserting new records. You can run it multiple times safely.

```bash
# Run again for fresh data
npm run seed
```

## Next Steps

After seeding your database:

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000`
3. Explore the dashboard with test data
4. Set up authentication for test tutors if needed 