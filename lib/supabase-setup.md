# Supabase Integration Setup Guide

## Overview
This guide will help you integrate Supabase as the backend database for the tutor profile dashboard.

## Prerequisites
- Supabase account (https://supabase.com)
- Project created in Supabase dashboard

## Installation

```bash
npm install @supabase/supabase-js
```

## Environment Variables
Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Database Schema

### Tables to Create:

#### 1. tutors
```sql
CREATE TABLE tutors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  avatar_url TEXT,
  title VARCHAR(255),
  specialties TEXT[],
  rating DECIMAL(3,2),
  total_sessions INTEGER DEFAULT 0,
  total_earnings INTEGER DEFAULT 0,
  join_date DATE DEFAULT CURRENT_DATE,
  status VARCHAR(50) DEFAULT 'available',
  location VARCHAR(255),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  streak INTEGER DEFAULT 0,
  rank VARCHAR(50) DEFAULT 'Beginner',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. sessions
```sql
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  student_name VARCHAR(255) NOT NULL,
  student_avatar TEXT,
  subject VARCHAR(255) NOT NULL,
  session_date DATE NOT NULL,
  session_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  session_type VARCHAR(50) DEFAULT 'regular',
  pay_rate INTEGER NOT NULL,
  notes TEXT,
  status VARCHAR(50) DEFAULT 'pending_confirmation',
  meeting_link TEXT,
  materials TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. opportunities
```sql
CREATE TABLE opportunities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  student_avatar TEXT,
  subject VARCHAR(255) NOT NULL,
  preferred_times TEXT[],
  duration INTEGER NOT NULL,
  frequency VARCHAR(50),
  pay_rate INTEGER NOT NULL,
  urgency VARCHAR(50) DEFAULT 'medium',
  student_level VARCHAR(100),
  needs TEXT,
  location VARCHAR(255) DEFAULT 'Online',
  start_date DATE,
  budget VARCHAR(100),
  match_score INTEGER,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 4. achievements
```sql
CREATE TABLE achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon VARCHAR(10),
  unlocked_at TIMESTAMP DEFAULT NOW()
);
```

#### 5. administrative_tasks
```sql
CREATE TABLE administrative_tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  priority VARCHAR(50) DEFAULT 'medium',
  due_date DATE,
  category VARCHAR(100),
  action_required BOOLEAN DEFAULT true,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Supabase Client Setup

Create `lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

## Data Fetching Functions

Create `lib/api/dashboard.ts`:

```typescript
import { supabase } from '@/lib/supabase'

export async function fetchTutorProfile(tutorId: string) {
  const { data, error } = await supabase
    .from('tutors')
    .select('*')
    .eq('id', tutorId)
    .single()

  if (error) throw error
  return data
}

export async function fetchUpcomingSessions(tutorId: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('tutor_id', tutorId)
    .eq('status', 'confirmed')
    .gte('session_date', new Date().toISOString().split('T')[0])
    .order('session_date', { ascending: true })
    .order('session_time', { ascending: true })

  if (error) throw error
  return data
}

export async function fetchOpportunities() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('*')
    .order('match_score', { ascending: false })
    .limit(10)

  if (error) throw error
  return data
}
```

## Migration Steps

1. **Replace mock data imports** with Supabase API calls
2. **Update components** to use async data fetching
3. **Add loading states** for better UX
4. **Implement real-time updates** using Supabase subscriptions
5. **Add error handling** for failed API calls
6. **Set up authentication** for tutor login/logout

## Real-time Features

```typescript
// Subscribe to session updates
const subscription = supabase
  .channel('sessions')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'sessions',
    filter: `tutor_id=eq.${tutorId}`
  }, (payload) => {
    // Handle real-time updates
    console.log('Session updated:', payload)
  })
  .subscribe()
```

## Next Steps

1. Set up Supabase project and database
2. Create the required tables using the SQL above
3. Install Supabase client library
4. Configure environment variables
5. Replace mock data with real API calls
6. Add authentication and user management
7. Implement real-time features for live updates

## Notes

- Consider implementing Row Level Security (RLS) for data protection
- Set up proper indexes for better query performance
- Use Supabase Edge Functions for complex business logic
- Consider implementing caching for frequently accessed data 