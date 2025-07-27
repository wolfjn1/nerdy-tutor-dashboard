-- Gamification System Migration
-- This migration adds new tables for the AI-driven tutor onboarding and gamification system
-- Run this after the main schema (lib/supabase-schema.sql) has been applied

-- Note: The following tables already exist and will be reused:
-- - achievements (basic achievement definitions)
-- - tutor_achievements (tracks which tutors have which achievements)
-- - xp_activities (XP transaction log)
-- - tutors.badges (simple badge array column)

-- 1. TUTOR ONBOARDING - Tracks onboarding progress
CREATE TABLE IF NOT EXISTS tutor_onboarding (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    step_completed VARCHAR(50) NOT NULL,
    completed_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    UNIQUE(tutor_id, step_completed)
);

-- 2. GAMIFICATION POINTS - Detailed points transactions (outcome-based)
CREATE TABLE IF NOT EXISTS gamification_points (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    points INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    reference_id UUID, -- Links to session, student, etc.
    reference_type VARCHAR(50), -- 'session', 'retention', 'review', etc.
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 3. TUTOR BADGES - Enhanced badge tracking (replaces simple array in tutors table)
CREATE TABLE IF NOT EXISTS tutor_badges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    badge_type VARCHAR(50) NOT NULL,
    earned_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB,
    UNIQUE(tutor_id, badge_type)
);

-- 4. TUTOR TIERS - Performance tier tracking (Standard/Silver/Gold/Elite)
CREATE TABLE IF NOT EXISTS tutor_tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE UNIQUE,
    current_tier VARCHAR(20) NOT NULL DEFAULT 'standard',
    tier_started_at TIMESTAMPTZ DEFAULT NOW(),
    total_sessions INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2),
    retention_rate DECIMAL(5,2),
    last_evaluated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TUTOR BONUSES - Monetary bonus tracking
CREATE TABLE IF NOT EXISTS tutor_bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    bonus_type VARCHAR(50) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    reference_id UUID,
    reference_type VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, paid
    created_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 6. AI TOOL USAGE - Track AI tool usage and effectiveness
CREATE TABLE IF NOT EXISTS ai_tool_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    tool_type VARCHAR(50) NOT NULL,
    session_id UUID REFERENCES sessions(id),
    student_id UUID REFERENCES students(id),
    outcome_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. NUDGE DELIVERIES - Track behavioral nudges
CREATE TABLE IF NOT EXISTS nudge_deliveries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    nudge_type VARCHAR(50) NOT NULL,
    delivery_channel VARCHAR(20) NOT NULL, -- 'in_app', 'email'
    delivered_at TIMESTAMPTZ DEFAULT NOW(),
    responded BOOLEAN DEFAULT FALSE,
    responded_at TIMESTAMPTZ,
    metadata JSONB
);

-- 8. STUDENT OUTCOMES - Track measurable student outcomes
CREATE TABLE IF NOT EXISTS student_outcomes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2),
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tutor_onboarding_tutor_id ON tutor_onboarding(tutor_id);
CREATE INDEX IF NOT EXISTS idx_gamification_points_tutor_id ON gamification_points(tutor_id);
CREATE INDEX IF NOT EXISTS idx_gamification_points_created_at ON gamification_points(created_at);
CREATE INDEX IF NOT EXISTS idx_tutor_badges_tutor_id ON tutor_badges(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_tiers_tutor_id ON tutor_tiers(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_bonuses_tutor_id ON tutor_bonuses(tutor_id);
CREATE INDEX IF NOT EXISTS idx_tutor_bonuses_status ON tutor_bonuses(status);
CREATE INDEX IF NOT EXISTS idx_ai_tool_usage_tutor_id ON ai_tool_usage(tutor_id);
CREATE INDEX IF NOT EXISTS idx_nudge_deliveries_tutor_id ON nudge_deliveries(tutor_id);
CREATE INDEX IF NOT EXISTS idx_student_outcomes_student_id ON student_outcomes(student_id);
CREATE INDEX IF NOT EXISTS idx_student_outcomes_tutor_id ON student_outcomes(tutor_id);

-- Enable Row Level Security on new tables
ALTER TABLE tutor_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE gamification_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutor_bonuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE nudge_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_outcomes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for tutor_onboarding
CREATE POLICY "Tutors can view own onboarding progress" 
    ON tutor_onboarding FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

CREATE POLICY "System can update onboarding progress" 
    ON tutor_onboarding FOR INSERT 
    WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- RLS Policies for gamification_points
CREATE POLICY "Tutors can view own points" 
    ON gamification_points FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- RLS Policies for tutor_badges
CREATE POLICY "Tutors can view own badges" 
    ON tutor_badges FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- RLS Policies for tutor_tiers
CREATE POLICY "Tutors can view own tier" 
    ON tutor_tiers FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- RLS Policies for tutor_bonuses
CREATE POLICY "Tutors can view own bonuses" 
    ON tutor_bonuses FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- RLS Policies for ai_tool_usage
CREATE POLICY "Tutors can view own AI tool usage" 
    ON ai_tool_usage FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Tutors can create AI tool usage records" 
    ON ai_tool_usage FOR INSERT 
    WITH CHECK (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- RLS Policies for nudge_deliveries
CREATE POLICY "Tutors can view own nudges" 
    ON nudge_deliveries FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Tutors can update own nudge responses" 
    ON nudge_deliveries FOR UPDATE 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

-- RLS Policies for student_outcomes
CREATE POLICY "Tutors can view outcomes for their students" 
    ON student_outcomes FOR SELECT 
    USING (tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()));

CREATE POLICY "Tutors can create outcomes for their students" 
    ON student_outcomes FOR INSERT 
    WITH CHECK (
        tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()) AND
        student_id IN (SELECT id FROM students WHERE tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid()))
    );

-- Add triggers for updated_at where applicable
CREATE TRIGGER update_tutor_onboarding_updated_at 
    BEFORE UPDATE ON tutor_onboarding 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_tiers_updated_at 
    BEFORE UPDATE ON tutor_tiers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tutor_bonuses_updated_at 
    BEFORE UPDATE ON tutor_bonuses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Migration notes:
-- 1. The existing achievements and tutor_achievements tables will be enhanced with new achievement types
-- 2. The existing xp_activities table can be used alongside gamification_points for different tracking needs
-- 3. The tutors.badges array column can be migrated to tutor_badges table for better tracking
-- 4. This migration is idempotent - it can be run multiple times safely 