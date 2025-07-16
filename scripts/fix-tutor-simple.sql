-- First, check what columns exist in the tutors table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tutors' 
ORDER BY ordinal_position;

-- Create tutor with only basic fields
INSERT INTO tutors (
  auth_user_id,
  first_name,
  last_name,
  email,
  phone,
  bio,
  avatar_url,
  subjects,
  hourly_rate
) VALUES (
  'ae70c119-d3e5-470e-8807-16f1b28aba45',
  'Sarah',
  'Chen',
  'sarah_chen@hotmail.com',
  '+1 (555) 123-4567',
  'Experienced math and science tutor',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
  ARRAY['Math', 'Science'],
  75
)
ON CONFLICT (auth_user_id) 
DO UPDATE SET
  updated_at = NOW()
RETURNING *;

-- Verify the tutor was created
SELECT * FROM tutors WHERE auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45'; 