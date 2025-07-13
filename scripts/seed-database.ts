import { createClient } from '@supabase/supabase-js'
import { faker } from '@faker-js/faker'
import * as dotenv from 'dotenv'

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' })

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables!')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper functions
const randomElement = <T>(array: T[]): T => array[Math.floor(Math.random() * array.length)]
const randomElements = <T>(array: T[], count: number): T[] => {
  const shuffled = [...array].sort(() => 0.5 - Math.random())
  return shuffled.slice(0, count)
}

// Data constants
const SUBJECTS = [
  'Mathematics', 'Algebra', 'Geometry', 'Calculus', 'Statistics',
  'Physics', 'Chemistry', 'Biology', 'General Science',
  'English', 'Literature', 'Writing', 'ESL',
  'History', 'Geography', 'Social Studies',
  'Computer Science', 'Programming', 'Web Development',
  'Spanish', 'French', 'Mandarin',
  'Music Theory', 'Piano', 'Guitar',
  'Art', 'Drawing', 'Painting'
]

const GRADES = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', 'College']

const TUTOR_SPECIALIZATIONS = [
  { name: 'Dr. Sarah Chen', subjects: ['Mathematics', 'Calculus', 'Statistics'], bio: 'PhD in Mathematics with 10+ years teaching experience. Specializes in advanced math and test prep.' },
  { name: 'Prof. Michael Rodriguez', subjects: ['Physics', 'Mathematics', 'Chemistry'], bio: 'Former university professor passionate about making science accessible to all students.' },
  { name: 'Emily Thompson', subjects: ['English', 'Literature', 'Writing', 'ESL'], bio: 'Published author and English teacher helping students find their voice through writing.' },
  { name: 'James Liu', subjects: ['Computer Science', 'Programming', 'Web Development', 'Mathematics'], bio: 'Software engineer turned educator, teaching coding to the next generation.' },
  { name: 'Maria García', subjects: ['Spanish', 'French', 'ESL', 'Literature'], bio: 'Native Spanish speaker with certifications in multiple languages and cultural studies.' },
  { name: 'Dr. Robert Johnson', subjects: ['Chemistry', 'Biology', 'General Science'], bio: 'Research scientist bringing real-world laboratory experience to student learning.' },
  { name: 'Alexandra Foster', subjects: ['Music Theory', 'Piano', 'Guitar'], bio: 'Juilliard graduate helping students discover their musical talents.' },
  { name: 'David Kim', subjects: ['History', 'Geography', 'Social Studies', 'English'], bio: 'Former journalist with a passion for bringing history to life through storytelling.' },
  { name: 'Sophie Patel', subjects: ['Art', 'Drawing', 'Painting', 'Art History'], bio: 'Professional artist and gallery curator nurturing creative expression in students.' },
  { name: 'Thomas Anderson', subjects: ['Algebra', 'Geometry', 'General Science', 'Physics'], bio: 'High school teacher of the year, specializing in building strong foundations in STEM.' }
]

const SESSION_STATUS_WEIGHTS = {
  'completed': 0.7,
  'scheduled': 0.2,
  'cancelled': 0.05,
  'no_show': 0.05
}

const HOMEWORK_STATUS_WEIGHTS = {
  'completed': 0.6,
  'in_progress': 0.2,
  'assigned': 0.15,
  'late': 0.03,
  'missing': 0.02
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...')
  
  // Delete in reverse order of dependencies
  const tables = [
    'notifications',
    'xp_activities',
    'tutor_achievements',
    'payments',
    'invoice_sessions',
    'invoices',
    'messages',
    'conversation_participants',
    'conversations',
    'homework_submissions',
    'homework',
    'assessments',
    'activities',
    'lesson_plans',
    'sessions',
    'student_contacts',
    'students',
    'tutors'
  ]

  for (const table of tables) {
    const { error } = await supabase.from(table).delete().gte('id', '00000000-0000-0000-0000-000000000000')
    if (error) console.error(`Error clearing ${table}:`, error.message)
  }
}

