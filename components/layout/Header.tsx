'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, 
  Bell, 
  Settings, 
  Menu, 
  Sun, 
  Moon, 
  Plus,
  ChevronDown,
  Zap,
  User,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, Badge, Button } from '@/components/ui'

interface Notification {
  id: string
  title: string
  message: string
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  isRead: boolean
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message',
    time: '5 min ago',
    type: 'info',
    isRead: false
  },
  {
    id: '2',
    title: 'Session Reminder',
    message: 'Math session with Alex starts in 30 min',
    time: '25 min ago',
    type: 'warning',
    isRead: false
  },
  {
    id: '3',
    title: 'XP Earned',
    message: 'You earned 50 XP for completing a lesson',
    time: '1 hour ago',
    type: 'success',
    isRead: true
  }
]

export interface HeaderProps {
  className?: string
  onMobileMenuToggle?: () => void
  showMobileMenu?: boolean
}

export const Header: React.FC<HeaderProps> = ({
  className,
  onMobileMenuToggle,
  showMobileMenu = false
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const unreadNotifications = mockNotifications.filter(n => !n.isRead).length

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Search:', searchQuery)
  }

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // Handle theme toggle logic here
  }

  const handleNotificationClick = (notification: Notification) => {
    console.log('Notification clicked:', notification)
    // Handle notification click
  }

  const handleProfileAction = (action: string) => {
    console.log('Profile action:', action)
    setShowProfileMenu(false)
  }

  return (
    <header className={cn(
      'flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-900',
      'border-b border-gray-200 dark:border-gray-700 shadow-sm',
      className
    )}>
      {/* Left Section */}
      <div className="flex items-center gap-4">
        {/* Mobile Menu Button */}
        {showMobileMenu && (
          <button
            onClick={onMobileMenuToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Search */}
        <motion.form
          onSubmit={handleSearch}
          className="relative"
          animate={{ width: isSearchFocused ? 320 : 240 }}
          transition={{ duration: 0.2 }}
        >
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search students, sessions, or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={cn(
              'w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700',
              'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              'transition-all duration-200'
            )}
          />
        </motion.form>

        {/* Quick Actions */}
        <div className="hidden md:flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-4 h-4" />}
            gradientType="green"
            className="whitespace-nowrap"
          >
            New Session
          </Button>
          
          <Button
            variant="gradient"
            gradientType="blue"
            size="sm"
            leftIcon={<Zap className="w-4 h-4" />}
            xpReward={25}
            className="whitespace-nowrap"
          >
            AI Assistant
          </Button>
        </div>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          )}
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            {unreadNotifications > 0 && (
              <Badge
                variant="destructive"
                size="sm"
                className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center text-xs"
              >
                {unreadNotifications}
              </Badge>
            )}
          </button>

          {/* Notifications Dropdown */}
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700">
                      Mark all read
                    </button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {mockNotifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                      className={cn(
                        'p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer',
                        'hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                        !notification.isRead && 'bg-blue-50 dark:bg-blue-900/20'
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                          notification.type === 'info' && 'bg-blue-500',
                          notification.type === 'success' && 'bg-green-500',
                          notification.type === 'warning' && 'bg-yellow-500',
                          notification.type === 'error' && 'bg-red-500'
                        )} />
                        
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                            {notification.time}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face"
              fallback="JD"
              size="sm"
              showOnlineStatus
              isOnline
              animate={false}
            />
            <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          </button>

          {/* Profile Dropdown */}
          <AnimatePresence>
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
              >
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    John Doe
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Expert Tutor Lv.42
                  </div>
                </div>
                
                <div className="p-2">
                  <button
                    onClick={() => handleProfileAction('profile')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </button>
                  
                  <button
                    onClick={() => handleProfileAction('settings')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 my-2" />
                  
                  <button
                    onClick={() => handleProfileAction('logout')}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                  >
                    <LogOut className="w-4 h-4" />
                    Log out
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Click outside handlers */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
      
      {showProfileMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowProfileMenu(false)}
        />
      )}
    </header>
  )
}

export default Header 