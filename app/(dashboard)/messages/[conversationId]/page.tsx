'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Send, Paperclip, Phone, Video, MoreVertical, Check, CheckCheck } from 'lucide-react'
import { Card, Button, Avatar, Badge } from '@/components/ui'
import { useTutorStore } from '@/lib/stores/tutorStore'
import { getConversation, getMessages, sendMessage, markMessagesAsRead } from '@/lib/api/messages'
import type { Conversation, Message } from '@/lib/api/messages'
import { formatDistanceToNow } from '@/lib/utils'

export default function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { tutor } = useTutorStore()
  const conversationId = params.conversationId as string
  
  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    loadConversation()
  }, [conversationId])

  useEffect(() => {
    // Scroll to bottom when messages change
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Mark messages as read when conversation is opened
    if (tutor && conversationId) {
      markMessagesAsRead(conversationId, tutor.id)
    }
  }, [conversationId, tutor])

  const loadConversation = async () => {
    setLoading(true)
    try {
      const [conv, msgs] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId)
      ])
      
      if (conv) {
        setConversation(conv)
        setMessages(msgs)
      }
    } catch (error) {
      console.error('Error loading conversation:', error)
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !tutor || sending) return

    setSending(true)
    const messageContent = newMessage.trim()
    setNewMessage('')

    try {
      const sentMessage = await sendMessage(conversationId, tutor.id, messageContent)
      if (sentMessage) {
        // Add the message to the list immediately for better UX
        const newMsg: Message = {
          ...sentMessage,
          sender: {
            name: `${tutor.first_name} ${tutor.last_name}`,
            avatar_url: tutor.avatar_url
          }
        }
        setMessages([...messages, newMsg])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      // Restore the message if sending failed
      setNewMessage(messageContent)
    } finally {
      setSending(false)
      messageInputRef.current?.focus()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const isToday = date.toDateString() === now.toDateString()
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    }
    
    return formatDistanceToNow(date) + ' ago'
  }

  const renderMessage = (message: Message, index: number) => {
    const isOwn = message.sender_id === tutor?.id
    const prevMessage = index > 0 ? messages[index - 1] : null
    const showAvatar = !prevMessage || prevMessage.sender_id !== message.sender_id

    return (
      <motion.div
        key={message.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.01 }}
        className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div className={`flex ${isOwn ? 'flex-row-reverse' : 'flex-row'} items-end gap-2 max-w-[70%]`}>
          {!isOwn && (
            <div className="w-8">
              {showAvatar && (
                <Avatar
                  src={message.sender?.avatar_url}
                  fallback={message.sender?.name?.[0] || '?'}
                  size="sm"
                />
              )}
            </div>
          )}
          
          <div>
            {showAvatar && !isOwn && (
              <div className="text-xs text-gray-500 mb-1 ml-2">
                {message.sender?.name}
              </div>
            )}
            
            <div
              className={`
                rounded-2xl px-4 py-2 
                ${isOwn 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white' 
                  : 'bg-gray-100 text-gray-900'
                }
              `}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
            </div>
            
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <span className="text-xs text-gray-400">
                {formatMessageTime(message.created_at)}
              </span>
              {isOwn && (
                <span className="text-xs text-gray-400">
                  {message.is_read ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />}
                </span>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Conversation not found</p>
        <Button onClick={() => router.push('/messages')}>
          Back to Messages
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      {/* Header */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 mb-4">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/messages')}
                className="h-8 w-8 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              
              <Avatar
                src={conversation.participant.avatar_url}
                fallback={conversation.participant.name[0]}
                size="md"
                showOnlineStatus
                isOnline={conversation.participant.is_online}
              />
              
              <div>
                <h3 className="font-semibold text-gray-900">
                  {conversation.participant.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {conversation.participant.is_online ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <Video className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Messages */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Start a conversation with {conversation.participant.name}</p>
            </div>
          ) : (
            <div>
              {messages.map((message, index) => renderMessage(message, index))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Message Input */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex items-end gap-2">
            <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <div className="flex-1">
              <textarea
                ref={messageInputRef}
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={1}
                style={{ minHeight: '40px', maxHeight: '120px' }}
              />
            </div>
            
            <Button
              variant="gradient"
              gradientType="nerdy"
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="h-10 w-10 p-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
} 