// User and Profile Types
export interface TutorProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  avatar?: string
  bio?: string
  subjects: string[]
  hourlyRate: number
  availability: Record<string, string[]> // day -> time slots
  rating: number
  totalEarnings: number
  totalHours: number
  joinDate: Date
  isVerified: boolean
  badges: string[]
}

export interface Contact {
  email: string
  phone: string
  name: string
  relationship: 'parent' | 'guardian' | 'student'
}

// Student Types
export interface Student {
  id: string
  firstName: string
  lastName: string
  avatar?: string
  grade: string | number
  subjects: string[]
  parentContact: Contact
  notes: string
  tags: string[]
  progress: {
    attendance: number // 0-100
    performance: number // 0-100
    engagement: number // 0-100
  }
  nextSession?: Date
  totalSessions: number
  completedSessions: number
  createdAt: Date
  isActive: boolean
}

// Session Types
export interface Session {
  id: string
  studentId: string
  tutorId: string
  subject: string
  date: Date
  duration: number // minutes
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show'
  lessonPlan?: LessonPlan
  homework?: Homework[]
  notes?: string
  rating?: number
  earnings?: number
  createdAt: Date
  updatedAt: Date
}

// Lesson Plan Types
export interface LessonPlan {
  id: string
  title: string
  subject: string
  grade: string
  duration: number
  objectives: string[]
  activities: Activity[]
  materials: string[]
  assessments: Assessment[]
  createdAt: Date
  isTemplate: boolean
}

export interface Activity {
  id: string
  title: string
  description: string
  duration: number
  type: 'explanation' | 'practice' | 'discussion' | 'assessment'
  resources: string[]
}

export interface Assessment {
  id: string
  title: string
  type: 'quiz' | 'worksheet' | 'project' | 'discussion'
  points: number
  description: string
}

// Homework Types
export interface Homework {
  id: string
  title: string
  description: string
  subject: string
  studentId: string
  sessionId?: string
  dueDate: Date
  status: 'assigned' | 'in_progress' | 'completed' | 'late' | 'missing'
  attachments: string[]
  submissions: Submission[]
  feedback?: string
  grade?: number
  createdAt: Date
}

export interface Submission {
  id: string
  studentId: string
  content: string
  attachments: string[]
  submittedAt: Date
  isLate: boolean
}

// Messaging Types
export interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  attachments: string[]
  timestamp: Date
  isRead: boolean
  type: 'text' | 'audio' | 'file' | 'link'
}

export interface Conversation {
  id: string
  participants: string[]
  lastMessage: Message
  unreadCount: number
  createdAt: Date
  updatedAt: Date
}

// Billing Types
export interface Invoice {
  id: string
  tutorId: string
  studentId: string
  sessionIds: string[]
  amount: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'
  issueDate: Date
  dueDate: Date
  paidDate?: Date
  paymentMethod?: string
  notes?: string
}

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  method: 'credit_card' | 'bank_transfer' | 'cash' | 'check'
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  transactionId?: string
  processedAt: Date
  notes?: string
}

// Gamification Types
export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  type: 'milestone' | 'streak' | 'performance' | 'social'
  xpReward: number
  condition: AchievementCondition
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  unlockedAt?: Date
  isUnlocked: boolean
  progress: number
  maxProgress: number
}

export interface AchievementCondition {
  type: 'sessions_count' | 'hours_taught' | 'student_rating' | 'streak_days' | 'xp_earned'
  value: number
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all_time'
}

export interface XPActivity {
  id: string
  action: string
  amount: number
  source: string
  timestamp: Date
  studentId?: string
  sessionId?: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  category: 'session' | 'message' | 'achievement' | 'billing' | 'system'
  isRead: boolean
  actionUrl?: string
  createdAt: Date
  expiresAt?: Date
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Filter and Sort Types
export interface FilterOptions {
  search?: string
  subjects?: string[]
  grades?: string[]
  status?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  tags?: string[]
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// UI State Types
export interface UIState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  activeView: 'grid' | 'list'
  theme: 'light' | 'dark' | 'system'
  currentPage: string
  loading: boolean
  error: string | null
}

// Analytics Types
export interface AnalyticsData {
  totalStudents: number
  activeStudents: number
  totalSessions: number
  completedSessions: number
  totalEarnings: number
  averageRating: number
  hoursThisMonth: number
  streakDays: number
  xpThisMonth: number
  topSubjects: Array<{ subject: string; count: number }>
  monthlyStats: Array<{
    month: string
    sessions: number
    earnings: number
    hours: number
  }>
} 