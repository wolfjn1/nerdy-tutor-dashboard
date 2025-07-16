-- Setup Demo Data for Nerdy Tutor Dashboard
-- Run this in Supabase SQL Editor

-- Step 1: Create Sarah Chen's tutor profile
INSERT INTO tutors (
  email,
  first_name,
  last_name,
  avatar_url,
  bio,
  subjects,
  hourly_rate,
  availability,
  rating,
  total_earnings,
  total_hours,
  is_verified,
  badges
) VALUES (
  'sarah_chen@hotmail.com',
  'Sarah',
  'Chen',
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
  'Experienced math and science tutor with a passion for helping students excel. Specializing in personalized learning strategies.',
  ARRAY['Mathematics', 'Physics', 'Chemistry'],
  75,
  jsonb_build_object(
    'monday', ARRAY['09:00-12:00', '14:00-18:00'],
    'tuesday', ARRAY['09:00-12:00', '14:00-18:00'],
    'wednesday', ARRAY['09:00-12:00', '14:00-18:00'],
    'thursday', ARRAY['09:00-12:00', '14:00-18:00'],
    'friday', ARRAY['09:00-12:00', '14:00-18:00']
  ),
  4.8,
  2125,
  50,
  true,
  ARRAY['math_expert', 'science_star', 'top_rated']
)
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name;

-- Get Sarah's tutor ID for the next steps
WITH sarah AS (
  SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com'
)
-- Step 2: Create students for Sarah
INSERT INTO students (
  tutor_id,
  first_name,
  last_name,
  email,
  grade,
  subjects,
  tags,
  is_active
)
SELECT 
  sarah.id,
  student.first_name,
  student.last_name,
  student.email,
  student.grade,
  student.subjects,
  student.tags,
  student.is_active
FROM sarah, (VALUES
  ('Alex', 'Johnson', 'alex.johnson@example.com', '11th Grade', ARRAY['Mathematics', 'Physics'], ARRAY['honors', 'ap'], true),
  ('Emma', 'Davis', 'emma.davis@example.com', '10th Grade', ARRAY['Chemistry', 'Mathematics'], ARRAY['struggling'], true),
  ('Michael', 'Brown', 'michael.brown@example.com', '12th Grade', ARRAY['Physics', 'Mathematics'], ARRAY['college-prep'], true),
  ('Sophie', 'Martinez', 'sophie.martinez@example.com', '9th Grade', ARRAY['Mathematics'], ARRAY['advanced'], true),
  ('Lucas', 'Wilson', 'lucas.wilson@example.com', '11th Grade', ARRAY['Chemistry'], ARRAY['exam-prep'], true)
) AS student(first_name, last_name, email, grade, subjects, tags, is_active)
ON CONFLICT (email) DO NOTHING;

-- Step 3: Get the student IDs for creating sessions
WITH sarah AS (
  SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com'
),
student_ids AS (
  SELECT 
    s.id,
    s.first_name,
    ROW_NUMBER() OVER (ORDER BY s.first_name) as num
  FROM students s
  JOIN sarah ON s.tutor_id = sarah.id
)
-- Create some completed sessions (for XP calculation)
INSERT INTO sessions (
  tutor_id,
  student_id,
  subject,
  scheduled_at,
  duration,
  status,
  price,
  is_paid,
  notes
)
SELECT 
  sarah.id,
  si.id,
  CASE (ROW_NUMBER() OVER ()) % 3
    WHEN 0 THEN 'Mathematics'
    WHEN 1 THEN 'Physics'
    ELSE 'Chemistry'
  END,
  NOW() - INTERVAL '1 day' * (ROW_NUMBER() OVER ()),
  120, -- 2 hours
  'completed',
  150,
  true,
  'Session completed successfully'
FROM sarah, student_ids si
CROSS JOIN generate_series(1, 5) -- 5 sessions per student
WHERE (ROW_NUMBER() OVER ()) <= 25 -- Total 25 completed sessions
ON CONFLICT DO NOTHING;

-- Step 4: Create one session for today
WITH sarah AS (
  SELECT id FROM tutors WHERE email = 'sarah_chen@hotmail.com'
),
alex AS (
  SELECT s.id 
  FROM students s 
  JOIN sarah ON s.tutor_id = sarah.id 
  WHERE s.first_name = 'Alex' 
  LIMIT 1
)
INSERT INTO sessions (
  tutor_id,
  student_id,
  subject,
  scheduled_at,
  duration,
  status,
  price,
  is_paid,
  notes
)
SELECT
  sarah.id,
  alex.id,
  'Mathematics',
  CURRENT_DATE + TIME '14:00:00',
  120,
  'scheduled',
  150,
  false,
  'Calculus review session'
FROM sarah, alex
ON CONFLICT DO NOTHING;

-- Step 5: Instructions for setting up Auth
SELECT 
  '✅ Demo data created successfully!' as message
UNION ALL
SELECT 
  '' as message
UNION ALL
SELECT 
  '📝 Next steps to enable login:' as message
UNION ALL
SELECT 
  '1. Go to Authentication > Users' as message
UNION ALL
SELECT 
  '2. Click "Add User" > "Create New User"' as message
UNION ALL
SELECT 
  '3. Email: sarah_chen@hotmail.com' as message
UNION ALL
SELECT 
  '4. Password: demo123' as message
UNION ALL
SELECT 
  '5. Auto Confirm User: ✓ (checked)' as message
UNION ALL
SELECT 
  '6. Copy the generated User ID' as message
UNION ALL
SELECT 
  '' as message
UNION ALL
SELECT 
  '7. Then run this SQL with the User ID:' as message
UNION ALL
SELECT 
  'UPDATE tutors SET auth_user_id = ''PASTE_USER_ID_HERE'' WHERE email = ''sarah_chen@hotmail.com'';' as message; 