async function createTutors() {
  console.log('👩‍🏫 Creating tutors...')
  const tutors = []

  for (let i = 0; i < TUTOR_SPECIALIZATIONS.length; i++) {
    const spec = TUTOR_SPECIALIZATIONS[i]
    const [firstName, lastName] = spec.name.replace('Dr. ', '').replace('Prof. ', '').split(' ')
    
    const tutor = {
      id: faker.string.uuid(),
      first_name: firstName,
      last_name: lastName,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      avatar_url: faker.image.avatar(),
      bio: spec.bio,
      subjects: spec.subjects,
      hourly_rate: faker.number.int({ min: 40, max: 150 }),
      rating: faker.number.float({ min: 4.2, max: 5.0, fractionDigits: 1 }),
      total_earnings: faker.number.int({ min: 5000, max: 50000 }),
      total_hours: faker.number.int({ min: 100, max: 1000 }),
      is_verified: true,
      badges: randomElements(['expert', 'top-rated', 'quick-responder', 'patient-teacher'], faker.number.int({ min: 1, max: 3 })),
      phone: faker.phone.number(),
      timezone: randomElement(['PST', 'EST', 'CST', 'MST']),
      language: 'en',
      availability: generateAvailability()
    }
    
    tutors.push(tutor)
  }

  const { error } = await supabase.from('tutors').insert(tutors)
  if (error) throw error
  
  console.log(`✅ Created ${tutors.length} tutors`)
  return tutors
}

function generateAvailability() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  const availability: Record<string, string[]> = {}
  
  days.forEach(day => {
    if (Math.random() > 0.3) { // 70% chance of being available
      const slots = []
      const numSlots = faker.number.int({ min: 1, max: 3 })
      
      for (let i = 0; i < numSlots; i++) {
        const startHour = faker.number.int({ min: 8, max: 18 })
        const duration = faker.number.int({ min: 2, max: 4 })
        slots.push(`${startHour}:00-${Math.min(startHour + duration, 21)}:00`)
      }
      
      availability[day] = slots
    }
  })
  
  return availability
}

async function createStudents(tutors: any[]) {
  console.log('👨‍🎓 Creating students...')
  const students = []
  const studentContacts = []

  for (const tutor of tutors) {
    const numStudents = faker.number.int({ min: 5, max: 20 })
    
    for (let i = 0; i < numStudents; i++) {
      const student = {
        id: faker.string.uuid(),
        tutor_id: tutor.id,
        first_name: faker.person.firstName(),
        last_name: faker.person.lastName(),
        avatar_url: faker.image.avatar(),
        grade: randomElement(GRADES),
        subjects: randomElements(tutor.subjects, faker.number.int({ min: 1, max: 3 })),
        notes: faker.lorem.sentence(),
        tags: randomElements(['struggling', 'advanced', 'test-prep', 'homework-help', 'gifted'], faker.number.int({ min: 1, max: 3 })),
        attendance_rate: faker.number.int({ min: 75, max: 100 }),
        performance_rate: faker.number.int({ min: 60, max: 100 }),
        engagement_rate: faker.number.int({ min: 70, max: 100 }),
        total_sessions: faker.number.int({ min: 5, max: 100 }),
        completed_sessions: faker.number.int({ min: 4, max: 95 }),
        is_active: Math.random() > 0.1 // 90% active
      }
      
      students.push(student)
      
      // Create parent contact
      const contact = {
        id: faker.string.uuid(),
        student_id: student.id,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        relationship: randomElement(['parent', 'guardian'] as any),
        is_primary: true
      }
      
      studentContacts.push(contact)
    }
  }

  const { error: studentError } = await supabase.from('students').insert(students)
  if (studentError) throw studentError
  
  const { error: contactError } = await supabase.from('student_contacts').insert(studentContacts)
  if (contactError) throw contactError
  
  console.log(`✅ Created ${students.length} students with contacts`)
  return students
}

