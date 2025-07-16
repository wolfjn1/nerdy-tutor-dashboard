-- Minimal tutor insert with only essential fields
INSERT INTO tutors (
  auth_user_id,
  first_name,
  last_name,
  email
) VALUES (
  'ae70c119-d3e5-470e-8807-16f1b28aba45',
  'Sarah',
  'Chen',
  'sarah_chen@hotmail.com'
)
ON CONFLICT (auth_user_id) 
DO UPDATE SET
  first_name = 'Sarah',
  last_name = 'Chen',
  email = 'sarah_chen@hotmail.com',
  updated_at = NOW()
RETURNING *; 