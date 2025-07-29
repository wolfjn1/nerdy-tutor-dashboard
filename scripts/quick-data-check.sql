-- Quick check - what data does Sarah Chen have?
SELECT 
    'Sarah Chen Data Summary' as title,
    (SELECT COUNT(*) FROM gamification_points WHERE tutor_id = 'd87df13b-5487-4b04-89c8-4b18bf89250a') as points_count,
    (SELECT COALESCE(SUM(points), 0) FROM gamification_points WHERE tutor_id = 'd87df13b-5487-4b04-89c8-4b18bf89250a') as total_points,
    (SELECT COUNT(*) FROM tutor_badges WHERE tutor_id = 'd87df13b-5487-4b04-89c8-4b18bf89250a') as badges_count,
    (SELECT COUNT(*) FROM tutor_tiers WHERE tutor_id = 'd87df13b-5487-4b04-89c8-4b18bf89250a') as tier_records,
    (SELECT current_tier FROM tutor_tiers WHERE tutor_id = 'd87df13b-5487-4b04-89c8-4b18bf89250a' LIMIT 1) as current_tier; 