async function createSessions(tutors: any[], students: any[]) {
  console.log('📅 Creating sessions...')
  const sessions = []
  const now = new Date()

  for (const student of students) {
    const tutor = tutors.find(t => t.id === student.tutor_id)
    const numSessions = faker.number.int({ min: 10, max: 50 })
    
    for (let i = 0; i < numSessions; i++) {
      // Create sessions ranging from 3 months ago to 2 months in the future
      const daysOffset = faker.number.int({ min: -90, max: 60 })
      const sessionDate = new Date(now)
      sessionDate.setDate(sessionDate.getDate() + daysOffset)
      
      // Set random time between 8 AM and 8 PM
      sessionDate.setHours(faker.number.int({ min: 8, max: 20 }), 0, 0, 0)
      
      // Determine status based on date
      let status: string
      if (sessionDate < now) {
        status = randomElement(Object.entries(SESSION_STATUS_WEIGHTS)
          .filter(([s]) => s !== 'scheduled')
          .flatMap(([s, weight]) => Array(Math.floor(weight * 100)).fill(s)))
      } else {
        status = 'scheduled'
      }
      
      const session = {
        id: faker.string.uuid(),
        student_id: student.id,
        tutor_id: tutor.id,
        subject: randomElement(student.subjects),
        scheduled_at: sessionDate.toISOString(),
        duration: randomElement([30, 45, 60, 90, 120]),
        status,
        notes: status === 'completed' ? faker.lorem.sentence() : null,
        rating: status === 'completed' ? faker.number.int({ min: 3, max: 5 }) : null,
        earnings: null as number | null,
        meeting_link: 'https://meet.nerdy-tutor.com/' + faker.string.alphanumeric(10)
      }
      
      // Set earnings after session object is created
      if (status === 'completed') {
        session.earnings = tutor.hourly_rate * session.duration / 60
      }
      
      sessions.push(session)
    }
  }

  const { error } = await supabase.from('sessions').insert(sessions)
  if (error) throw error
  
  console.log(`✅ Created ${sessions.length} sessions`)
  return sessions
}

async function createLessonPlans(tutors: any[], sessions: any[]) {
  console.log('📚 Creating lesson plans...')
  const lessonPlans = []
  const activities = []
  const assessments = []

  // Create some template lesson plans
  for (const tutor of tutors) {
    const numTemplates = faker.number.int({ min: 2, max: 5 })
    
    for (let i = 0; i < numTemplates; i++) {
      const subject = randomElement(tutor.subjects)
      const lessonPlan = {
        id: faker.string.uuid(),
        tutor_id: tutor.id,
        title: `${subject} - ${faker.lorem.words(3)}`,
        subject,
        grade: randomElement(GRADES),
        duration: randomElement([45, 60, 90]),
        objectives: Array.from({ length: faker.number.int({ min: 2, max: 4 }) }, 
          () => faker.lorem.sentence()),
        materials: Array.from({ length: faker.number.int({ min: 1, max: 5 }) },
          () => faker.commerce.productName()),
        is_template: true
      }
      
      lessonPlans.push(lessonPlan)
      
      // Add activities
      const numActivities = faker.number.int({ min: 2, max: 5 })
      for (let j = 0; j < numActivities; j++) {
        activities.push({
          id: faker.string.uuid(),
          lesson_plan_id: lessonPlan.id,
          title: faker.lorem.words(3),
          description: faker.lorem.paragraph(),
          duration: faker.number.int({ min: 10, max: 30 }),
          type: randomElement(['explanation', 'practice', 'discussion', 'assessment']),
          resources: Array.from({ length: faker.number.int({ min: 1, max: 3 }) },
            () => faker.lorem.word()),
          order_index: j
        })
      }
      
      // Add assessments
      if (Math.random() > 0.5) {
        assessments.push({
          id: faker.string.uuid(),
          lesson_plan_id: lessonPlan.id,
          title: faker.lorem.words(3),
          type: randomElement(['quiz', 'worksheet', 'project', 'discussion']),
          points: faker.number.int({ min: 10, max: 100 }),
          description: faker.lorem.paragraph()
        })
      }
    }
  }

  // Link some lesson plans to sessions
  const completedSessions = sessions.filter(s => s.status === 'completed')
  for (const session of completedSessions.slice(0, Math.floor(completedSessions.length * 0.3))) {
    const tutor = tutors.find(t => t.id === session.tutor_id)
    const lessonPlan = {
      id: faker.string.uuid(),
      tutor_id: tutor.id,
      session_id: session.id,
      title: `${session.subject} - Session Plan`,
      subject: session.subject,
      grade: randomElement(GRADES),
      duration: session.duration,
      objectives: Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, 
        () => faker.lorem.sentence()),
      materials: Array.from({ length: faker.number.int({ min: 1, max: 3 }) },
        () => faker.commerce.productName()),
      is_template: false
    }
    
    lessonPlans.push(lessonPlan)
  }

  const { error: lpError } = await supabase.from('lesson_plans').insert(lessonPlans)
  if (lpError) throw lpError
  
  const { error: actError } = await supabase.from('activities').insert(activities)
  if (actError) console.error('Activities error:', actError)
  
  const { error: assError } = await supabase.from('assessments').insert(assessments)
  if (assError) console.error('Assessments error:', assError)
  
  console.log(`✅ Created ${lessonPlans.length} lesson plans`)
  return lessonPlans
}

