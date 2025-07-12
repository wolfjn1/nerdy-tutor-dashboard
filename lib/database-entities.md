# Database Entities and Architecture

## Overview
This document provides a comprehensive overview of all database entities, their relationships, and the overall architecture of the tutor dashboard application.

## Entity Relationship Diagram

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     TUTORS      │────<│    STUDENTS     │────<│  STUDENT        │
│                 │     │                 │     │  CONTACTS       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │                      │
         │                      │
         ├──────────────────────┤
         │                      │
         v                      v
┌─────────────────┐     ┌─────────────────┐
│    SESSIONS     │────>│  LESSON PLANS   │
│                 │     │                 │
└─────────────────┘     └─────────────────┘
         │                      │
         │                      ├────<────────┐
         │                      │             │
         v                      v             v
┌─────────────────┐     ┌─────────────┐  ┌─────────────┐
│    HOMEWORK     │     │ ACTIVITIES  │  │ ASSESSMENTS │
│                 │     │             │  │             │
└─────────────────┘     └─────────────┘  └─────────────┘
         │
         v
┌─────────────────┐
│   SUBMISSIONS   │
└─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  CONVERSATIONS  │────<│  PARTICIPANTS   │>────│    MESSAGES     │
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    INVOICES     │────<│INVOICE_SESSIONS │     │    PAYMENTS     │
│                 │     └─────────────────┘     │                 │
└─────────────────┘                             └─────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  OPPORTUNITIES  │     │  ACHIEVEMENTS   │────<│TUTOR_ACHIEVEMENTS│
└─────────────────┘     └─────────────────┘     └─────────────────┘

