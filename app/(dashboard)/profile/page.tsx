'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  User, Mail, Phone, MapPin, Calendar, Star, Edit, Save, X,
  GraduationCap, Award, Globe, Clock, DollarSign, Bell, Shield,
  Camera, Plus, Trash2
} from 'lucide-react'
import { Card, Button, Avatar, Badge } from '@/components/ui'
import { useTutorStore } from '@/lib/stores/tutorStore'
import { getTutorProfile, updateTutorProfile, updateAvailability, updatePreferences } from '@/lib/api/profile'
import type { TutorProfile, AvailabilitySlot, TutorPreferences } from '@/lib/api/profile'

const DAYS_OF_WEEK = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export default function ProfilePage() {
  const { tutor, level, totalXP } = useTutorStore()
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'education' | 'settings'>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [profile, setProfile] = useState<TutorProfile | null>(null)
  const [editedProfile, setEditedProfile] = useState<TutorProfile | null>(null)

  useEffect(() => {
    if (tutor) {
      loadProfile()
    }
  }, [tutor])

  const loadProfile = async () => {
    if (!tutor) return
    
    setLoading(true)
    try {
      const profileData = await getTutorProfile(tutor.id)
      setProfile(profileData)
      setEditedProfile(profileData)
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!tutor || !editedProfile) return

    setSaving(true)
    try {
      await updateTutorProfile(tutor.id, editedProfile)
      setProfile(editedProfile)
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
  }

  const renderOverviewTab = () => {
    if (!editedProfile) return null

    return (
      <div className="space-y-6">
        {/* Basic Info */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={editedProfile.first_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, first_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={editedProfile.last_name}
                      onChange={(e) => setEditedProfile({ ...editedProfile, last_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bio
                  </label>
                  <textarea
                    value={editedProfile.bio || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Tell students about yourself..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={editedProfile.phone || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hourly Rate ($)
                    </label>
                    <input
                      type="number"
                      value={editedProfile.hourly_rate}
                      onChange={(e) => setEditedProfile({ ...editedProfile, hourly_rate: Number(e.target.value) })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{editedProfile.first_name} {editedProfile.last_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{editedProfile.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium">{editedProfile.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Hourly Rate</p>
                    <p className="font-medium">${editedProfile.hourly_rate}/hour</p>
                  </div>
                </div>
                {editedProfile.bio && (
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Bio</p>
                    <p className="text-gray-700">{editedProfile.bio}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>

        {/* Subjects */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Teaching Subjects
            </h3>
            <div className="flex flex-wrap gap-2">
              {editedProfile.subjects.map((subject) => (
                <Badge key={subject} variant="gradient" gradient="nerdy" className="px-3 py-1">
                  {subject}
                </Badge>
              ))}
            </div>
          </div>
        </Card>

        {/* Languages */}
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Languages
            </h3>
            <div className="flex flex-wrap gap-2">
              {editedProfile.languages?.length ? (
                editedProfile.languages.map((language) => (
                  <Badge key={language} variant="outline" className="px-3 py-1">
                    {language}
                  </Badge>
                ))
              ) : (
                <p className="text-gray-500">No languages specified</p>
              )}
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderAvailabilityTab = () => {
    if (!editedProfile) return null

    return (
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Weekly Availability
            </h3>
            
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((day, index) => {
                const slots = editedProfile.availability.filter(slot => slot.day_of_week === index)
                
                return (
                  <div key={day} className="border-b pb-4 last:border-0">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{day}</h4>
                      {isEditing && (
                        <Button variant="ghost" size="sm">
                          <Plus className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                    {slots.length > 0 ? (
                      <div className="space-y-2">
                        {slots.map((slot, slotIndex) => (
                          <div key={slotIndex} className="flex items-center gap-2 text-sm">
                            <span className="text-gray-600">
                              {slot.start_time} - {slot.end_time}
                            </span>
                            {isEditing && (
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <X className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not available</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Booking Preferences
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Minimum advance booking</p>
                <p className="font-medium">{editedProfile.preferences.min_advance_booking_hours} hours</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Maximum advance booking</p>
                <p className="font-medium">{editedProfile.preferences.max_advance_booking_days} days</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Preferred session length</p>
                <p className="font-medium">{editedProfile.preferences.preferred_session_length} minutes</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Cancellation policy</p>
                <p className="font-medium">{editedProfile.preferences.cancellation_policy_hours} hours notice</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  const renderEducationTab = () => {
    if (!editedProfile) return null

    return (
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                Education
              </h3>
              {isEditing && (
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {editedProfile.education?.length ? (
              <div className="space-y-4">
                {editedProfile.education.map((edu, index) => (
                  <div key={index} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{edu.degree} in {edu.field_of_study}</h4>
                        <p className="text-gray-600">{edu.institution}</p>
                        <p className="text-sm text-gray-500">
                          {edu.start_year} - {edu.is_current ? 'Present' : edu.end_year}
                        </p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No education information added</p>
            )}
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Award className="w-5 h-5" />
                Certifications
              </h3>
              {isEditing && (
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              )}
            </div>
            
            {editedProfile.certifications?.length ? (
              <div className="space-y-4">
                {editedProfile.certifications.map((cert, index) => (
                  <div key={index} className="border-l-4 border-yellow-500 pl-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{cert.name}</h4>
                        <p className="text-gray-600">{cert.issuer}</p>
                        <p className="text-sm text-gray-500">
                          Issued: {new Date(cert.issue_date).toLocaleDateString()}
                          {cert.expiry_date && ` • Expires: ${new Date(cert.expiry_date).toLocaleDateString()}`}
                        </p>
                      </div>
                      {isEditing && (
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No certifications added</p>
            )}
          </div>
        </Card>
      </div>
    )
  }

  const renderSettingsTab = () => {
    if (!editedProfile) return null

    return (
      <div className="space-y-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h3>
            
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-gray-700">Email notifications</span>
                <input
                  type="checkbox"
                  checked={editedProfile.preferences.notification_email}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    preferences: { ...editedProfile.preferences, notification_email: e.target.checked }
                  })}
                  disabled={!isEditing}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-gray-700">SMS notifications</span>
                <input
                  type="checkbox"
                  checked={editedProfile.preferences.notification_sms}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    preferences: { ...editedProfile.preferences, notification_sms: e.target.checked }
                  })}
                  disabled={!isEditing}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between">
                <span className="text-gray-700">Push notifications</span>
                <input
                  type="checkbox"
                  checked={editedProfile.preferences.notification_push}
                  onChange={(e) => setEditedProfile({
                    ...editedProfile,
                    preferences: { ...editedProfile.preferences, notification_push: e.target.checked }
                  })}
                  disabled={!isEditing}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
              </label>
            </div>
          </div>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Privacy & Security
            </h3>
            
            <div className="space-y-3">
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Change Password</div>
                <div className="text-sm text-gray-500">Update your account password</div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Two-Factor Authentication</div>
                <div className="text-sm text-gray-500">Add an extra layer of security</div>
              </button>
              
              <button className="w-full p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="font-medium text-gray-900">Profile Visibility</div>
                <div className="text-sm text-gray-500">Control who can see your profile</div>
              </button>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Unable to load profile</p>
      </div>
    )
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
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button 
              variant="gradient" 
              gradientType="nerdy" 
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        ) : (
          <Button variant="gradient" gradientType="nerdy" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-6">
            <div className="flex items-center gap-6">
              <div className="relative">
                <Avatar
                  src={profile.avatar_url}
                  fallback={`${profile.first_name[0]}${profile.last_name[0]}`}
                  size="2xl"
                  className="border-4 border-purple-200"
                />
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-purple-600 text-white p-2 rounded-full shadow-lg hover:bg-purple-700 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {profile.first_name} {profile.last_name}
                  </h2>
                  <Badge variant="gradient" gradient="nerdy">
                    Level {level}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{profile.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>${profile.hourly_rate}/hour</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Star className="w-4 h-4" />
                    <span>{tutor?.rating || 0} rating</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Teaching since {profile.teaching_since ? new Date(profile.teaching_since).getFullYear() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex gap-2 mb-6">
          {(['overview', 'availability', 'education', 'settings'] as const).map((tab) => (
            <Button
              key={tab}
              variant={activeTab === tab ? 'gradient' : 'ghost'}
              gradientType={activeTab === tab ? 'nerdy' : undefined}
              onClick={() => setActiveTab(tab)}
              className="capitalize"
            >
              {tab}
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && renderOverviewTab()}
        {activeTab === 'availability' && renderAvailabilityTab()}
        {activeTab === 'education' && renderEducationTab()}
        {activeTab === 'settings' && renderSettingsTab()}
      </motion.div>
    </div>
  )
} 