-- Supabase Database Schema for Tutor Dashboard
-- This file contains all tables, relationships, indexes, and RLS policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums
CREATE TYPE session_status AS ENUM ('scheduled', 'in_progress', 'completed', 'cancelled', 'no_show');
CREATE TYPE homework_status AS ENUM ('assigned', 'in_progress', 'completed', 'late', 'missing');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('credit_card', 'bank_transfer', 'cash', 'check');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error');
CREATE TYPE notification_category AS ENUM ('session', 'message', 'achievement', 'billing', 'system');
CREATE TYPE contact_relationship AS ENUM ('parent', 'guardian', 'student');
CREATE TYPE activity_type AS ENUM ('explanation', 'practice', 'discussion', 'assessment');
CREATE TYPE assessment_type AS ENUM ('quiz', 'worksheet', 'project', 'discussion');
CREATE TYPE achievement_rarity AS ENUM ('common', 'rare', 'epic', 'legendary');
CREATE TYPE urgency_level AS ENUM ('low', 'medium', 'high', 'critical');

-- 1. TUTORS TABLE (main users)
CREATE TABLE tutors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    avatar_url TEXT,
    bio TEXT,
    subjects TEXT[] DEFAULT '{}',
    hourly_rate INTEGER DEFAULT 50,
    availability JSONB DEFAULT '{}', -- {monday: ["9:00-10:00", "14:00-16:00"], ...}
    rating DECIMAL(3,2) DEFAULT 0.00,
    total_earnings INTEGER DEFAULT 0,
    total_hours INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    badges TEXT[] DEFAULT '{}',
    phone VARCHAR(50),
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(20) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. STUDENTS TABLE
CREATE TABLE students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    grade VARCHAR(20),
    subjects TEXT[] DEFAULT '{}',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    attendance_rate INTEGER DEFAULT 100, -- 0-100
    performance_rate INTEGER DEFAULT 100, -- 0-100
    engagement_rate INTEGER DEFAULT 100, -- 0-100
    next_session TIMESTAMPTZ,
    total_sessions INTEGER DEFAULT 0,
    completed_sessions INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. STUDENT CONTACTS TABLE
CREATE TABLE student_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    relationship contact_relationship NOT NULL,
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSIONS TABLE
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    subject VARCHAR(100) NOT NULL,
    scheduled_at TIMESTAMPTZ NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    status session_status DEFAULT 'scheduled',
    notes TEXT,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    earnings DECIMAL(10,2),
    meeting_link TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_pattern VARCHAR(50), -- weekly, biweekly, monthly
    recurring_end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LESSON PLANS TABLE
CREATE TABLE lesson_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    grade VARCHAR(20),
    duration INTEGER NOT NULL, -- in minutes
    objectives TEXT[] DEFAULT '{}',
    materials TEXT[] DEFAULT '{}',
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. ACTIVITIES TABLE
CREATE TABLE activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INTEGER NOT NULL, -- in minutes
    type activity_type NOT NULL,
    resources TEXT[] DEFAULT '{}',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ASSESSMENTS TABLE
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lesson_plan_id UUID REFERENCES lesson_plans(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type assessment_type NOT NULL,
    points INTEGER DEFAULT 0,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. HOMEWORK TABLE
CREATE TABLE homework (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject VARCHAR(100) NOT NULL,
    due_date DATE NOT NULL,
    status homework_status DEFAULT 'assigned',
    attachments TEXT[] DEFAULT '{}',
    feedback TEXT,
    grade INTEGER CHECK (grade >= 0 AND grade <= 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. HOMEWORK SUBMISSIONS TABLE
CREATE TABLE homework_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    homework_id UUID REFERENCES homework(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    content TEXT,
    attachments TEXT[] DEFAULT '{}',
    is_late BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CONVERSATIONS TABLE
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. CONVERSATION PARTICIPANTS TABLE
CREATE TABLE conversation_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    unread_count INTEGER DEFAULT 0,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(conversation_id, tutor_id, student_id)
);

-- 12. MESSAGES TABLE
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    sender_tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    sender_student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    attachments TEXT[] DEFAULT '{}',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CHECK ((sender_tutor_id IS NOT NULL AND sender_student_id IS NULL) OR 
           (sender_tutor_id IS NULL AND sender_student_id IS NOT NULL))
);

-- 13. INVOICES TABLE
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    tax DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) NOT NULL,
    status invoice_status DEFAULT 'draft',
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    paid_date DATE,
    payment_method payment_method,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. INVOICE SESSIONS TABLE (many-to-many)
CREATE TABLE invoice_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
    UNIQUE(invoice_id, session_id)
);