┌─────────────────┐     ┌─────────────────┐
│ XP_ACTIVITIES   │     │  NOTIFICATIONS  │
└─────────────────┘     └─────────────────┘
```

## Core Entities

### 1. TUTORS
**Purpose**: Main user accounts for tutors
**Key Fields**:
- `id` (UUID) - Primary key
- `auth_user_id` (UUID) - Links to Supabase Auth
- `first_name`, `last_name`, `email`
- `subjects` (Array) - Teaching subjects
- `hourly_rate` - Base hourly rate
- `rating` - Average rating (0-5)
- `total_earnings`, `total_hours`
- `availability` (JSONB) - Weekly schedule

**Relationships**:
- Has many Students
- Has many Sessions
- Has many Invoices
- Has many Achievements

### 2. STUDENTS
**Purpose**: Student profiles managed by tutors
**Key Fields**:
- `id` (UUID) - Primary key
- `tutor_id` (UUID) - Foreign key to tutors
- `first_name`, `last_name`
- `grade` - Current grade level
- `subjects` (Array) - Enrolled subjects
- `attendance_rate`, `performance_rate`, `engagement_rate` (0-100)
- `is_active` - Active/inactive status

**Relationships**:
- Belongs to Tutor
- Has many Sessions
- Has many Student Contacts
- Has many Homework assignments

### 3. SESSIONS
**Purpose**: Individual tutoring sessions
**Key Fields**:
- `id` (UUID) - Primary key
- `student_id`, `tutor_id` - Foreign keys
- `scheduled_at` (Timestamp) - Session date/time
- `duration` (Integer) - Minutes
- `status` (Enum) - scheduled/in_progress/completed/cancelled/no_show
- `rating` (1-5) - Session rating
- `earnings` - Session earnings
- `is_recurring` - Recurring session flag

**Relationships**:
- Belongs to Student and Tutor
- Has one Lesson Plan (optional)
- Has many Homework assignments
- Can be part of Invoices

### 4. LESSON PLANS
**Purpose**: Structured lesson content
**Key Fields**:
- `id` (UUID) - Primary key
- `tutor_id` - Creator
- `session_id` - Linked session (optional)
- `title`, `subject`, `grade`
- `objectives` (Array) - Learning objectives
- `materials` (Array) - Required materials
- `is_template` - Reusable template flag

**Relationships**:
- Belongs to Tutor
- Belongs to Session (optional)
- Has many Activities
- Has many Assessments

### 5. HOMEWORK
**Purpose**: Assignments for students
**Key Fields**:
- `id` (UUID) - Primary key
- `student_id`, `tutor_id` - Foreign keys
- `session_id` - Related session (optional)
- `due_date` - Assignment deadline
- `status` (Enum) - assigned/in_progress/completed/late/missing
- `grade` (0-100) - Assignment grade
- `feedback` - Tutor feedback

**Relationships**:
- Belongs to Student and Tutor
- Belongs to Session (optional)
- Has many Submissions

### 6. MESSAGES & CONVERSATIONS
**Purpose**: Direct messaging system
**Key Fields**:
- Conversations: Container for message threads
- Participants: Links tutors/students to conversations
- Messages: Individual messages with content, attachments
- `is_read` - Read status
- `unread_count` - Per participant

**Relationships**:
- Conversations have many Participants
- Conversations have many Messages
- Messages belong to sender (tutor or student)

### 7. INVOICES & PAYMENTS
**Purpose**: Billing and payment tracking
**Key Fields**:
- Invoices: `invoice_number`, `amount`, `tax`, `total`
- `status` (Enum) - draft/sent/paid/overdue/cancelled
- `due_date`, `paid_date`
- Payments: Transaction records

**Relationships**:
- Invoices belong to Tutor and Student
- Invoices have many Sessions (through junction table)
- Invoices have many Payments

### 8. OPPORTUNITIES
**Purpose**: Available tutoring requests
**Key Fields**:
- `student_name`, `subject`, `duration`
- `urgency` (Enum) - low/medium/high/critical
- `pay_rate` - Offered rate
- `preferred_times` (Array)
- `match_score` (0-100) - Compatibility score
- `is_active` - Active opportunity flag

**Relationships**:
- Standalone entity (no direct relationships)
- Can be converted to Student + Sessions

### 9. GAMIFICATION SYSTEM
**Purpose**: Achievement and XP tracking

#### Achievements
- Predefined achievement templates
- `condition_type`, `condition_value` - Unlock criteria
- `rarity` (Enum) - common/rare/epic/legendary

#### Tutor Achievements (Junction)
- Links tutors to unlocked achievements
- Tracks progress towards unlocking

#### XP Activities
- Records XP-earning actions
- Links to sessions/students for context

**Relationships**:
- Achievements linked to Tutors through junction table
- XP Activities belong to Tutor

### 10. NOTIFICATIONS
**Purpose**: System notifications
**Key Fields**:
- `type` (Enum) - info/success/warning/error
- `category` (Enum) - session/message/achievement/billing/system
- `is_read` - Read status
- `action_url` - Deep link
- `expires_at` - Auto-expiry

**Relationships**:
- Belongs to Tutor

## Key Features

### 1. Row Level Security (RLS)
- All tables have RLS enabled
- Tutors can only access their own data
- Policies enforce data isolation

### 2. Automatic Timestamps
- `created_at` - Set on insert
- `updated_at` - Updated via triggers
- Consistent across all tables

### 3. Soft Deletes
- Use `is_active` flags instead of hard deletes
- Maintains data integrity and history

### 4. Flexible Scheduling
- `availability` stored as JSONB for flexibility
- Recurring sessions supported
- Timezone-aware timestamps

### 5. Comprehensive Indexes
- Foreign key indexes for fast joins
- Date/time indexes for calendar queries
- Status indexes for filtering

## Data Integrity Rules

1. **Cascade Deletes**: 
   - Deleting a tutor cascades to all related data
   - Deleting a student cascades to their sessions/homework

2. **Null Handling**:
   - Sessions remain if lesson plan deleted (SET NULL)
   - Historical data preserved when possible

3. **Check Constraints**:
   - Ratings between 1-5
   - Grades between 0-100
   - Percentages between 0-100

4. **Unique Constraints**:
   - Email addresses
   - Invoice numbers
   - Tutor-achievement combinations

## Performance Considerations

1. **Indexes**: Created on all foreign keys and commonly queried fields
2. **JSONB**: Used for flexible data (availability, preferences)
3. **Arrays**: PostgreSQL arrays for multi-value fields
4. **Materialized Views**: Consider for complex analytics
5. **Partitioning**: Consider for messages/notifications tables at scale

## Security Model

1. **Authentication**: Supabase Auth integration
2. **Authorization**: RLS policies on all tables
3. **API Security**: Anon key for public, service key for admin
4. **Data Encryption**: At rest and in transit
5. **Audit Trail**: Consider adding audit log table

## Future Considerations

1. **Multi-tenancy**: Add organization layer if needed
2. **Archiving**: Strategy for old sessions/messages
3. **Analytics**: Dedicated analytics tables/views
4. **File Storage**: Supabase Storage for attachments
5. **Full-text Search**: PostgreSQL FTS for message/note search 