'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, Send, Search, Phone, Video } from 'lucide-react'
import { Card, Button, Avatar } from '@/components/ui'

export default function MessagesPage() {
  const conversations = [
    {
      id: '1',
      name: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b647?w=100&h=100&fit=crop&crop=face',
      lastMessage: 'Thanks for the calculus help today!',
      timestamp: '2 min ago',
      unread: 2,
      isOnline: true
    },
    {
      id: '2', 
      name: 'Marcus Johnson',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
      lastMessage: 'Can we reschedule tomorrow\'s session?',
      timestamp: '1 hour ago',
      unread: 1,
      isOnline: false
    },
    {
      id: '3',
      name: 'Emma Wilson',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
      lastMessage: 'The chemistry homework makes sense now!',
      timestamp: '3 hours ago',
      unread: 0,
      isOnline: true
    }
  ]

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
            Communicate with your students and their parents
          </p>
        </div>
        <Button variant="gradient" gradientType="nerdy">
          <Send className="w-4 h-4 mr-2" />
          New Message
        </Button>
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
                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Conversations */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4"
      >
        {conversations.map((conversation, index) => (
          <motion.div
            key={conversation.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-200 border-0 bg-white/80 backdrop-blur-sm cursor-pointer">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar
                        src={conversation.avatar}
                        fallback={conversation.name[0]}
                        size="md"
                        showOnlineStatus
                        isOnline={conversation.isOnline}
                      />
                      {conversation.unread > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-purple-600 text-white text-xs rounded-full flex items-center justify-center">
                          {conversation.unread}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {conversation.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {conversation.timestamp}
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

      {/* Empty State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center py-12"
      >
        <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Stay Connected
        </h3>
        <p className="text-gray-500">
          Build stronger relationships with your students through regular communication
        </p>
      </motion.div>
    </div>
  )
} 