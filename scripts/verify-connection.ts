import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

console.log('Environment variables:')
console.log('SUPABASE_URL:', supabaseUrl)
console.log('SUPABASE_ANON_KEY:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyConnection() {
  // Test basic connection
  const { data, error } = await supabase
    .from('tutors')
    .select('count', { count: 'exact', head: true })
    
  console.log('\nTutors table count:', data)
  
  // Check students
  const { count: studentCount } = await supabase
    .from('students')
    .select('*', { count: 'exact', head: true })
    
  console.log('Students table count:', studentCount)
  
  // Check sessions
  const { count: sessionCount } = await supabase
    .from('sessions')
    .select('*', { count: 'exact', head: true })
    
  console.log('Sessions table count:', sessionCount)
}

verifyConnection().then(() => process.exit(0))