async function createHomework(tutors: any[], students: any[], sessions: any[]) {
  console.log('📝 Creating homework...')
  const homework = []
  const submissions = []

  // Create homework for some completed and scheduled sessions
  const eligibleSessions = sessions.filter(s => ['completed', 'scheduled'].includes(s.status))
  
  for (const session of eligibleSessions) {
    if (Math.random() > 0.6) continue // 40% of sessions have homework
    
    const student = students.find(s => s.id === session.student_id)
    const dueDate = new Date(session.scheduled_at)
    dueDate.setDate(dueDate.getDate() + faker.number.int({ min: 2, max: 7 }))
    
    const hw = {
      id: faker.string.uuid(),
      student_id: student.id,
      session_id: session.id,
      tutor_id: session.tutor_id,
      title: faker.lorem.words(4),
      description: faker.lorem.paragraph(),
      subject: session.subject,
      due_date: dueDate.toISOString().split('T')[0],
      status: session.status === 'completed' 
        ? randomElement(Object.entries(HOMEWORK_STATUS_WEIGHTS)
            .flatMap(([s, weight]) => Array(Math.floor(weight * 100)).fill(s)))
        : 'assigned',
      attachments: Math.random() > 0.7 
        ? [`worksheet-${faker.string.alphanumeric(8)}.pdf`]
        : [],
      feedback: null as string | null,
      grade: null as number | null
    }
    
    // Add feedback and grade for completed homework
    if (['completed', 'late'].includes(hw.status)) {
      hw.feedback = faker.lorem.sentence()
      hw.grade = faker.number.int({ min: 70, max: 100 })
      
      // Create submission
      submissions.push({
        id: faker.string.uuid(),
        homework_id: hw.id,
        student_id: student.id,
        content: faker.lorem.paragraph(),
        attachments: Math.random() > 0.5 
          ? [`submission-${faker.string.alphanumeric(8)}.pdf`]
          : [],
        is_late: hw.status === 'late',
        submitted_at: new Date(dueDate.getTime() - (hw.status === 'late' ? -86400000 : 86400000)).toISOString()
      })
    }
    
    homework.push(hw)
  }

  const { error: hwError } = await supabase.from('homework').insert(homework)
  if (hwError) throw hwError
  
  if (submissions.length > 0) {
    const { error: subError } = await supabase.from('homework_submissions').insert(submissions)
    if (subError) console.error('Submissions error:', subError)
  }
  
  console.log(`✅ Created ${homework.length} homework assignments`)
  return homework
}

