'use client'

import React from 'react'
import { Calendar, Clock, TrendingUp, Users, DollarSign, Target, BookOpen, Trophy } from 'lucide-react'

export default function DashboardPage() {
  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-6">
          {/* Tutor Image */}
          <div className="flex-shrink-0">
            <img 
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              alt="John Doe"
              className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-200 shadow-lg"
            />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, John Doe! 👋
            </h1>
            <p className="text-gray-600">
              Here's your tutoring overview for today
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Gamification Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold mb-1">Level 42</div>
              <div className="text-purple-100">Expert</div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-4xl">🔥</span>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-300">21</div>
                <div className="text-purple-100 text-sm">day streak</div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 max-w-md">
            {/* XP Progress */}
            <div className="mb-4">
              <div className="flex justify-between text-white/90 mb-3">
                <span className="font-semibold">2450 / 3000 XP</span>
                <span>to next level</span>
              </div>
              <div className="w-full bg-white/20 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-500 h-3 rounded-full shadow-lg" 
                  style={{ width: '82%' }}
                />
              </div>
            </div>
            
            {/* Recent Achievements */}
            <div className="flex items-center gap-3">
              <span className="text-white/80 text-sm font-medium">Recent:</span>
              <div className="flex gap-2">
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  🎯 Century Club
                </span>
                <span className="px-3 py-1.5 bg-white/20 backdrop-blur-sm text-white text-sm rounded-full font-medium">
                  ⭐ Perfect Week
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">3</div>
              <div className="text-sm text-gray-600">Sessions Today</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">$425</div>
              <div className="text-sm text-gray-600">Today's Earnings</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-purple-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">12</div>
              <div className="text-sm text-gray-600">Active Students</div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-pink-200 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">94%</div>
              <div className="text-sm text-gray-600">Success Rate</div>
            </div>
          </div>
        </div>
      </div>

      {/* Next Session - Compact */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-600" />
          Next Session
        </h2>
        
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
              SC
            </div>
            <div>
              <div className="font-semibold text-gray-900">Sarah Chen</div>
              <div className="text-gray-600 flex items-center gap-2 text-sm">
                <BookOpen className="w-4 h-4" />
                AP Calculus
              </div>
              <div className="text-sm text-gray-500">
                7/6/2025 at 14:00
              </div>
            </div>
          </div>
          <div className="flex gap-2 sm:ml-auto">
            <button className="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm">
              Reschedule
            </button>
            <button className="px-3 py-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-200 shadow-lg text-sm">
              Start Session
            </button>
          </div>
        </div>
      </div>

      {/* Three Column Layout - All Above Fold */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Required Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-pink-500" />
            Required Actions
          </h3>
          <div className="space-y-2">
            <div className="p-2 bg-red-50 border border-red-200 rounded-lg cursor-pointer hover:bg-red-100 transition-colors">
              <div className="text-sm font-medium text-red-800">Sign new contract</div>
              <div className="text-xs text-red-600">Due March 15th</div>
            </div>
            <div className="p-2 bg-yellow-50 border border-yellow-200 rounded-lg cursor-pointer hover:bg-yellow-100 transition-colors">
              <div className="text-sm font-medium text-yellow-800">Invoice pending</div>
              <div className="text-xs text-yellow-600">Sarah Chen (3/10)</div>
            </div>
            <div className="p-2 bg-blue-50 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
              <div className="text-sm font-medium text-blue-800">Message student</div>
              <div className="text-xs text-blue-600">Follow up with Marcus</div>
            </div>
          </div>
        </div>

        {/* Today's Schedule */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Today's Schedule</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2 p-2 bg-purple-50 rounded-lg border border-purple-100">
              <div className="w-1.5 h-6 bg-purple-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Sarah Chen</div>
                <div className="text-xs text-gray-600">2:00 PM - AP Calculus</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-pink-50 rounded-lg border border-pink-100">
              <div className="w-1.5 h-6 bg-pink-500 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Marcus Johnson</div>
                <div className="text-xs text-gray-600">4:30 PM - SAT Math</div>
              </div>
            </div>
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border border-gray-100">
              <div className="w-1.5 h-6 bg-gray-400 rounded-full"></div>
              <div>
                <div className="text-sm font-medium text-gray-900">Emma Wilson</div>
                <div className="text-xs text-gray-600">6:00 PM - Chemistry</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            Quick Actions
          </h3>
          <div className="space-y-2">
            <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-semibold text-gray-900 text-sm mb-1">AI Lesson Builder</div>
              <div className="text-xs text-gray-600">Create lesson plans</div>
            </button>
            <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="font-semibold text-gray-900 text-sm mb-1">AI Study Assistant</div>
              <div className="text-xs text-gray-600">Generate problems</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 