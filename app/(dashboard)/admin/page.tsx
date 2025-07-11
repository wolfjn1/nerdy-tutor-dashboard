'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Database, Activity, Shield, Bell, User } from 'lucide-react'
import { AdministrativeTasks } from '@/components/dashboard'
import { Card, Button } from '@/components/ui'
import SupabaseConnectionTest from '@/components/test/SupabaseConnectionTest'
import dashboardDataRaw from '@/lib/mock-data/dashboard.json'

// Type assertion to ensure proper types
const dashboardData = dashboardDataRaw as any

export default function AdminPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              Admin Dashboard 🛠️
            </h1>
            <p className="text-slate-600">
              System settings, database status, and administrative tasks
            </p>
          </div>
        </div>
      </motion.div>

      {/* System Status Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <Card className="glass-effect border-white/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-pink-cyan flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">Connected</div>
              <div className="text-sm text-slate-600">Database Status</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-yellow-pink flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">Active</div>
              <div className="text-sm text-slate-600">System Health</div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-white/30 p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-gradient-orange-magenta flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-800">Secure</div>
              <div className="text-sm text-slate-600">Security Status</div>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="xl:col-span-2 space-y-6">
          {/* Database Connection Test */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SupabaseConnectionTest />
          </motion.div>

          {/* System Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="glass-effect border-white/30 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5 text-cyan-500" />
                System Settings
              </h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-white/60">
                  <div>
                    <div className="font-medium text-slate-800">Notifications</div>
                    <div className="text-sm text-slate-600">Email and push notifications</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/60">
                  <div>
                    <div className="font-medium text-slate-800">Profile Settings</div>
                    <div className="text-sm text-slate-600">Personal information and preferences</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Edit Profile
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/60">
                  <div>
                    <div className="font-medium text-slate-800">Privacy & Security</div>
                    <div className="text-sm text-slate-600">Account security and data privacy</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-white/60">
                  <div>
                    <div className="font-medium text-slate-800">Data Export</div>
                    <div className="text-sm text-slate-600">Download your tutoring data</div>
                  </div>
                  <Button variant="gradient" gradientType="pink-cyan" size="sm" xpReward={10}>
                    Export Data
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Administrative Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <AdministrativeTasks tasks={dashboardData.administrativeTasks} />
          </motion.div>

          {/* Quick Admin Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <Card className="glass-effect border-white/30 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <Button 
                  variant="gradient" 
                  gradientType="yellow-pink" 
                  size="sm" 
                  className="w-full"
                  leftIcon={<Database className="w-4 h-4" />}
                  xpReward={5}
                >
                  Sync Database
                </Button>
                
                <Button 
                  variant="gradient" 
                  gradientType="orange-magenta" 
                  size="sm" 
                  className="w-full"
                  leftIcon={<Activity className="w-4 h-4" />}
                  xpReward={5}
                >
                  System Health Check
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  leftIcon={<Bell className="w-4 h-4" />}
                >
                  Test Notifications
                </Button>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  leftIcon={<User className="w-4 h-4" />}
                >
                  Account Settings
                </Button>
              </div>
            </Card>
          </motion.div>

          {/* System Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Card className="glass-effect border-white/30 p-6">
              <h2 className="text-xl font-bold text-slate-800 mb-4">System Information</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Version:</span>
                  <span className="font-medium">v1.0.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Environment:</span>
                  <span className="font-medium">Production</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Last Update:</span>
                  <span className="font-medium">Today</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Uptime:</span>
                  <span className="font-medium text-green-600">99.9%</span>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
} 