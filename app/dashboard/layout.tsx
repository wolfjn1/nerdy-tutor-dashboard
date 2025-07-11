'use client'

import React, { useState } from 'react'
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

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Students', href: '/students', icon: Users, badge: '12' },
  { name: 'Sessions', href: '/sessions', icon: Calendar, badge: '3' },
  { name: 'Opportunities', href: '/opportunities', icon: Search },
  { name: 'Earnings', href: '/earnings', icon: DollarSign },
  { name: 'Achievements', href: '/achievements', icon: Trophy },
  { name: 'Settings', href: '/settings', icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-cyan-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-600 via-purple-600 to-cyan-600 shadow-xl lg:relative lg:flex-shrink-0
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <span className="text-white font-bold text-sm">N</span>
            </div>
            <div>
              <span className="text-xl font-bold text-white">Nerdy</span>
              <div className="text-white/80 text-xs">Live+AI™</div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                  ${isActive 
                    ? 'bg-white/20 text-white shadow-lg backdrop-blur-sm' 
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="px-2 py-1 text-xs font-medium bg-white/20 text-white rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* User section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/20 bg-black/10 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center ring-2 ring-white/30">
              <span className="text-sm font-bold text-white">JD</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-white">John Doe</div>
              <div className="text-xs text-white/80">Expert • Level 42</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <div className="h-16 bg-white/80 backdrop-blur-sm border-b border-white/30 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-white/50"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">
              {navigation.find(item => item.href === pathname)?.name || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-white/50">
              <Bell className="w-5 h-5" />
            </button>
            <button className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg">
              <Plus className="w-4 h-4 inline mr-2" />
              New Session
            </button>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
} 