async function createMessagesAndConversations(tutors: any[], students: any[]) {
  console.log('💬 Creating conversations and messages...')
  const conversations = []
  const participants = []
  const messages = []

  // Create conversations between tutors and their active students
  for (const tutor of tutors) {
    const tutorStudents = students.filter(s => s.tutor_id === tutor.id && s.is_active)
    const numConversations = Math.min(tutorStudents.length, faker.number.int({ min: 3, max: 8 }))
    
    for (let i = 0; i < numConversations; i++) {
      const student = tutorStudents[i]
      const conversationId = faker.string.uuid()
      
      conversations.push({
        id: conversationId
      })
      
      // Add participants
      participants.push({
        id: faker.string.uuid(),
        conversation_id: conversationId,
        tutor_id: tutor.id,
        student_id: null,
        unread_count: faker.number.int({ min: 0, max: 3 })
      })
      
      participants.push({
        id: faker.string.uuid(),
        conversation_id: conversationId,
        tutor_id: null,
        student_id: student.id,
        unread_count: faker.number.int({ min: 0, max: 5 })
      })
      
      // Create messages
      const numMessages = faker.number.int({ min: 5, max: 20 })
      const startDate = faker.date.past({ years: 0.5 })
      
      for (let j = 0; j < numMessages; j++) {
        const isTutorSender = Math.random() > 0.5
        const messageDate = new Date(startDate.getTime() + (j * 3600000 * faker.number.int({ min: 1, max: 48 })))
        
        messages.push({
          id: faker.string.uuid(),
          conversation_id: conversationId,
          sender_tutor_id: isTutorSender ? tutor.id : null,
          sender_student_id: isTutorSender ? null : student.id,
          content: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
          attachments: Math.random() > 0.9 
            ? [`document-${faker.string.alphanumeric(8)}.pdf`]
            : [],
          is_read: j < numMessages - 3, // Last few messages might be unread
          created_at: messageDate.toISOString()
        })
      }
    }
  }

  const { error: convError } = await supabase.from('conversations').insert(conversations)
  if (convError) throw convError
  
  const { error: partError } = await supabase.from('conversation_participants').insert(participants)
  if (partError) throw partError
  
  const { error: msgError } = await supabase.from('messages').insert(messages)
  if (msgError) throw msgError
  
  console.log(`✅ Created ${conversations.length} conversations with ${messages.length} messages`)
  return { conversations, messages }
}

async function createInvoicesAndPayments(tutors: any[], students: any[], sessions: any[]) {
  console.log('💰 Creating invoices and payments...')
  const invoices = []
  const invoiceSessions = []
  const payments = []

  for (const tutor of tutors) {
    const tutorStudents = students.filter(s => s.tutor_id === tutor.id)
    
    for (const student of tutorStudents.slice(0, Math.min(5, tutorStudents.length))) {
      // Get completed sessions for this student
      const completedSessions = sessions.filter(s => 
        s.student_id === student.id && 
        s.status === 'completed' &&
        s.earnings > 0
      )
      
      if (completedSessions.length === 0) continue
      
      // Group sessions by month
      const sessionsByMonth = completedSessions.reduce((acc, session) => {
        const month = new Date(session.scheduled_at).toISOString().slice(0, 7)
        if (!acc[month]) acc[month] = []
        acc[month].push(session)
        return acc
      }, {} as Record<string, typeof completedSessions>)
      
      // Create invoices for each month
      for (const [month, monthSessions] of Object.entries(sessionsByMonth)) {
        const invoiceId = faker.string.uuid()
                 const amount = (monthSessions as any[]).reduce((sum: number, s: any) => sum + (s.earnings || 0), 0)
        const tax = amount * 0.1 // 10% tax
        const total = amount + tax
        
        const issueDate = new Date(month + '-01')
        issueDate.setMonth(issueDate.getMonth() + 1) // Issue at start of next month
        
        const invoice = {
          id: invoiceId,
          invoice_number: `INV-${faker.string.numeric(6)}`,
          tutor_id: tutor.id,
          student_id: student.id,
          amount,
          tax,
          total,
          status: randomElement(['paid', 'sent', 'overdue']),
          issue_date: issueDate.toISOString().split('T')[0],
          due_date: new Date(issueDate.getTime() + (14 * 86400000)).toISOString().split('T')[0], // Due in 14 days
          paid_date: null as string | null,
          payment_method: null as string | null,
          notes: `Invoice for ${month} tutoring sessions`
        }
        
        // If paid, add payment details
        if (invoice.status === 'paid') {
          invoice.paid_date = new Date(issueDate.getTime() + (faker.number.int({ min: 1, max: 14 }) * 86400000)).toISOString().split('T')[0]
          invoice.payment_method = randomElement(['credit_card', 'bank_transfer'])
          
          payments.push({
            id: faker.string.uuid(),
            invoice_id: invoiceId,
            amount: total,
            method: invoice.payment_method,
            status: 'completed',
            transaction_id: faker.string.alphanumeric(16).toUpperCase(),
            notes: null,
            processed_at: invoice.paid_date + 'T12:00:00Z'
          })
        }
        
        invoices.push(invoice)
        
                 // Link sessions to invoice
         for (const session of monthSessions as any[]) {
          invoiceSessions.push({
            id: faker.string.uuid(),
            invoice_id: invoiceId,
            session_id: session.id
          })
        }
      }
    }
  }

  const { error: invError } = await supabase.from('invoices').insert(invoices)
  if (invError) throw invError
  
  const { error: invSessError } = await supabase.from('invoice_sessions').insert(invoiceSessions)
  if (invSessError) console.error('Invoice sessions error:', invSessError)
  
  if (payments.length > 0) {
    const { error: payError } = await supabase.from('payments').insert(payments)
    if (payError) console.error('Payments error:', payError)
  }
  
  console.log(`✅ Created ${invoices.length} invoices with ${payments.length} payments`)
  return { invoices, payments }
}

