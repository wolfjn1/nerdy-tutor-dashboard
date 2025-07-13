import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { 
  TutorProfile, 
  Student, 
  Session, 
  Achievement, 
  XPActivity, 
  UIState,
  AnalyticsData
} from '@/lib/types'
import { 
  calculateLevelFromXP, 
  calculateLevelProgress, 
  calculateXPForNextLevel,
  calculateStreak
} from '@/lib/utils'

interface TutorState {
  // User data
  tutor: TutorProfile | null
  students: Student[]
  sessions: Session[]
  
  // Gamification
  totalXP: number
  level: number
  levelProgress: number
  xpForNextLevel: number
  streak: number
  achievements: Achievement[]
  xpActivities: XPActivity[]
  
  // UI State
  ui: UIState
  
  // Analytics
  analytics: AnalyticsData | null
  
  // Actions
  setTutor: (tutor: TutorProfile) => void
  updateTutorAvatar: (avatarUrl: string) => void
  addStudent: (student: Student) => void
  updateStudent: (id: string, updates: Partial<Student>) => void
  removeStudent: (id: string) => void
  
  addSession: (session: Session) => void
  updateSession: (id: string, updates: Partial<Session>) => void
  
  addXP: (amount: number, source: string, studentId?: string, sessionId?: string) => void
  updateStreak: () => void
  unlockAchievement: (id: string) => void
  
  setUIState: (updates: Partial<UIState>) => void
  
  // Getters
  getActiveStudents: () => Student[]
  getUpcomingSessions: () => Session[]
  getStudentById: (id: string) => Student | undefined
  getSessionById: (id: string) => Session | undefined
  getUnlockedAchievements: () => Achievement[]
  
  // Reset
  reset: () => void
}

const defaultUIState: UIState = {
  sidebarOpen: false,
  sidebarCollapsed: false,
  activeView: 'grid',
  theme: 'light',
  currentPage: 'dashboard',
  loading: false,
  error: null
}

export const useTutorStore = create<TutorState>()(
  persist(
    (set, get) => ({
      // Initial state
      tutor: null,
      students: [],
      sessions: [],
      
      totalXP: 0,
      level: 1,
      levelProgress: 0,
      xpForNextLevel: 100,
      streak: 0,
      achievements: [],
      xpActivities: [],
      
      ui: defaultUIState,
      analytics: null,
      
      // Actions
      setTutor: (tutor) => {
        console.log('[TutorStore] Setting tutor:', tutor)
        set({ tutor })
      },
      
      updateTutorAvatar: (avatarUrl) => {
        set((state) => ({
          tutor: state.tutor ? { ...state.tutor, avatar_url: avatarUrl } : null
        }))
      },
      
      addStudent: (student) => {
        set((state) => ({
          students: [...state.students, student]
        }))
      },
      
      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map(student =>
            student.id === id ? { ...student, ...updates } : student
          )
        }))
      },
      
      removeStudent: (id) => {
        set((state) => ({
          students: state.students.filter(student => student.id !== id)
        }))
      },
      
      addSession: (session) => {
        set((state) => ({
          sessions: [...state.sessions, session]
        }))
      },
      
      updateSession: (id, updates) => {
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === id ? { ...session, ...updates } : session
          )
        }))
      },
      
      addXP: (amount, source, studentId, sessionId) => {
        const state = get()
        const newTotalXP = state.totalXP + amount
        const newLevel = calculateLevelFromXP(newTotalXP)
        const newLevelProgress = calculateLevelProgress(newTotalXP, newLevel)
        const newXPForNextLevel = calculateXPForNextLevel(newLevel)
        
        const xpActivity: XPActivity = {
          id: crypto.randomUUID(),
          action: source,
          amount,
          source,
          timestamp: new Date(),
          studentId,
          sessionId
        }
        
        set({
          totalXP: newTotalXP,
          level: newLevel,
          levelProgress: newLevelProgress,
          xpForNextLevel: newXPForNextLevel,
          xpActivities: [xpActivity, ...state.xpActivities].slice(0, 100) // Keep last 100
        })
        
        // Check for level up achievements
        if (newLevel > state.level) {
          // Level up logic here
          console.log('Level up!', newLevel)
        }
      },
      
      updateStreak: () => {
        const state = get()
        const sessionDates = state.sessions
          .filter(s => s.status === 'completed')
          .map(s => s.date)
        
        const newStreak = calculateStreak(sessionDates)
        set({ streak: newStreak })
      },
      
      unlockAchievement: (id) => {
        set((state) => ({
          achievements: state.achievements.map(achievement =>
            achievement.id === id
              ? { ...achievement, isUnlocked: true, unlockedAt: new Date() }
              : achievement
          )
        }))
      },
      
      setUIState: (updates) => {
        set((state) => ({
          ui: { ...state.ui, ...updates }
        }))
      },
      
      // Getters
      getActiveStudents: () => {
        const state = get()
        return state.students.filter(student => student.isActive)
      },
      
      getUpcomingSessions: () => {
        const state = get()
        const now = new Date()
        return state.sessions
          .filter(session => session.date > now && session.status === 'scheduled')
          .sort((a, b) => a.date.getTime() - b.date.getTime())
      },
      
      getStudentById: (id) => {
        const state = get()
        return state.students.find(student => student.id === id)
      },
      
      getSessionById: (id) => {
        const state = get()
        return state.sessions.find(session => session.id === id)
      },
      
      getUnlockedAchievements: () => {
        const state = get()
        return state.achievements.filter(achievement => achievement.isUnlocked)
      },
      
      reset: () => {
        set({
          tutor: null,
          students: [],
          sessions: [],
          totalXP: 0,
          level: 1,
          levelProgress: 0,
          xpForNextLevel: 100,
          streak: 0,
          achievements: [],
          xpActivities: [],
          ui: defaultUIState,
          analytics: null
        })
      }
    }),
    {
      name: 'tutor-store',
      partialize: (state) => ({
        tutor: state.tutor,
        students: state.students,
        sessions: state.sessions,
        totalXP: state.totalXP,
        level: state.level,
        levelProgress: state.levelProgress,
        xpForNextLevel: state.xpForNextLevel,
        streak: state.streak,
        achievements: state.achievements,
        xpActivities: state.xpActivities,
        ui: state.ui
      })
    }
  )
) 