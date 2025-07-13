import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables!')
  console.log('\nMake sure your .env.local file contains:')
  console.log('NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  console.log('SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkTestAccounts() {
  console.log('🔍 Checking for test accounts...\n')
  
  try {
    // Check if tutors table exists and has data
    const { data: tutors, error: tutorError } = await supabase
      .from('tutors')
      .select('id, email, first_name, last_name, auth_user_id')
      .limit(5)
    
    if (tutorError) {
      if (tutorError.message.includes('relation "public.tutors" does not exist')) {
        console.error('❌ The tutors table does not exist!')
        console.log('\n📝 To fix this:')
        console.log('1. Go to your Supabase dashboard')
        console.log('2. Navigate to SQL Editor')
        console.log('3. Copy and run the contents of lib/supabase-schema.sql')
        return
      }
      throw tutorError
    }
    
    if (!tutors || tutors.length === 0) {
      console.log('❌ No tutors found in the database!')
      console.log('\n📝 To create test data:')
      console.log('1. Run: npm run seed')
      console.log('2. Then run: npm run seed:auth')
      return
    }
    
    console.log(`✅ Found ${tutors.length} tutor(s) in the database:\n`)
    
    // Check which ones have authentication set up
    for (const tutor of tutors) {
      const hasAuth = tutor.auth_user_id ? '✅' : '❌'
      console.log(`${hasAuth} ${tutor.email} - ${tutor.first_name} ${tutor.last_name}`)
      
      if (!tutor.auth_user_id) {
        console.log(`   ⚠️  No auth set up - run 'npm run seed:auth' to fix`)
      }
    }
    
    // Check if we can authenticate with a test account
    console.log('\n🔐 Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'sarah_chen@hotmail.com',
      password: 'demo123'
    })
    
    if (authError) {
      console.log('❌ Cannot login with sarah_chen@hotmail.com / demo123')
      console.log(`   Error: ${authError.message}`)
      console.log('\n📝 To fix: Run "npm run seed:auth" to create authentication for test users')
    } else {
      console.log('✅ Successfully authenticated with test account!')
      console.log('\n🎉 You can now login with:')
      console.log('   Email: sarah_chen@hotmail.com')
      console.log('   Password: demo123')
      
      // Sign out to clean up
      await supabase.auth.signOut()
    }
    
  } catch (error) {
    console.error('❌ Error checking test accounts:', error)
  }
}

checkTestAccounts() 