async function createOpportunities() {
  console.log('🎯 Creating opportunities...')
  const opportunities = []

  const opportunityTemplates = [
    { subject: 'Calculus', level: 'AP/College', urgency: 'high', needs: 'Struggling with derivatives and integrals. AP exam in 2 months.' },
    { subject: 'Chemistry', level: 'High School', urgency: 'medium', needs: 'Need help with organic chemistry concepts and lab reports.' },
    { subject: 'English', level: 'Middle School', urgency: 'low', needs: 'Looking to improve essay writing and reading comprehension.' },
    { subject: 'Spanish', level: 'Beginner', urgency: 'medium', needs: 'Adult learner preparing for business trip to Spain.' },
    { subject: 'Programming', level: 'Intermediate', urgency: 'high', needs: 'Computer science student needs help with data structures.' },
    { subject: 'Physics', level: 'AP/College', urgency: 'critical', needs: 'Finals next week! Need intensive review sessions.' },
    { subject: 'Algebra', level: 'High School', urgency: 'medium', needs: 'Freshman struggling with quadratic equations.' },
    { subject: 'Piano', level: 'Intermediate', urgency: 'low', needs: 'Preparing for grade 5 ABRSM examination.' },
    { subject: 'Biology', level: 'Pre-med', urgency: 'high', needs: 'MCAT preparation focusing on cellular biology.' },
    { subject: 'History', level: 'AP', urgency: 'medium', needs: 'AP US History exam prep and essay writing.' },
    { subject: 'Mathematics', level: 'Elementary', urgency: 'medium', needs: '4th grader needs help with fractions and word problems.' },
    { subject: 'Web Development', level: 'Beginner', urgency: 'low', needs: 'Career changer learning HTML, CSS, and JavaScript.' },
    { subject: 'French', level: 'Intermediate', urgency: 'high', needs: 'Exchange student program interview in 3 weeks.' },
    { subject: 'Geometry', level: 'High School', urgency: 'medium', needs: 'Visual learner struggling with proofs.' },
    { subject: 'Literature', level: 'College', urgency: 'critical', needs: 'Term paper on Shakespeare due in 5 days!' }
  ]

  for (const template of opportunityTemplates) {
    const opportunity = {
      id: faker.string.uuid(),
      student_name: faker.person.fullName(),
      student_avatar: faker.image.avatar(),
      student_level: template.level,
      subject: template.subject,
      duration: randomElement([30, 45, 60, 90]),
      frequency: randomElement(['1x per week', '2x per week', '3x per week', 'As needed']),
      urgency: template.urgency as any,
      pay_rate: faker.number.int({ min: 30, max: 100 }),
      start_date: faker.date.future({ years: 0.1 }).toISOString().split('T')[0],
      preferred_times: randomElements([
        'Monday 3-5pm',
        'Tuesday 4-6pm',
        'Wednesday 3-5pm',
        'Thursday 4-6pm',
        'Friday 3-5pm',
        'Saturday 10am-12pm',
        'Sunday 2-4pm',
        'Weekday evenings',
        'Weekend mornings'
      ], faker.number.int({ min: 2, max: 4 })),
      needs: template.needs,
      match_score: faker.number.int({ min: 65, max: 98 }),
      is_active: true
    }
    
    opportunities.push(opportunity)
  }

  const { error } = await supabase.from('opportunities').insert(opportunities)
  if (error) throw error
  
  console.log(`✅ Created ${opportunities.length} opportunities`)
  return opportunities
}

