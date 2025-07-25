-- Insert Sarah Chen's tutor record for production
INSERT INTO tutors (
  id,
  auth_user_id,
  email,
  first_name,
  last_name,
  avatar_url,
  bio,
  subjects,
  hourly_rate,
  rating,
  total_earnings,
  total_hours,
  is_verified,
  badges,
  created_at,
  updated_at
) VALUES (
  'tutor-001',
  'ae70c119-d3e5-470e-8807-16f1b28aba45',
  'sarah_chen@hotmail.com',
  'Sarah',
  'Chen',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face',
  'Expert mathematics tutor with 5+ years of experience. Specializing in AP Calculus, SAT/ACT prep, and college-level mathematics.',
  ARRAY['Mathematics', 'Calculus', 'Algebra', 'SAT Math'],
  85,
  4.9,
  15750,
  185,
  true,
  ARRAY['Expert Tutor', 'Top Rated', 'Century Club', 'Perfect Week'],
  NOW(),
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  auth_user_id = EXCLUDED.auth_user_id,
  email = EXCLUDED.email;

-- Verify the insert
SELECT id, email, first_name, last_name, auth_user_id 
FROM tutors 
WHERE email = 'sarah_chen@hotmail.com'; 