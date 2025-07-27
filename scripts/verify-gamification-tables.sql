-- Verify Gamification Tables Migration
-- Run this script after applying add-gamification-tables.sql to verify all tables were created

-- Check if all new tables exist
SELECT 
    table_name,
    CASE 
        WHEN table_name IN (
            'tutor_onboarding',
            'gamification_points',
            'tutor_badges',
            'tutor_tiers',
            'tutor_bonuses',
            'ai_tool_usage',
            'nudge_deliveries',
            'student_outcomes'
        ) THEN '✓ Created'
        ELSE '✗ Missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'tutor_onboarding',
    'gamification_points',
    'tutor_badges',
    'tutor_tiers',
    'tutor_bonuses',
    'ai_tool_usage',
    'nudge_deliveries',
    'student_outcomes'
)
ORDER BY table_name;

-- Count total gamification tables (should be 8)
SELECT 
    COUNT(*) as gamification_tables_count,
    CASE 
        WHEN COUNT(*) = 8 THEN '✓ All tables created successfully!'
        ELSE '✗ Some tables are missing'
    END as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'tutor_onboarding',
    'gamification_points',
    'tutor_badges',
    'tutor_tiers',
    'tutor_bonuses',
    'ai_tool_usage',
    'nudge_deliveries',
    'student_outcomes'
);

-- Check RLS is enabled on all new tables
SELECT 
    schemaname,
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '✓ RLS Enabled'
        ELSE '✗ RLS Disabled'
    END as rls_status
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN (
    'tutor_onboarding',
    'gamification_points',
    'tutor_badges',
    'tutor_tiers',
    'tutor_bonuses',
    'ai_tool_usage',
    'nudge_deliveries',
    'student_outcomes'
)
ORDER BY tablename;

-- Check indexes were created
SELECT 
    tablename,
    indexname,
    '✓ Index exists' as status
FROM pg_indexes
WHERE schemaname = 'public'
AND tablename IN (
    'tutor_onboarding',
    'gamification_points',
    'tutor_badges',
    'tutor_tiers',
    'tutor_bonuses',
    'ai_tool_usage',
    'nudge_deliveries',
    'student_outcomes'
)
ORDER BY tablename, indexname;

-- Verify existing gamification tables that we're reusing
SELECT 
    table_name,
    '✓ Existing table (will be reused)' as status
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN (
    'achievements',
    'tutor_achievements',
    'xp_activities'
)
ORDER BY table_name; 