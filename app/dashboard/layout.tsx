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
import { Button, NotificationBell, useToastHelpers } from '@/components/ui'
import { cn } from '@/lib/utils'

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
    badge: '12',
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
  },
  {
    id: 'admin',
    label: 'Admin',
    href: '/admin',
    icon: Settings,
    description: 'Settings and system status'
  }
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
    <div className="min-h-screen bg-gradient-nerdy-bg-light">
      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <div className="flex h-screen">
        {/* Sidebar */}
        <motion.div
          initial={false}
          animate={{
            x: sidebarOpen ? 0 : -256,
          }}
          className="fixed left-0 top-0 bottom-0 w-64 bg-gradient-nerdy shadow-xl z-50 lg:translate-x-0 lg:static lg:flex-shrink-0"
        >
          <div className="flex flex-col h-full">
            {/* Logo and Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-white/20">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold">N</span>
                </div>
                <div>
                  <div className="text-white font-bold">Nerdy</div>
                  <div className="text-white/80 text-xs">Live+AI™</div>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
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
                        ? 'bg-white/20 text-white shadow-lg' 
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{item.label}</div>
                      <div className="text-xs opacity-75 leading-tight truncate">{item.description}</div>
                    </div>
                    {item.badge && (
                      <div className="bg-white/20 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                        {item.badge}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* User Section */}
            <div className="p-3 border-t border-white/20">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <span className="text-white font-medium text-sm">JD</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm">John Doe</div>
                  <div className="text-white/80 text-xs">Expert • Level 42</div>
                </div>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                className="w-full border-white/30 text-white hover:bg-white/10 text-xs"
                leftIcon={<Settings className="w-3 h-3" />}
              >
                Settings
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="bg-white/80 backdrop-blur-sm border-b border-white/30 sticky top-0 z-30 shadow-sm">
            <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 max-w-7xl">
              <div className="flex items-center gap-3">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <Menu className="w-5 h-5" />
                </button>
                
                {/* Page title */}
                <div className="text-xl font-bold text-slate-800">
                  {navigation.find(item => item.href === pathname)?.label || 'Dashboard'}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Quick Actions */}
                <div className="hidden md:flex items-center gap-2">
                  <Button 
                    variant="gradient" 
                    gradientType="pink-cyan"
                    size="sm"
                    leftIcon={<Plus className="w-4 h-4" />}
                    xpReward={10}
                  >
                    New Session
                  </Button>
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

          {/* Page Content with proper scrolling */}
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile floating action button */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
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