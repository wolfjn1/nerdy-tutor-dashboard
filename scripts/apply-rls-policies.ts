import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  },
  db: {
    schema: 'public'
  }
})

async function applyRLSPolicies() {
  console.log('Applying RLS Policies...\n')
  
  try {
    // We'll use the Supabase Management API through HTTP requests
    const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1]
    
    if (!projectRef) {
      console.error('Could not extract project reference from URL')
      console.log('\nPlease run these SQL commands manually in Supabase SQL Editor:\n')
      printSQLCommands()
      return
    }
    
    console.log(`Project Reference: ${projectRef}`)
    console.log('\nSince we cannot execute raw SQL directly, please run these commands in your Supabase SQL Editor:\n')
    printSQLCommands()
    
    // Also save to a file for easy copying
    const fs = require('fs')
    const sqlCommands = getSQLCommands()
    fs.writeFileSync('apply-rls-policies.sql', sqlCommands)
    console.log('\n✅ SQL commands saved to: apply-rls-policies.sql')
    console.log('Copy and paste these into your Supabase SQL Editor and execute them.')
    
    // Let's also verify what the current state is
    console.log('\n\nCurrent State Check:')
    console.log('===================')
    
    // Check if we can query as service role
    const { data: tutors, error: tutorError } = await supabase
      .from('tutors')
      .select('id')
      .limit(1)
      
    console.log(`Service role can query tutors: ${tutorError ? '❌ ' + tutorError.message : '✅'}`)
    
    // Check specific data
    const { data: sarahTutor } = await supabase
      .from('tutors')
      .select('*')
      .eq('auth_user_id', 'ae70c119-d3e5-470e-8807-16f1b28aba45')
      .single()
      
    if (sarahTutor) {
      const { count: studentCount } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true })
        .eq('tutor_id', sarahTutor.id)
        
      console.log(`Sarah has ${studentCount} students in the database`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  }
}

function getSQLCommands() {
  return `-- IMPORTANT: Run these commands in order

-- 1. First, check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('tutors', 'students', 'sessions');

-- 2. Enable RLS on all tables (if not already enabled)
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

-- 3. Drop any existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own tutor profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can update own profile" ON tutors;
DROP POLICY IF EXISTS "Tutors can view their students" ON students;
DROP POLICY IF EXISTS "Tutors can manage their students" ON students;
DROP POLICY IF EXISTS "Tutors can view their sessions" ON sessions;
DROP POLICY IF EXISTS "Tutors can manage their sessions" ON sessions;

-- 4. Create policy for tutors table - users can only see their own profile
CREATE POLICY "Users can view own tutor profile" 
ON tutors FOR SELECT 
USING (auth.uid() = auth_user_id);

-- 5. Create policy for tutors table - users can update their own profile
CREATE POLICY "Tutors can update own profile" 
ON tutors FOR UPDATE 
USING (auth.uid() = auth_user_id)
WITH CHECK (auth.uid() = auth_user_id);

-- 6. Create policy for students table - tutors can see their own students
CREATE POLICY "Tutors can view their students" 
ON students FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 7. Create policy for students table - tutors can manage their own students
CREATE POLICY "Tutors can manage their students" 
ON students FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 8. Create policy for sessions table - tutors can see their own sessions
CREATE POLICY "Tutors can view their sessions" 
ON sessions FOR SELECT 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 9. Create policy for sessions table - tutors can manage their own sessions
CREATE POLICY "Tutors can manage their sessions" 
ON sessions FOR ALL 
USING (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
)
WITH CHECK (
  tutor_id IN (
    SELECT id FROM tutors WHERE auth_user_id = auth.uid()
  )
);

-- 10. Verify the policies were created
SELECT 
  tablename,
  policyname,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('tutors', 'students', 'sessions')
ORDER BY tablename, policyname;

-- 11. Test with Sarah's account (this will show 0 in SQL editor but should work in app)
-- When Sarah is logged in, auth.uid() will return 'ae70c119-d3e5-470e-8807-16f1b28aba45'
SELECT 'Policies created successfully!' as status;`
}

function printSQLCommands() {
  console.log(getSQLCommands())
}

applyRLSPolicies().then(() => process.exit(0)) 