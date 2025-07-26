import * as fs from 'fs'

async function createRLSPoliciesDirectly() {
  console.log('\nAttempting to create policies using direct approach...\n')
  
  // Since we can't execute raw SQL without the exec_sql RPC function,
  // we'll provide the SQL statements that need to be run
  console.log('Please run the following SQL commands in your Supabase SQL editor:\n')
  
  const sqlCommands = `
-- Enable RLS on all tables
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for all users" ON tutors;
DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON tutors;
DROP POLICY IF EXISTS "Tutors can view their students" ON students;
DROP POLICY IF EXISTS "Tutors can view their sessions" ON sessions;

-- Create policies for tutors table
CREATE POLICY "Users can view own tutor profile" 
ON tutors FOR SELECT 
USING (auth.uid() = auth_user_id);

CREATE POLICY "Tutors can update own profile" 
ON tutors FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- Create policies for students table
CREATE POLICY "Tutors can view their students" 
ON students FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage their students" 
ON students FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- Create policies for sessions table
CREATE POLICY "Tutors can view their sessions" 
ON sessions FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

CREATE POLICY "Tutors can manage their sessions" 
ON sessions FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- Verify the policies are working
SELECT COUNT(*) FROM tutors WHERE auth_user_id = auth.uid();
SELECT COUNT(*) FROM students WHERE tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid());
SELECT COUNT(*) FROM sessions WHERE tutor_id IN (SELECT id FROM tutors WHERE auth_user_id = auth.uid());
  `
  
  console.log(sqlCommands)
  
  // Save to file for easy copying
  const fs = require('fs')
  fs.writeFileSync('fix-rls-policies-manual.sql', sqlCommands)
  console.log('\n✅ SQL commands have been saved to: fix-rls-policies-manual.sql')
  console.log('Please run these commands in your Supabase SQL editor.')
}

createRLSPoliciesDirectly()
  .then(() => process.exit(0))
  .catch((error: Error) => {
    console.error('Fatal error:', error)
    process.exit(1)
  }) 