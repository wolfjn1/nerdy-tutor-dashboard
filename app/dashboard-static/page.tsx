'use client'

import { useState } from 'react'
import { Calendar, Users, DollarSign, Clock, TrendingUp, BookOpen } from 'lucide-react'

export default function StaticDashboard() {
  const [selectedTab, setSelectedTab] = useState('overview')

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Static Dashboard (No Auth)
            </h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Sarah Chen | Level 3 Tutor
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">$2,125</p>
                <p className="text-xs text-green-600 dark:text-green-400">+12% from last month</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">5</p>
                <p className="text-xs text-blue-600 dark:text-blue-400">2 new this month</p>
              </div>
              <Users className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sessions Today</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">1</p>
                <p className="text-xs text-purple-600 dark:text-purple-400">2:00 PM - Alex</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hours</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">85</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">This month: 12h</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {['overview', 'schedule', 'students'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                    selectedTab === tab
                      ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {selectedTab === 'overview' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <BookOpen className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Completed session with Emma Davis</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Algebra II - 1 hour</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">2 hours ago</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                      <TrendingUp className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">New achievement unlocked!</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">25 Sessions Milestone</p>
                      </div>
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Yesterday</span>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'schedule' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Today's Schedule</h3>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Alex Johnson</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Calculus I</p>
                      <p className="text-sm text-gray-500 dark:text-gray-500">2:00 PM - 3:00 PM</p>
                    </div>
                    <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                      Start Session
                    </button>
                  </div>
                </div>
              </div>
            )}

            {selectedTab === 'students' && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Active Students</h3>
                <div className="space-y-3">
                  {['Alex Johnson', 'Emma Davis', 'Michael Brown', 'Sophie Martinez', 'Lucas Wilson'].map((student) => (
                    <div key={student} className="flex items-center justify-between py-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {student.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{student}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Next session: This week</p>
                        </div>
                      </div>
                      <button className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300">
                        View Profile
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Test Links */}
        <div className="mt-8 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Debug Information</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            This is a completely static page with no Supabase or Auth dependencies. If this loads correctly, the issue is with Supabase connectivity on Vercel.
          </p>
          <div className="space-x-4">
            <a href="/no-auth-dashboard" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">No Auth Dashboard</a>
            <a href="/simple-test" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">Simple Test</a>
            <a href="/api/env-check" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">Env Check</a>
            <a href="/" className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400">Home</a>
          </div>
        </div>
      </main>
    </div>
  )
} 