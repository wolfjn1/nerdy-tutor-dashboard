'use client'

import React from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Users, 
  Calendar, 
  MessageCircle, 
  User 
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui'

interface MobileNavItem {
  id: string
  label: string
  icon: React.ElementType
  href: string
  badge?: string
}

const mobileNavItems: MobileNavItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
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
    id: 'messages',
    label: 'Messages',
    icon: MessageCircle,
    href: '/messages',
    badge: '5'
  },
  {
    id: 'profile',
    label: 'Profile',
    icon: User,
    href: '/profile'
  }
]

export interface MobileNavProps {
  className?: string
  onItemClick?: (item: MobileNavItem) => void
}

export const MobileNav: React.FC<MobileNavProps> = ({
  className,
  onItemClick
}) => {
  const pathname = usePathname()
  
  const handleItemClick = (item: MobileNavItem) => {
    onItemClick?.(item)
  }

  return (
    <nav className={cn(
      'fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900',
      'border-t border-gray-200 dark:border-gray-700 shadow-lg',
      'md:hidden', // Only show on mobile
      className
    )}>
      <div className="flex items-center justify-around py-2">
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.id} href={item.href} onClick={() => handleItemClick(item)}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all duration-200',
                  'min-w-[60px] relative cursor-pointer',
                  isActive
                    ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/20'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                )}
              >
                <div className="relative">
                  <item.icon className="w-5 h-5" />
                  {item.badge && (
                    <Badge
                      variant="destructive"
                      size="sm"
                      className="absolute -top-2 -right-2 min-w-[16px] h-4 flex items-center justify-center text-[10px] px-1"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <span className="text-xs font-medium">{item.label}</span>
                
                {/* Active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default MobileNav 