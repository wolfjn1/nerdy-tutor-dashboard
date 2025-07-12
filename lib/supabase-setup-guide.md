# Supabase Setup Guide for Tutor Dashboard

## Overview
This guide provides step-by-step instructions for setting up Supabase as the backend for the tutor dashboard application.

## Prerequisites
- Node.js 14+ installed
- Supabase account (https://supabase.com)
- Access to the Supabase dashboard

## Table of Contents
1. [Create Supabase Project](#create-supabase-project)
2. [Database Setup](#database-setup)
3. [Environment Configuration](#environment-configuration)
4. [Install Dependencies](#install-dependencies)
5. [Authentication Setup](#authentication-setup)
6. [Database Schema Implementation](#database-schema-implementation)
7. [Data Migration](#data-migration)
8. [API Integration](#api-integration)
9. [Real-time Features](#real-time-features)
10. [Testing](#testing)

## 1. Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com) and sign in
2. Click "New Project"
3. Fill in the project details:
   - Organization: Select or create one
   - Project name: `tutor-dashboard`
   - Database Password: Generate a strong password (save this!)
   - Region: Choose closest to your users
4. Click "Create new project"

## 2. Database Setup

### Option A: Using Supabase Dashboard
1. Navigate to the SQL Editor in your Supabase dashboard
2. Copy the entire contents of `lib/supabase-schema.sql`
3. Paste and run the SQL in the editor
4. Check for any errors in the output

### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run the schema
supabase db push lib/supabase-schema.sql
```

## 3. Environment Configuration

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Find these values in your Supabase dashboard:
- Go to Settings → API
- Copy the Project URL and anon key
- Service role key is under "Service role key" (keep this secret!)

## 4. Install Dependencies

```bash
npm install @supabase/supabase-js @supabase/auth-helpers-nextjs
npm install --save-dev @types/node
```

## 5. Authentication Setup

### Create Supabase Client
Update `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

### Enable Authentication Providers
1. In Supabase Dashboard, go to Authentication → Providers
2. Enable Email provider
3. Configure email templates for better user experience
4. Optionally enable OAuth providers (Google, GitHub, etc.)

## 6. Database Schema Implementation

The schema includes the following tables:
- **tutors** - Main user profiles
- **students** - Student profiles linked to tutors
- **sessions** - Tutoring sessions
- **lesson_plans** - Lesson plan templates
- **homework** - Homework assignments
- **messages** - Direct messaging system
- **invoices** - Billing and invoicing
- **opportunities** - Available tutoring opportunities
- **achievements** - Gamification system
- **notifications** - System notifications

## 7. Data Migration

### Migrate Mock Data to Supabase

Create `scripts/migrate-data.ts`:

```typescript
import { supabase } from '../lib/supabase'
import studentsData from '../lib/mock-data/students.json'
import sessionsData from '../lib/mock-data/sessions.json'

async function migrateData() {
  // First, create a test tutor
  const { data: tutor, error: tutorError } = await supabase
    .from('tutors')
    .insert({
      first_name: 'John',
      last_name: 'Doe',
      email: 'john.doe@example.com',
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      hourly_rate: 75,
      rating: 4.8,
    })
    .select()
    .single()

  if (tutorError) {
    console.error('Error creating tutor:', tutorError)
    return
  }

  console.log('Created tutor:', tutor.id)

  // Migrate students
  for (const student of studentsData) {
    const { error } = await supabase.from('students').insert({
      tutor_id: tutor.id,
      first_name: student.firstName,
      last_name: student.lastName,
      grade: student.grade,
      subjects: student.subjects,
      notes: student.notes,
      // ... map other fields
    })

    if (error) {
      console.error('Error migrating student:', error)
    }
  }

  console.log('Migration complete!')
}

migrateData()
```

Run the migration:
```bash
npx ts-node scripts/migrate-data.ts
```

## 8. API Integration

### Create API Hooks

Create `lib/hooks/useSupabase.ts`:

```typescript
import { useEffect, useState } from 'react'
import { supabase } from '../supabase'

export function useStudents(tutorId: string) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchStudents() {
      try {
        const { data, error } = await supabase
          .from('students')
          .select(`
            *,
            student_contacts (*)
          `)
          .eq('tutor_id', tutorId)
          .order('created_at', { ascending: false })

        if (error) throw error
        setStudents(data || [])
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [tutorId])

  return { students, loading, error }
}
```

### Update Components

Replace mock data imports with Supabase hooks:

```typescript
// Before
import studentsData from '@/lib/mock-data/students.json'

// After
import { useStudents } from '@/lib/hooks/useSupabase'

export default function StudentsPage() {
  const { students, loading, error } = useStudents(tutorId)
  
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  
  // Rest of your component
}
```

## 9. Real-time Features

### Enable Real-time Subscriptions

```typescript
// Subscribe to new messages
useEffect(() => {
  const channel = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        // Handle new message
        setMessages((prev) => [...prev, payload.new])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [conversationId])
```

## 10. Testing

### Test Database Connection

Create `test/supabase-connection.ts`:

```typescript
import { supabase } from '../lib/supabase'

async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('tutors')
      .select('count')
      .single()

    if (error) throw error
    console.log('✅ Successfully connected to Supabase!')
    console.log('Tutors count:', data)
  } catch (error) {
    console.error('❌ Failed to connect:', error.message)
  }
}

testConnection()
```

## Security Considerations

1. **Row Level Security (RLS)**: Already enabled in the schema
2. **API Keys**: Never expose service role key to client
3. **Authentication**: Always verify user identity before data access
4. **Input Validation**: Validate all user inputs before database operations
5. **Rate Limiting**: Consider implementing rate limiting for API calls

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Check your environment variables
2. **"Permission denied"**: Check RLS policies
3. **"Relation does not exist"**: Run the schema SQL again
4. **CORS errors**: Add your domain to Supabase allowed origins

### Debug Mode

Enable debug mode in development:

```typescript
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    debug: process.env.NODE_ENV === 'development',
  },
})
```

## Next Steps

1. Set up authentication flow
2. Implement data fetching in all components
3. Add real-time features where needed
4. Set up automated backups
5. Configure monitoring and analytics
6. Implement error tracking (e.g., Sentry)

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js + Supabase Guide](https://supabase.com/docs/guides/with-nextjs)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security) 