'use client'

import React, { useState } from 'react'
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
import { Avatar, Button, NotificationBell, useToastHelpers } from '@/components/ui'
import { cn } from '@/lib/utils'
import { StorageWarning } from '@/components/ui/StorageWarning'
import { useTutorStore } from '@/lib/stores/tutorStore'
import { useHydratedStore } from '@/lib/hooks/useHydratedStore'

interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  description: string
}

const navigation: NavItem[] = [
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
    badge: '16',
    description: 'Manage your students'
  },
  {
    id: 'sessions',
    label: 'Sessions',
    href: '/sessions',
    icon: Calendar,
    badge: '3',
    description: 'Schedule and track sessions'
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLargeScreen, setIsLargeScreen] = useState(false)
  const { tutor, level, isHydrated } = useHydratedStore()

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
  
  const pathname = usePathname()
  const { success, info } = useToastHelpers()

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  const clearAllNotifications = () => {
    setNotifications([])
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
            {navigation.map((item) => {
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
                src={isHydrated && tutor?.avatar_url ? tutor.avatar_url : undefined}
                fallback={isHydrated && tutor?.first_name && tutor?.last_name ? `${tutor.first_name[0]}${tutor.last_name[0]}` : "?"}
                size="sm"
                className="ring-2 ring-pink-400/50 dark:ring-purple-500/50"
                animate={false}
              />
              <div className="flex-1 min-w-0">
                <div className="text-white font-medium text-sm">
                  {!isHydrated ? (
                    <span className="inline-block w-24 h-4 bg-white/20 rounded animate-pulse" />
                  ) : (
                    tutor ? `${tutor.first_name} ${tutor.last_name}` : 'Loading...'
                  )}
                </div>
                <div className="text-white/80 dark:text-purple-300 text-xs">
                  {!isHydrated ? (
                    <span className="inline-block w-32 h-3 bg-white/20 rounded animate-pulse" />
                  ) : (
                    `Expert Tutor • Level ${level}`
                  )}
                </div>
              </div>
            </div>
            
            <Link href="/settings" onClick={() => setSidebarOpen(false)}>
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/30 text-white hover:bg-white/10 dark:border-purple-500/30 dark:text-purple-300 dark:hover:bg-purple-600/20"
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
        <StorageWarning />
        
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
                {navigation.find(item => item.href === pathname)?.label || 'Dashboard'}
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
                  xpReward={25}
                >
                  AI Assistant
                </Button>
              </div>

              {/* Notifications */}
              <NotificationBell 
                notifications={notifications}
                onMarkAsRead={markAsRead}
                onClearAll={clearAllNotifications}
              />
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
    </div>
  )
} 