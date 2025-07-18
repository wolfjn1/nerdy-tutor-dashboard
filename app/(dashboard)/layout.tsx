'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Calendar, 
  Search, 
  DollarSign, 
  Trophy, 
  Settings,
  Menu,
  X,
  Bell,
  Plus,
  Zap
} from 'lucide-react'
import Header from '@/components/layout/Header'
import { Button, Badge, Avatar, NotificationBell, ThemeToggleCompact } from '@/components/ui'
import { AuthDebug } from '@/components/debug/AuthDebug'
import { cn } from '@/lib/utils'
import { useTutorStore } from '@/lib/stores/tutorStore'
import { SimpleAuthProvider, useAuth } from '@/lib/auth/simple-auth-context'
import { getStudents } from '@/lib/api/students'
import { getUpcomingSessions } from '@/lib/api/dashboard'
import { useRouter } from 'next/navigation'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description: string
}

// Add type declaration for Assembled at the top of the file
declare global {
  interface Window {
    Assembled?: {
      openChat: () => void
    }
  }
}

// Feature flag to enable/disable Assembled integration
const ENABLE_ASSEMBLED_CHAT = false // Set to true when ready to use

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user, tutor, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { setTutor } = useTutorStore()
  
  // Sync tutor data from auth to store
  useEffect(() => {
    if (tutor) {
      console.log('[Dashboard] Syncing tutor to store:', tutor)
      setTutor(tutor as any)
    }
  }, [tutor, setTutor])

  // Add timeout to refresh auth if loading takes too long
  useEffect(() => {
    if (loading) {
      const timeout = setTimeout(() => {
        console.log('[Dashboard] Loading timeout, forcing page refresh...')
        // Force a page refresh as a last resort
        if (typeof window !== 'undefined') {
          window.location.reload()
        }
      }, 15000) // 15 second timeout (longer than auth timeout)
      
      return () => clearTimeout(timeout)
    }
  }, [loading])

  // Dynamic counts
  const [studentCount, setStudentCount] = useState<number>(0)
  const [upcomingSessionsCount, setUpcomingSessionsCount] = useState<number>(0)
  
  // Fetch real counts
  useEffect(() => {
    async function fetchCounts() {
      if (!tutor?.id) return
      
      try {
        // Fetch student count
        const students = await getStudents(tutor.id)
        const activeStudents = students.filter((s: any) => s.is_active)
        setStudentCount(activeStudents.length)
        
        // Fetch upcoming sessions count (next 7 days)
        const sessions = await getUpcomingSessions(tutor.id)
        const nextWeek = new Date()
        nextWeek.setDate(nextWeek.getDate() + 7)
        const upcomingThisWeek = sessions.filter((s: any) => new Date(s.scheduled_at) <= nextWeek)
        setUpcomingSessionsCount(upcomingThisWeek.length)
      } catch (error) {
        console.error('Error fetching sidebar counts:', error)
      }
    }
    
    if (tutor?.id) {
      fetchCounts()
    }
  }, [tutor?.id])

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      description: 'Overview and quick actions'
    },
    {
      id: 'students',
      label: 'Students',
      href: '/students',
      icon: Users,
      badge: studentCount > 0 ? String(studentCount) : undefined,
      description: 'Manage your students'
    },
    {
      id: 'sessions',
      label: 'Sessions',
      href: '/sessions',
      icon: Calendar,
      badge: upcomingSessionsCount > 0 ? String(upcomingSessionsCount) : undefined,
      description: 'Schedule and track sessions'
    },
    {
      id: 'tools',
      label: 'AI Tools',
      href: '/tools',
      icon: Zap,
      description: 'AI-powered teaching tools'
    },
    {
      id: 'opportunities',
      label: 'Opportunities',
      href: '/opportunities',
      icon: Search,
      description: 'Find new tutoring opportunities'
    },
    {
      id: 'earnings',
      label: 'Earnings',
      href: '/earnings',
      icon: DollarSign,
      description: 'Track income and billing'
    },
    {
      id: 'achievements',
      label: 'Achievements',
      href: '/achievements',
      icon: Trophy,
      description: 'Profile and gamification'
    }
  ]

  const [isLargeScreen, setIsLargeScreen] = useState(false)
  
  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024) // lg breakpoint
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])
  
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'New Student Request',
      message: 'Sarah Chen has requested tutoring for Calculus II',
      type: 'info' as const,
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false
    },
    {
      id: '2',
      title: 'Session Reminder',
      message: 'Your session with Alex Thompson starts in 30 minutes',
      type: 'warning' as const,
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: false
    }
  ])

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Load Assembled chat widget script - MUST be before any conditional returns
  useEffect(() => {
    // Skip if feature is disabled
    if (!ENABLE_ASSEMBLED_CHAT) return
    
    // Only load in production/deployed environment
    if (typeof window === 'undefined') return

    const script = document.createElement('script')
    script.src = 'https://cal.assembledhq.com/static/js/public-chat.js'
    script.setAttribute('data-company-id', 'ec88077a-64ee-44e2-a813-925b45de7908')
    script.setAttribute('data-profile-id', '649cf0fd-813f-4464-b8e3-2e23ab04aad6')
    script.async = true
    
    // Add error handling
    script.onerror = (error) => {
      console.error('[Assembled] Failed to load chat widget:', error)
    }
    
    script.onload = () => {
      console.log('[Assembled] Chat widget loaded successfully')
    }

    // Add crossorigin attribute to help with CORS
    script.crossOrigin = 'anonymous'
    
    document.body.appendChild(script)

    return () => {
      // Cleanup script on unmount
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [])

  const handleAIAssistantClick = () => {
    if (!ENABLE_ASSEMBLED_CHAT) {
      console.log('[AI Assistant] Chat integration is currently disabled')
      return
    }
    
    // Launch Assembled widget
    if (window.Assembled && window.Assembled.openChat) {
      window.Assembled.openChat()
    } else {
      console.log('[AI Assistant] Widget not loaded yet')
    }
  }

  // Handle authentication redirects
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [loading, user, router])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center">
        <div className="text-purple-600 dark:text-purple-400">Loading...</div>
      </div>
    )
  }

  // If no user at all, show loading (redirect will happen via useEffect)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center">
        <div className="text-purple-600 dark:text-purple-400">Redirecting...</div>
      </div>
    )
  }

  // If user is logged in but has no tutor profile, show a message instead of redirecting
  // This prevents infinite redirect loops
  if (user && !tutor) {
    return (
      <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex items-center justify-center">
        <div className="max-w-md text-center space-y-4 p-8">
          <h1 className="text-2xl font-bold text-purple-900 dark:text-purple-400">Profile Setup Required</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your account doesn't have a tutor profile yet. Please contact support or try logging in with the demo account.
          </p>
          <div className="space-y-2">
            <button
              onClick={() => {
                router.push('/clear-session')
              }}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Sign Out and Try Again
            </button>
            <p className="text-sm text-gray-500">
              Demo account: sarah_chen@hotmail.com / demo123
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-nerdy-bg-light dark:bg-gray-900 flex">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 dark:bg-black/70 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isLargeScreen ? 0 : (sidebarOpen ? 0 : -320),
        }}
        className="fixed left-0 top-0 bottom-0 w-80 h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-800 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-xl z-50 lg:w-64 dark:border-r dark:border-gray-700"
      >
        <div className="flex flex-col h-full">
          {/* Logo and Close Button */}
          <div className="flex-shrink-0 flex items-center justify-between p-6 border-b border-white/20 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 dark:bg-purple-600/20 flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <div className="text-white font-bold text-lg">Nerdy</div>
                <div className="text-white/80 dark:text-purple-300 text-sm">Live+AI™</div>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-white/80 hover:text-white dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              const Icon = item.icon
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
                    isActive 
                      ? 'bg-pink-500/30 text-white shadow-lg backdrop-blur-sm border border-pink-400/30 dark:bg-purple-600/30 dark:border-purple-500/30' 
                      : 'text-white/80 hover:bg-pink-500/20 hover:text-white dark:text-gray-300 dark:hover:bg-gray-700/50 dark:hover:text-gray-100'
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm">{item.label}</div>
                    <div className="text-xs opacity-70 leading-tight dark:opacity-60">{item.description}</div>
                  </div>
                  {item.badge && (
                    <div className="bg-white/20 dark:bg-purple-600/30 text-white px-2 py-1 rounded-full text-xs font-medium">
                      {item.badge}
                    </div>
                  )}
                </Link>
              )
            })}
          </nav>

          {/* User Section */}
          <div className="flex-shrink-0 p-3 border-t border-white/20 dark:border-gray-700 bg-black/10 dark:bg-gray-800/50 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-3">
              <Avatar
                src={tutor?.avatar_url || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"}
                fallback={tutor?.first_name && tutor?.last_name ? `${tutor.first_name[0]}${tutor.last_name[0]}` : "JD"}
                size="sm"
                className="ring-2 ring-pink-400/50 dark:ring-purple-500/50"
                animate={false}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">{tutor ? `${tutor.first_name} ${tutor.last_name}` : 'John Doe'}</div>
                <div className="text-white/80 dark:text-purple-300 text-xs">Expert Tutor • Level {tutor ? Math.floor((tutor.total_hours || 0) / 10) + 1 : 1}</div>
              </div>
            </div>
            
            <Link href="/settings" onClick={() => setSidebarOpen(false)}>
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start",
                  pathname === '/settings' && 'bg-purple-50 text-purple-600'
                )}
                leftIcon={<Settings className="w-4 h-4" />}
              >
                Settings
              </Button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-64">
        {/* Storage Warning Banner */}
        
        {/* Header */}
        <header className="bg-white/60 dark:bg-gray-800/90 backdrop-blur-sm border-b border-white/30 dark:border-gray-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 lg:px-6 py-3 lg:py-4">
            <div className="flex items-center gap-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* Page title will be added by individual pages */}
              <div className="text-xl font-bold text-slate-800 dark:text-gray-100">
                {navItems.find(item => item.href === pathname)?.label || 'Dashboard'}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Quick Actions */}
              <div className="hidden md:flex items-center gap-2">
                <Button 
                  variant="gradient" 
                  gradientType="nerdy"
                  size="sm"
                  leftIcon={<Zap className="w-4 h-4" />}
                  onClick={handleAIAssistantClick}
                >
                  AI Assistant
                </Button>
              </div>

              {/* Notifications */}
              <NotificationBell 
                notifications={notifications}
                onMarkAsRead={markNotificationAsRead}
                onClearAll={() => setNotifications([])}
              />
              
              {/* Theme Toggle */}
              <ThemeToggleCompact />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6 dark:bg-gray-900">
          {children}
        </main>
      </div>

      {/* Mobile floating action button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, delay: 0.5 }}
        className="fixed bottom-6 right-6 z-40 lg:hidden"
      >
        <Button
          variant="gradient"
          gradientType="nerdy"
          size="lg"
          className="shadow-2xl rounded-full w-14 h-14 p-0"
          xpReward={25}
          aria-label="AI Assistant"
        >
          <Zap className="w-6 h-6" />
        </Button>
      </motion.div>
      
      {/* Debug component - remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <AuthDebug />
      )}
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SimpleAuthProvider>
      <DashboardContent>{children}</DashboardContent>
    </SimpleAuthProvider>
  )
} 