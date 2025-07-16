const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function createDemoTutor() {
  console.log('Creating Sarah Chen demo tutor...\n')
  
  try {
    // Create Sarah Chen tutor profile
    const tutorData = {
      email: 'sarah_chen@hotmail.com',
      first_name: 'Sarah',
      last_name: 'Chen',
      avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face',
      bio: 'Experienced math and science tutor with a passion for helping students excel. Specializing in personalized learning strategies.',
      subjects: ['Mathematics', 'Physics', 'Chemistry'],
      hourly_rate: 75,
      availability: {
        monday: ['09:00-12:00', '14:00-18:00'],
        tuesday: ['09:00-12:00', '14:00-18:00'],
        wednesday: ['09:00-12:00', '14:00-18:00'],
        thursday: ['09:00-12:00', '14:00-18:00'],
        friday: ['09:00-12:00', '14:00-18:00']
      },
      rating: 4.8,
      total_earnings: 2125,
      total_hours: 25 * 2, // 25 completed sessions * 2 hours each
      is_verified: true,
      badges: ['math_expert', 'science_star', 'top_rated'],
      // We'll set auth_user_id later after creating the auth account
    }
    
    const { data: tutor, error } = await supabase
      .from('tutors')
      .insert(tutorData)
      .select()
      .single()
    
    if (error) {
      console.error('Error creating tutor:', error)
      return
    }
    
    console.log('✅ Created tutor profile:')
    console.log(`   Name: ${tutor.first_name} ${tutor.last_name}`)
    console.log(`   Email: ${tutor.email}`)
    console.log(`   ID: ${tutor.id}`)
    
    console.log('\n📝 Next steps:')
    console.log('1. Go to your Supabase Dashboard > Authentication > Users')
    console.log('2. Click "Add User" > "Create New User"')
    console.log('3. Enter:')
    console.log('   - Email: sarah_chen@hotmail.com')
    console.log('   - Password: demo123')
    console.log('   - Auto Confirm User: ✓ (checked)')
    console.log('4. After creating, copy the User ID')
    console.log('5. Go to SQL Editor and run:')
    console.log(`   UPDATE tutors SET auth_user_id = 'PASTE_USER_ID_HERE' WHERE id = '${tutor.id}';`)
    console.log('\nAlternatively, you can update the auth_user_id in the Table Editor.')
    
  } catch (error) {
    console.error('Error:', error)
  }
}

createDemoTutor() 