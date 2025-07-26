import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkRLSStatus() {
  console.log('Checking RLS Status and Policies\n')
  
  // Check if we can query tutors table
  console.log('RLS Status Check:')
  
  // Try to query with service role key (bypasses RLS)
  const { data: serviceRoleTest, error: serviceError } = await supabase
    .from('tutors')
    .select('id')
    .limit(1)
    
  if (serviceError) {
    console.log('  Error accessing tutors table:', serviceError.message)
  } else if (serviceRoleTest) {
    console.log('  Service role can access tutors table ✅')
    
    // Now let's check if RLS is blocking regular access
    // We'll check by looking for policies - if RLS is enabled with no policies, nothing can be accessed
    const { data: policies } = await supabase
      .from('pg_policies')
      .select('*')
      .eq('schemaname', 'public')
      .eq('tablename', 'tutors')
      
    if (!policies || policies.length === 0) {
      console.log('  WARNING: No RLS policies found on tutors table!')
      console.log('  If RLS is enabled, this will block all access')
    }
  }
  
  // Check policies on tutors table
  const { data: policies } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('schemaname', 'public')
    .eq('tablename', 'tutors')
  
  console.log('\nPolicies on tutors table:')
  if (policies && policies.length > 0) {
    policies.forEach(policy => {
      console.log(`  - ${policy.policyname}: ${policy.cmd} (${policy.permissive})`)
      console.log(`    Using: ${policy.qual || 'N/A'}`)
    })
  } else {
    console.log('  No policies found!')
  }
  
  // Test data access with service role (bypasses RLS)
  const { count: tutorCount } = await supabase
    .from('tutors')
    .select('*', { count: 'exact', head: true })
    
  console.log(`\nTotal tutors in database: ${tutorCount}`)
  
  // Check if Sarah's tutor record exists
  const { data: sarah } = await supabase
    .from('tutors')
    .select('*')
    .eq('auth_user_id', 'ae70c119-d3e5-470e-8807-16f1b28aba45')
    .single()
    
  if (sarah) {
    console.log('\nSarah\'s tutor record found:')
    console.log(`  ID: ${sarah.id}`)
    console.log(`  Name: ${sarah.first_name} ${sarah.last_name}`)
    console.log(`  Auth User ID: ${sarah.auth_user_id}`)
  }
  
  // Check students table RLS
  const { data: studentsPolicies } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('schemaname', 'public')
    .eq('tablename', 'students')
    
  console.log('\nPolicies on students table:')
  if (studentsPolicies && studentsPolicies.length > 0) {
    studentsPolicies.forEach(policy => {
      console.log(`  - ${policy.policyname}: ${policy.cmd}`)
    })
  } else {
    console.log('  No policies found!')
  }
}

checkRLSStatus().then(() => process.exit(0)) 