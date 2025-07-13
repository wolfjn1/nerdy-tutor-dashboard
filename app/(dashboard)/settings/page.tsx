'use client'

import React, { useState, useRef, useEffect } from 'react'
import { 
  User, Mail, Phone, MapPin, Camera, Bell, Shield, 
  Globe, Key, Palette, Clock, Calendar, Save, 
  Check, AlertCircle, ChevronRight, Upload,
  Smartphone, Monitor, Moon, Sun, Languages,
  CreditCard, FileText, LogOut, Trash2
} from 'lucide-react'
import { Button, Badge, Avatar, Modal, ThemeToggle } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useTutorStore } from '@/lib/stores/tutorStore'
import { useToastHelpers } from '@/components/ui'

export default function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { tutor, setTutor, updateTutorAvatar } = useTutorStore()
  const { success, error } = useToastHelpers()
  
  const [activeSection, setActiveSection] = useState('profile')
  const [profileData, setProfileData] = useState({
    firstName: tutor?.firstName || 'John',
    lastName: tutor?.lastName || 'Doe',
    email: tutor?.email || 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: tutor?.bio || 'Expert tutor with 3+ years of experience in Mathematics, Physics, and Chemistry. Passionate about helping students achieve their academic goals.',
    avatar_url: tutor?.avatar_url || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face'
  })

  // Initialize tutor if not set
  useEffect(() => {
    if (!tutor) {
      setTutor({
        id: 'tutor-001',
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url,
        hourlyRate: 85,
        subjects: ['Mathematics', 'Physics', 'Chemistry', 'Calculus'],
        availability: {},
        rating: 4.9,
        totalEarnings: 15750,
        totalHours: 185,
        joinDate: new Date('2022-03-01'),
        isVerified: true,
        badges: ['expert', 'top-rated']
      })
    }
  }, [tutor, setTutor, profileData])
  
  const [notifications, setNotifications] = useState({
    emailNewStudent: true,
    emailSessionReminder: true,
    emailPayment: true,
    pushNewStudent: true,
    pushSessionReminder: true,
    pushPayment: false,
    smsSessionReminder: false
  })

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showRating: true,
    showSessionCount: true,
    showResponseTime: true
  })

  const [preferences, setPreferences] = useState({
    language: 'english',
    timezone: 'PST',
    theme: 'light',
    sessionReminder: '15',
    autoAcceptReschedule: false
  })

  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Palette },
    { id: 'security', label: 'Security', icon: Key },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'account', label: 'Account', icon: FileText }
  ]

  const handleSave = () => {
    setIsSaving(true)
    
    // Update the store with new profile data
    if (tutor) {
      setTutor({
        ...tutor,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        email: profileData.email,
        bio: profileData.bio,
        avatar_url: profileData.avatar_url
      })
    }
    
    setTimeout(() => {
      setIsSaving(false)
      success('Settings saved successfully!')
    }, 1500)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      error('Please upload an image file')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      error('File size must be less than 5MB')
      return
    }

    // Create a FileReader to convert the image to base64
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setProfileData({ ...profileData, avatar_url: base64String })
      updateTutorAvatar(base64String)
      success('Profile picture updated!')
    }
    reader.readAsDataURL(file)
  }

  const renderProfileSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Profile Information</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Update your personal information and profile picture</p>
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
        <Avatar
          src={profileData.avatar_url}
          fallback={profileData.firstName && profileData.lastName ? `${profileData.firstName[0]}${profileData.lastName[0]}` : "JD"}
          size="2xl"
          className="border-4 border-gray-200"
          animate={false}
        />
        <div className="text-center sm:text-left">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button 
            variant="outline" 
            size="sm" 
            className="mb-2"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload New Picture
          </Button>
          <p className="text-xs text-gray-500 dark:text-gray-400">JPG, PNG or GIF. Max size 5MB.</p>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              First Name
            </label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Last Name
            </label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email Address
          </label>
          <input
            type="email"
            value={profileData.email}
            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Bio
          </label>
          <textarea
            value={profileData.bio}
            onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 resize-none"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{profileData.bio.length}/500 characters</p>
        </div>
      </div>
    </div>
  )

  const renderNotificationsSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Notification Preferences</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Choose how you want to be notified about important updates</p>
      </div>

      <div className="space-y-6">
        {/* Email Notifications */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4" />
            Email Notifications
          </h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">New Student Requests</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Get notified when students want to book sessions</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailNewStudent}
                onChange={(e) => setNotifications({ ...notifications, emailNewStudent: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Session Reminders</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Receive reminders before upcoming sessions</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailSessionReminder}
                onChange={(e) => setNotifications({ ...notifications, emailSessionReminder: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Payment Updates</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Get notified about payments and invoices</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.emailPayment}
                onChange={(e) => setNotifications({ ...notifications, emailPayment: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </label>
          </div>
        </div>

        {/* Push Notifications */}
        <div>
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            Push Notifications
          </h4>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">New Student Requests</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Instant notifications on your device</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.pushNewStudent}
                onChange={(e) => setNotifications({ ...notifications, pushNewStudent: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </label>

            <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Session Reminders</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Get push notifications before sessions</div>
              </div>
              <input
                type="checkbox"
                checked={notifications.pushSessionReminder}
                onChange={(e) => setNotifications({ ...notifications, pushSessionReminder: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  const renderPrivacySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Privacy Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Control who can see your profile and information</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Profile Visibility
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="public"
                checked={privacy.profileVisibility === 'public'}
                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                className="w-4 h-4 text-purple-600 dark:focus:ring-purple-400"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">Public</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Anyone can view your profile</div>
              </div>
            </label>
            <label className="flex items-center p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
              <input
                type="radio"
                name="visibility"
                value="students"
                checked={privacy.profileVisibility === 'students'}
                onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
                className="w-4 h-4 text-purple-600 dark:focus:ring-purple-400"
              />
              <div className="ml-3">
                <div className="font-medium text-gray-900 dark:text-gray-100">Students Only</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Only your students can view your full profile</div>
              </div>
            </label>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-medium text-gray-900 dark:text-gray-100">Profile Information</h4>
          
          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Show Rating</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Display your average rating on your profile</div>
            </div>
            <input
              type="checkbox"
              checked={privacy.showRating}
              onChange={(e) => setPrivacy({ ...privacy, showRating: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">Show Session Count</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Display total number of completed sessions</div>
            </div>
            <input
              type="checkbox"
              checked={privacy.showSessionCount}
              onChange={(e) => setPrivacy({ ...privacy, showSessionCount: e.target.checked })}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </label>
        </div>
      </div>
    </div>
  )

  const renderPreferencesSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Platform Preferences</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Customize your experience on the platform</p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Language
          </label>
          <select
            value={preferences.language}
            onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          >
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="german">German</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Timezone
          </label>
          <select
            value={preferences.timezone}
            onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          >
            <option value="PST">Pacific Time (PST)</option>
            <option value="EST">Eastern Time (EST)</option>
            <option value="CST">Central Time (CST)</option>
            <option value="MST">Mountain Time (MST)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Theme
          </label>
          <div className="flex items-center gap-4">
            <ThemeToggle showLabel />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Choose your preferred color scheme
            </span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Session Reminder Time
          </label>
          <select
            value={preferences.sessionReminder}
            onChange={(e) => setPreferences({ ...preferences, sessionReminder: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
          >
            <option value="5">5 minutes before</option>
            <option value="10">10 minutes before</option>
            <option value="15">15 minutes before</option>
            <option value="30">30 minutes before</option>
            <option value="60">1 hour before</option>
          </select>
        </div>

        <label className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <div>
            <div className="font-medium text-gray-900 dark:text-gray-100">Auto-accept Reschedule Requests</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Automatically approve student reschedule requests</div>
          </div>
          <input
            type="checkbox"
            checked={preferences.autoAcceptReschedule}
            onChange={(e) => setPreferences({ ...preferences, autoAcceptReschedule: e.target.checked })}
            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500 dark:focus:ring-purple-400"
          />
        </label>
      </div>
    </div>
  )

  const renderSecuritySection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Security Settings</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Keep your account secure</p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => setShowPasswordModal(true)}
          className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Change Password</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Update your password regularly for security</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Add an extra layer of security</div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800" animate={false}>
              Not Enabled
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Enable 2FA
          </Button>
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Login Activity</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
              <div>
                <div className="text-gray-900 dark:text-gray-100">Chrome on Mac</div>
                <div className="text-gray-500 dark:text-gray-400">San Francisco, CA</div>
              </div>
              <div className="text-gray-500 dark:text-gray-400">Current session</div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <div className="text-gray-900 dark:text-gray-100">Safari on iPhone</div>
                <div className="text-gray-500 dark:text-gray-400">San Francisco, CA</div>
              </div>
              <div className="text-gray-500 dark:text-gray-400">2 hours ago</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBillingSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Billing & Payment</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your payment methods and billing information</p>
      </div>

      <div className="space-y-4">
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">Payment Method</h4>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                <CreditCard className="w-6 h-4 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Bank Account ****4567</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Direct Deposit</div>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800" animate={false}>
              Default
            </Badge>
          </div>
          <Button variant="outline" size="sm" className="w-full">
            Update Payment Method
          </Button>
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Tax Information</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Keep your tax information up to date for accurate reporting</p>
          <Button variant="outline" size="sm" className="w-full">
            Update Tax Info
          </Button>
        </div>

        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Invoice Settings</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Default Payment Terms
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400">
                <option>Due on receipt</option>
                <option>Net 7 days</option>
                <option>Net 14 days</option>
                <option>Net 30 days</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAccountSection = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">Account Management</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage your account settings and data</p>
      </div>

      <div className="space-y-4">
        <button className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Download Your Data</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Get a copy of all your data</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        <button className="w-full p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogOut className="w-5 h-5 text-gray-400" />
              <div>
                <div className="font-medium text-gray-900 dark:text-gray-100">Sign Out</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Sign out of your account</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </div>
        </button>

        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="w-full p-4 border border-red-200 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-left"
          >
            <div className="flex items-center gap-3">
              <Trash2 className="w-5 h-5 text-red-500" />
              <div>
                <div className="font-medium text-red-700 dark:text-red-400">Delete Account</div>
                <div className="text-sm text-red-500 dark:text-red-400">Permanently delete your account and all data</div>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'profile':
        return renderProfileSection()
      case 'notifications':
        return renderNotificationsSection()
      case 'privacy':
        return renderPrivacySection()
      case 'preferences':
        return renderPreferencesSection()
      case 'security':
        return renderSecuritySection()
      case 'billing':
        return renderBillingSection()
      case 'account':
        return renderAccountSection()
      default:
        return renderProfileSection()
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Mobile Section Selector */}
      <div className="md:hidden mb-4">
        <select
          value={activeSection}
          onChange={(e) => setActiveSection(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
        >
          {sections.map((section) => (
            <option key={section.id} value={section.id}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Desktop Sidebar Navigation */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <nav className="space-y-1" style={{ opacity: '1 !important', transform: 'none !important' }}>
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all",
                    activeSection === section.id 
                      ? "bg-purple-50 text-purple-700 font-medium dark:bg-purple-900/30 dark:text-purple-300" 
                      : "text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700"
                  )}
                >
                  <Icon className="w-5 h-5" />
                  {section.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 md:p-6" style={{ opacity: '1 !important', transform: 'none !important' }}>
            {renderContent()}

            {/* Save Button */}
            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center sm:text-left">
                {isSaving ? 'Saving changes...' : 'Remember to save your changes'}
              </p>
              <Button
                variant="gradient"
                gradientType="nerdy"
                onClick={handleSave}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        description="Are you sure you want to delete your account? This action cannot be undone."
        size="sm"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-red-700 dark:text-red-400">
                <p className="font-medium mb-1">This will permanently delete:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your profile and all personal data</li>
                  <li>Session history and student records</li>
                  <li>Earnings and payment information</li>
                  <li>All messages and communications</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              className="flex-1 bg-red-600 hover:bg-red-700 text-white dark:bg-red-700 dark:hover:bg-red-800"
            >
              Delete Account
            </Button>
          </div>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title="Change Password"
        description="Enter your current password and choose a new one"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must be at least 8 characters</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              gradientType="nerdy"
              className="flex-1"
            >
              Update Password
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
} 