async function createAchievementsAndNotifications(tutors: any[]) {
  console.log('🏆 Creating achievements and notifications...')
  
  // Create base achievements
  const achievements = [
    { title: 'First Session', description: 'Complete your first tutoring session', icon: '🎯', type: 'milestone', xp_reward: 100, condition_type: 'sessions_count', condition_value: 1, rarity: 'common' },
    { title: 'Rising Star', description: 'Complete 10 tutoring sessions', icon: '⭐', type: 'milestone', xp_reward: 500, condition_type: 'sessions_count', condition_value: 10, rarity: 'common' },
    { title: 'Veteran Tutor', description: 'Complete 100 tutoring sessions', icon: '🏅', type: 'milestone', xp_reward: 2000, condition_type: 'sessions_count', condition_value: 100, rarity: 'rare' },
    { title: 'Week Warrior', description: 'Maintain a 7-day teaching streak', icon: '🔥', type: 'streak', xp_reward: 300, condition_type: 'streak_days', condition_value: 7, rarity: 'common' },
    { title: 'Highly Rated', description: 'Maintain a 4.8+ rating', icon: '🌟', type: 'performance', xp_reward: 1000, condition_type: 'student_rating', condition_value: 48, rarity: 'rare' },
    { title: 'Subject Master', description: 'Teach 50 hours in a single subject', icon: '📚', type: 'milestone', xp_reward: 1500, condition_type: 'hours_taught', condition_value: 50, rarity: 'rare' },
    { title: 'Early Bird', description: 'Complete 20 morning sessions (before 10 AM)', icon: '🌅', type: 'milestone', xp_reward: 600, condition_type: 'sessions_count', condition_value: 20, rarity: 'common' },
    { title: 'Night Owl', description: 'Complete 20 evening sessions (after 6 PM)', icon: '🦉', type: 'milestone', xp_reward: 600, condition_type: 'sessions_count', condition_value: 20, rarity: 'common' },
    { title: 'Student Favorite', description: 'Receive 10 5-star ratings', icon: '💝', type: 'performance', xp_reward: 800, condition_type: 'student_rating', condition_value: 10, rarity: 'rare' },
    { title: 'Knowledge Sharer', description: 'Create 10 lesson plan templates', icon: '🎓', type: 'milestone', xp_reward: 1200, condition_type: 'sessions_count', condition_value: 10, rarity: 'epic' }
  ]

  const { data: achievementData, error: achError } = await supabase
    .from('achievements')
    .insert(achievements)
    .select()
  
  if (achError) throw achError

  // Assign achievements to tutors
  const tutorAchievements = []
  const xpActivities = []
  const notifications = []

  for (const tutor of tutors) {
    // Randomly assign some achievements
    const numAchievements = faker.number.int({ min: 2, max: 6 })
    const selectedAchievements = randomElements(achievementData, numAchievements)
    
    for (const achievement of selectedAchievements) {
      const progress = achievement.condition_value
      const unlocked = Math.random() > 0.3 // 70% chance of being unlocked
      
      tutorAchievements.push({
        id: faker.string.uuid(),
        tutor_id: tutor.id,
        achievement_id: achievement.id,
        progress: unlocked ? progress : faker.number.int({ min: 1, max: Math.max(1, progress - 1) }),
        unlocked_at: unlocked ? faker.date.past({ years: 0.5 }).toISOString() : null
      })
      
      if (unlocked) {
        // Create XP activity
        xpActivities.push({
          id: faker.string.uuid(),
          tutor_id: tutor.id,
          action: `Unlocked achievement: ${achievement.title}`,
          amount: achievement.xp_reward,
          source: 'achievement',
          created_at: faker.date.past({ years: 0.5 }).toISOString()
        })
      }
    }
    
    // Create some notifications
    const notificationTemplates = [
      { title: 'New Student Request', message: 'Sarah Chen wants to book a Chemistry session', type: 'info', category: 'session' },
      { title: 'Session Reminder', message: 'You have a Mathematics session in 1 hour', type: 'info', category: 'session' },
      { title: 'Payment Received', message: 'Invoice #4821 has been paid ($450.00)', type: 'success', category: 'billing' },
      { title: 'New Achievement!', message: 'You unlocked "Week Warrior" - 7 day streak!', type: 'success', category: 'achievement' },
      { title: 'Review Requested', message: 'Please rate your session with Michael Rodriguez', type: 'info', category: 'session' },
      { title: 'New Message', message: 'Emily Thompson sent you a message', type: 'info', category: 'message' }
    ]
    
    const numNotifications = faker.number.int({ min: 2, max: 8 })
    const selectedNotifications = randomElements(notificationTemplates, numNotifications)
    
    for (const template of selectedNotifications) {
      notifications.push({
        id: faker.string.uuid(),
        tutor_id: tutor.id,
        title: template.title,
        message: template.message,
        type: template.type,
        category: template.category,
        is_read: Math.random() > 0.4, // 60% read
        action_url: `/dashboard`,
        created_at: faker.date.recent({ days: 7 }).toISOString()
      })
    }
  }

  const { error: taError } = await supabase.from('tutor_achievements').insert(tutorAchievements)
  if (taError) console.error('Tutor achievements error:', taError)
  
  const { error: xpError } = await supabase.from('xp_activities').insert(xpActivities)
  if (xpError) console.error('XP activities error:', xpError)
  
  const { error: notError } = await supabase.from('notifications').insert(notifications)
  if (notError) console.error('Notifications error:', notError)
  
  console.log(`✅ Created ${achievements.length} achievements and ${notifications.length} notifications`)
  return { achievements, notifications }
}