-- 15. PAYMENTS TABLE
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    method payment_method NOT NULL,
    status payment_status DEFAULT 'pending',
    transaction_id VARCHAR(255),
    notes TEXT,
    processed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. OPPORTUNITIES TABLE
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_name VARCHAR(255) NOT NULL,
    student_avatar TEXT,
    student_level VARCHAR(100),
    subject VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL, -- in minutes
    frequency VARCHAR(50), -- weekly, biweekly, etc
    urgency urgency_level DEFAULT 'medium',
    pay_rate DECIMAL(10,2),
    start_date DATE,
    preferred_times TEXT[], -- ["Monday 3-5pm", "Wednesday 4-6pm"]
    needs TEXT,
    match_score INTEGER DEFAULT 0, -- 0-100
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. ACHIEVEMENTS TABLE
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    type VARCHAR(50), -- milestone, streak, performance, social
    xp_reward INTEGER DEFAULT 0,
    condition_type VARCHAR(50), -- sessions_count, hours_taught, etc
    condition_value INTEGER,
    condition_timeframe VARCHAR(20), -- daily, weekly, monthly, yearly, all_time
    rarity achievement_rarity DEFAULT 'common',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. TUTOR ACHIEVEMENTS TABLE (many-to-many)
CREATE TABLE tutor_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    progress INTEGER DEFAULT 0,
    unlocked_at TIMESTAMPTZ,
    UNIQUE(tutor_id, achievement_id)
);

-- 19. XP ACTIVITIES TABLE
CREATE TABLE xp_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    action VARCHAR(255) NOT NULL,
    amount INTEGER NOT NULL,
    source VARCHAR(100),
    student_id UUID REFERENCES students(id) ON DELETE SET NULL,
    session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type DEFAULT 'info',
    category notification_category DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_students_tutor_id ON students(tutor_id);
CREATE INDEX idx_sessions_tutor_id ON sessions(tutor_id);
CREATE INDEX idx_sessions_student_id ON sessions(student_id);
CREATE INDEX idx_sessions_scheduled_at ON sessions(scheduled_at);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_homework_student_id ON homework(student_id);
CREATE INDEX idx_homework_due_date ON homework(due_date);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_notifications_tutor_id ON notifications(tutor_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_invoices_tutor_id ON invoices(tutor_id);
CREATE INDEX idx_invoices_status ON invoices(status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON tutors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lesson_plans_updated_at BEFORE UPDATE ON lesson_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homework_updated_at BEFORE UPDATE ON homework FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security Policies
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Tutor policies (users can only access their own data)
CREATE POLICY "Tutors can view own profile" ON tutors FOR SELECT USING (auth.uid() = auth_user_id);
CREATE POLICY "Tutors can update own profile" ON tutors FOR UPDATE USING (auth.uid() = auth_user_id);

-- Student policies (tutors can only access their own students)
CREATE POLICY "Tutors can view own students" ON students FOR SELECT USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Tutors can create students" ON students FOR INSERT WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Tutors can update own students" ON students FOR UPDATE USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- Session policies
CREATE POLICY "Tutors can view own sessions" ON sessions FOR SELECT USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Tutors can create sessions" ON sessions FOR INSERT WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));
CREATE POLICY "Tutors can update own sessions" ON sessions FOR UPDATE USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- Add similar policies for other tables as needed... 