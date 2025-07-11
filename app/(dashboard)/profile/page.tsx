'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, Mail, Phone, MapPin, Calendar, Star, Edit, Settings } from 'lucide-react'
import { Card, Button, Avatar, Badge } from '@/components/ui'

export default function ProfilePage() {
  const profile = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    level: 42,
    title: 'Expert Tutor',
    joinDate: 'March 2022',
    subjects: ['Mathematics', 'Physics', 'Chemistry', 'Calculus'],
    stats: {
      totalSessions: 245,
      rating: 4.9,
      students: 12,
      earnings: 15750
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Profile 👤
          </h1>
          <p className="text-gray-600">
            Manage your profile and account settings
          </p>
        </div>
        <Button variant="gradient" gradientType="nerdy">
          <Edit className="w-4 h-4 mr-2" />
          Edit Profile
        </Button>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex-shrink-0">
                <Avatar
                  src={profile.avatar}
                  fallback="JD"
                  size="2xl"
                  className="border-4 border-purple-200"
                />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{profile.name}</h2>
                  <Badge variant="gradient" gradient="nerdy">
                    Level {profile.level}
                  </Badge>
                </div>
                
                <p className="text-purple-600 font-semibold mb-4">{profile.title}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{profile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{profile.location}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Joined {profile.joinDate}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {profile.stats.totalSessions}
            </div>
            <div className="text-sm text-gray-500">Total Sessions</div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2 flex items-center justify-center gap-1">
              {profile.stats.rating}
              <Star className="w-5 h-5" />
            </div>
            <div className="text-sm text-gray-500">Average Rating</div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {profile.stats.students}
            </div>
            <div className="text-sm text-gray-500">Active Students</div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              ${profile.stats.earnings.toLocaleString()}
            </div>
            <div className="text-sm text-gray-500">Total Earnings</div>
          </div>
        </Card>
      </motion.div>

      {/* Subjects */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Teaching Subjects
            </h3>
            <div className="flex flex-wrap gap-2">
              {profile.subjects.map((subject) => (
                <Badge key={subject} variant="secondary" className="px-3 py-1">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Account Settings
            </h3>
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Notification Preferences</div>
                <div className="text-sm text-gray-500">Manage email and push notifications</div>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Privacy Settings</div>
                <div className="text-sm text-gray-500">Control who can see your profile</div>
              </button>
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Payment Methods</div>
                <div className="text-sm text-gray-500">Manage your billing and payment options</div>
              </button>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  )
} 