async function main() {
  try {
    console.log('🚀 Starting database seed...\n')
    
    // Clear existing data
    await clearDatabase()
    
    // Create data in order
    const tutors = await createTutors()
    const students = await createStudents(tutors)
    const sessions = await createSessions(tutors, students)
    const lessonPlans = await createLessonPlans(tutors, sessions)
    const homework = await createHomework(tutors, students, sessions)
    const { conversations, messages } = await createMessagesAndConversations(tutors, students)
    const { invoices, payments } = await createInvoicesAndPayments(tutors, students, sessions)
    const opportunities = await createOpportunities()
    const { achievements, notifications } = await createAchievementsAndNotifications(tutors)
    
    console.log('\n✨ Database seeded successfully!')
    console.log('\n📊 Summary:')
    console.log(`   - Tutors: ${tutors.length}`)
    console.log(`   - Students: ${students.length}`)
    console.log(`   - Sessions: ${sessions.length}`)
    console.log(`   - Lesson Plans: ${lessonPlans.length}`)
    console.log(`   - Homework: ${homework.length}`)
    console.log(`   - Conversations: ${conversations.length}`)
    console.log(`   - Messages: ${messages.length}`)
    console.log(`   - Invoices: ${invoices.length}`)
    console.log(`   - Opportunities: ${opportunities.length}`)
    console.log(`   - Notifications: ${notifications.length}`)
    
  } catch (error) {
    console.error('❌ Error seeding database:', error)
    process.exit(1)
  }
}

// Run the seed script
main() 