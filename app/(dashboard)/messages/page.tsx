'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { MessageCircle, Search, Phone, Video, Users } from 'lucide-react'
import { Card, Button, Avatar } from '@/components/ui'
import { useAuth } from '@/lib/auth/auth-context'
import { getConversations, createConversation } from '@/lib/api/messages'
import { getStudents } from '@/lib/api/students'
import type { Conversation } from '@/lib/api/messages'
import type { Student } from '@/lib/types'
import { formatDistanceToNow } from '@/lib/utils'

export default function MessagesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { tutor, loading: authLoading } = useAuth()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && tutor) {
      loadData()
    } else if (!authLoading && !tutor) {
      setLoading(false)
      setError('No tutor profile found. Please contact support.')
    }
  }, [tutor, authLoading])

  // Handle newConversation query parameter
  useEffect(() => {
    const newConversationStudentId = searchParams.get('newConversation')
    if (newConversationStudentId && students.length > 0 && tutor) {
      // Check if conversation already exists with this student
      const existingConversation = conversations.find(
        conv => conv.student_id === newConversationStudentId
      )
      
      if (existingConversation) {
        // Navigate to existing conversation
        router.push(`/messages/${existingConversation.id}`)
      } else {
        // Automatically create conversation and navigate to it
        const createAndNavigate = async () => {
          try {
            const conversation = await createConversation(
              tutor.id,
              newConversationStudentId,
              '' // No subject needed for direct messaging from student page
            )
            
            if (conversation) {
              router.push(`/messages/${conversation.id}`)
            }
          } catch (error) {
            console.error('Error creating conversation:', error)
          }
        }
        
        createAndNavigate()
      }
    }
  }, [searchParams, students, conversations, tutor])

  const loadData = async () => {
    if (!tutor) return
    
    setLoading(true)
    setError(null)
    try {
      const [convs, studs] = await Promise.all([
        getConversations(tutor.id),
        getStudents(tutor.id)
      ])
      setConversations(convs)
      setStudents(studs)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load conversations. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleConversationClick = (conversationId: string) => {
    router.push(`/messages/${conversationId}`)
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    
    if (diffInHours < 1) {
      return formatDistanceToNow(date) + ' ago'
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    } else if (diffInHours < 48) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.subject?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
            Messages 💬
          </h1>
          <p className="text-gray-600">
            Your conversations with students
          </p>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-0">
          <div className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Conversations */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      ) : error ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12"
        >
          <MessageCircle className="h-16 w-16 text-red-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Messages</h3>
          <p className="text-gray-500 mb-4">{error}</p>
          {tutor && (
            <Button 
              variant="outline" 
              onClick={() => loadData()}
            >
              Try Again
            </Button>
          )}
        </motion.div>
      ) : filteredConversations.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          {filteredConversations.map((conversation, index) => (
            <motion.div
              key={conversation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -2 }}
              onClick={() => handleConversationClick(conversation.id)}
            >
              <Card className="hover:shadow-lg transition-shadow duration-200 border-0 bg-white/80 backdrop-blur-sm cursor-pointer">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          src={conversation.participant.avatar_url}
                          fallback={conversation.participant.name[0]}
                          size="md"
                          showOnlineStatus
                          isOnline={conversation.participant.is_online}
                        />
                        {conversation.unread_count > 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                            {conversation.unread_count}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {conversation.participant.name}
                        </h3>
                        {conversation.last_message ? (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.last_message.sender_type === 'tutor' && 'You: '}
                            {conversation.last_message.content}
                          </p>
                        ) : (
                          <p className="text-sm text-gray-400 italic">No messages yet</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {conversation.last_message 
                          ? formatTimestamp(conversation.last_message.created_at)
                          : formatTimestamp(conversation.created_at)
                        }
                      </span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Phone className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Video className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center py-12"
        >
          <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {searchQuery ? 'No conversations found' : 'No Messages Yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery 
              ? 'Try a different search term'
              : 'Start a conversation by clicking the message button on any student\'s profile'
            }
          </p>
        </motion.div>
      )}
    </div>
  )
} 