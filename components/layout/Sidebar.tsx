'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Calendar, 
  Brain, 
  MessageCircle, 
  DollarSign, 
  User, 
  Trophy, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Search
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, Badge } from '@/components/ui'

interface SidebarItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: string
  xpReward?: number
}

const sidebarItems: SidebarItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: Home,
    href: '/dashboard'
  },
  {
    id: 'students',
    label: 'Students',
    icon: Users,
    href: '/students',
    badge: '12'
  },
  {
    id: 'sessions',
    label: 'Sessions',
    icon: Calendar,
    href: '/sessions',
    badge: '3'
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    icon: Search,
    href: '/opportunities'
  },
  {
    id: 'tools',
    label: 'AI Tools',
    icon: Brain,
    href: '/tools',
    xpReward: 50
  },
  {
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    href: '/messages',
    badge: '5'
  },
  {
    id: 'earnings',
    label: 'Earnings',
    icon: DollarSign,
    href: '/earnings'
  },
  {
    id: 'achievements',
    label: 'Achievements',
    icon: Trophy,
    href: '/achievements'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile'
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    href: '/settings'
  },
]

export interface SidebarProps {
  className?: string
  isCollapsed?: boolean
  onToggle?: (collapsed: boolean) => void
  isMobile?: boolean
  isOpen?: boolean
  onClose?: () => void
}

export const Sidebar: React.FC<SidebarProps> = ({
  className,
  isCollapsed = false,
  onToggle,
  isMobile = false,
  isOpen = false,
  onClose
}) => {
  const [collapsed, setCollapsed] = useState(isCollapsed)
  const pathname = usePathname()

  const handleToggle = () => {
    const newCollapsed = !collapsed
    setCollapsed(newCollapsed)
    onToggle?.(newCollapsed)
  }

  const handleItemClick = () => {
    if (isMobile) {
      onClose?.()
    }
  }

  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        duration: 0.3,
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.3,
        type: 'spring',
        damping: 20,
        stiffness: 300
      }
    }
  }

  const itemVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.2,
        delay: 0.1
      }
    },
    collapsed: {
      opacity: 0,
      x: -10,
      transition: {
        duration: 0.2
      }
    }
  }

  const SidebarContent = () => (
    <motion.div
      variants={sidebarVariants}
      animate={collapsed ? 'collapsed' : 'expanded'}
      className={cn(
        'flex flex-col h-full glass-effect border-r border-white/10',
        'shadow-lg backdrop-blur-sm',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              key="logo"
              variants={itemVariants}
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              className="flex flex-col items-start"
            >
              <h1 className="font-bold text-lg text-white">
                nerdy
              </h1>
              <div className="text-sm font-semibold bg-gradient-nerdy bg-clip-text text-transparent">
                Live+AI™
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isMobile && (
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-white" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white" />
            )}
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.id} href={item.href} onClick={handleItemClick}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                  'hover:bg-white/10 text-white cursor-pointer',
                  isActive && 'bg-gradient-nerdy shadow-lg nerdy-glow',
                  collapsed && 'justify-center'
                )}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.div
                      variants={itemVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      className="flex-1 flex items-center justify-between"
                    >
                      <span className="font-medium text-sm">{item.label}</span>
                      
                      <div className="flex items-center gap-2">
                        {item.badge && (
                          <Badge variant="secondary" size="sm" className="bg-nerdy-pink/20 text-nerdy-pink border-nerdy-pink/30">
                            {item.badge}
                          </Badge>
                        )}
                        {item.xpReward && (
                          <Badge variant="gradient" gradient="green" size="sm" className="bg-gradient-yellow-pink">
                            +{item.xpReward}XP
                          </Badge>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          )
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10">
        <div className={cn(
          'flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors cursor-pointer',
          collapsed && 'justify-center'
        )}>
          <Avatar
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"
            fallback="JD"
            size="md"
            showOnlineStatus
            isOnline
            animate={false}
          />
          
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                variants={itemVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
                className="flex-1"
              >
                <div className="text-sm font-medium text-white">
                  John Doe
                </div>
                <div className="text-xs bg-gradient-nerdy bg-clip-text text-transparent">
                  Expert Tutor Lv.42
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
              onClick={onClose}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-280"
            >
              <div className="flex items-center justify-between p-4 glass-effect border-b border-white/10">
                <div className="flex flex-col items-start">
                  <h1 className="font-bold text-lg text-white">
                    nerdy
                  </h1>
                  <div className="text-sm font-semibold bg-gradient-nerdy bg-clip-text text-transparent">
                    Live+AI™
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
              
              <div className="flex flex-col h-full glass-effect">
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }

  return (
    <div className="relative h-full">
      <SidebarContent />
    </div>
  )
}

export default Sidebar 