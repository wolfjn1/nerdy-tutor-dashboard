'use client'

import React from 'react'
import { Bell, Search, Menu, LogOut } from 'lucide-react'
import { Button, Avatar, NotificationBell } from '@/components/ui'
import { useTutorStore } from '@/lib/stores/tutorStore'
import { useAuth } from '@/lib/auth/auth-context'
import { createClient } from '@/lib/supabase-browser'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  onMenuToggle: () => void
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const { tutor } = useTutorStore()
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 h-16 flex items-center sticky top-0 z-40">
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
      >
        <Menu className="h-6 w-6 text-gray-600 dark:text-gray-400" />
      </button>

      <div className="flex-1 flex items-center gap-4">
        <div className="relative max-w-md flex-1 hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search students, sessions..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:focus:border-purple-400 dark:text-gray-100 dark:placeholder-gray-400"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <NotificationBell 
          notifications={[]}
          onMarkAsRead={() => {}}
          onClearAll={() => {}}
        />
        
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Logout"
        >
          <LogOut className="h-5 w-5 text-gray-600 dark:text-gray-400" />
        </button>
        
        <Avatar
          src={tutor?.avatar_url}
          fallback={tutor ? `${tutor.first_name?.[0] || ''}${tutor.last_name?.[0] || ''}` : 'U'}
          size="sm"
        />
      </div>
    </header>
  )
} 