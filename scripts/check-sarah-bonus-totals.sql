-- Check Sarah Chen's actual bonus totals
-- This will show what the summary should display

-- Get Sarah's tutor ID
WITH sarah AS (
    SELECT id as tutor_id
    FROM tutors
    WHERE email = 'sarah_chen@hotmail.com'
)

-- Calculate summary
SELECT 
    'Pending' as status,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total
FROM tutor_bonuses tb
JOIN sarah s ON tb.tutor_id = s.tutor_id
WHERE status = 'pending'

UNION ALL

SELECT 
    'Approved' as status,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total
FROM tutor_bonuses tb
JOIN sarah s ON tb.tutor_id = s.tutor_id
WHERE status = 'approved'

UNION ALL

SELECT 
    'Paid' as status,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total
FROM tutor_bonuses tb
JOIN sarah s ON tb.tutor_id = s.tutor_id
WHERE status = 'paid'

UNION ALL

SELECT 
    'TOTAL' as status,
    COUNT(*) as count,
    COALESCE(SUM(amount), 0) as total
FROM tutor_bonuses tb
JOIN sarah s ON tb.tutor_id = s.tutor_id;

-- Also check if paid_at dates exist
SELECT 
    'Paid this month check' as check_type,
    id,
    amount,
    status,
    created_at,
    paid_at
FROM tutor_bonuses
WHERE tutor_id = (SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com')
AND status = 'paid'; 