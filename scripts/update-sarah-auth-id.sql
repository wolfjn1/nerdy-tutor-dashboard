-- Update Sarah Chen's tutor record with the correct auth_user_id
UPDATE tutors 
SET auth_user_id = 'ae70c119-d3e5-470e-8807-16f1b28aba45'
WHERE email = 'sarah_chen@hotmail.com';

-- Verify the update
SELECT id, email, first_name, last_name, auth_user_id 
FROM tutors 
WHERE email = 'sarah_chen@hotmail.com'; 