import { supabase } from '@/lib/supabase'

// Get the current date (July 14, 2025)
const TODAY = new Date('2025-07-14T00:00:00Z')

export interface Message {
  id: string
  conversation_id: string
  sender_id: string
  sender_type: 'tutor' | 'student' | 'parent'
  content: string
  is_read: boolean
  created_at: string
  attachments?: MessageAttachment[]
  sender?: {
    name: string
    avatar_url?: string
  }
}

export interface MessageAttachment {
  id: string
  message_id: string
  file_name: string
  file_url: string
  file_type: string
  file_size: number
}

export interface Conversation {
  id: string
  tutor_id: string
  student_id: string
  parent_id?: string
  subject?: string
  last_message?: {
    content: string
    created_at: string
    sender_type: 'tutor' | 'student' | 'parent'
  }
  unread_count: number
  participant: {
    id: string
    name: string
    avatar_url?: string
    is_online?: boolean
    type: 'student' | 'parent'
  }
  created_at: string
  updated_at: string
}

export async function getConversations(tutorId: string): Promise<Conversation[]> {
  try {
    if (!tutorId) {
      console.log('[getConversations] No tutorId provided')
      return []
    }
    
    // Get conversations with basic query
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('tutor_id', tutorId)
      .order('updated_at', { ascending: false })

    if (error) {
      console.error('[getConversations] Error:', error)
      return []
    }
    
    if (!conversations || conversations.length === 0) {
      return []
    }

    // For now, return simplified conversation objects
    return conversations.map((conv: any) => ({
      id: conv.id,
      tutor_id: conv.tutor_id,
      student_id: conv.student_id,
      parent_id: conv.parent_id,
      subject: conv.subject,
      last_message: undefined,
      unread_count: 0,
      participant: {
        id: conv.student_id || 'unknown',
        name: 'Student',
        avatar_url: undefined,
        is_online: false,
        type: 'student' as const
      },
      created_at: conv.created_at,
      updated_at: conv.updated_at
    }))
  } catch (error) {
    console.error('Error fetching conversations:', error)
    return []
  }
}

export async function getConversation(conversationId: string): Promise<Conversation | null> {
  try {
    const { data: conversation, error } = await supabase
      .from('conversations')
      .select(`
        *,
        students!conversations_student_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url,
          parent_email,
          phone
        ),
        messages (
          content,
          created_at,
          sender_type,
          is_read,
          sender_id
        )
      `)
      .eq('id', conversationId)
      .single()

    if (error) throw error
    if (!conversation) return null

    const messages = conversation.messages || []
    const lastMessage = messages[0]
    
    // Count unread messages
    const unreadCount = messages.filter((msg: any) => !msg.is_read).length

    return {
      id: conversation.id,
      tutor_id: conversation.tutor_id,
      student_id: conversation.student_id,
      parent_id: conversation.parent_id,
      subject: conversation.subject,
      last_message: lastMessage ? {
        content: lastMessage.content,
        created_at: lastMessage.created_at,
        sender_type: lastMessage.sender_type
      } : undefined,
      unread_count: unreadCount,
      participant: {
        id: conversation.student_id,
        name: `${conversation.students.first_name} ${conversation.students.last_name}`,
        avatar_url: conversation.students.avatar_url,
        is_online: true, // Mock for now
        type: 'student' as const
      },
      created_at: conversation.created_at,
      updated_at: conversation.updated_at
    }
  } catch (error) {
    console.error('Error fetching conversation:', error)
    return null
  }
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        attachments:message_attachments (*)
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })

    if (error) throw error
    if (!messages) return []

    // Get conversation details to get participant info
    const { data: conversation } = await supabase
      .from('conversations')
      .select(`
        tutor_id,
        tutors!conversations_tutor_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        ),
        students!conversations_student_id_fkey (
          id,
          first_name,
          last_name,
          avatar_url
        )
      `)
      .eq('id', conversationId)
      .single()

    // Map messages with sender info
    return messages.map((msg: any) => ({
      id: msg.id,
      conversation_id: msg.conversation_id,
      sender_id: msg.sender_id,
      sender_type: msg.sender_type,
      content: msg.content,
      is_read: msg.is_read,
      created_at: msg.created_at,
      attachments: msg.attachments,
      sender: msg.sender_type === 'tutor' && conversation?.tutors
        ? {
            name: Array.isArray(conversation.tutors) 
              ? `${conversation.tutors[0]?.first_name || 'Unknown'} ${conversation.tutors[0]?.last_name || 'Tutor'}`
              : `${conversation.tutors.first_name} ${conversation.tutors.last_name}`,
            avatar_url: Array.isArray(conversation.tutors)
              ? conversation.tutors[0]?.avatar_url
              : conversation.tutors.avatar_url
          }
        : msg.sender_type === 'student' && conversation?.students
        ? {
            name: Array.isArray(conversation.students)
              ? `${conversation.students[0]?.first_name || 'Unknown'} ${conversation.students[0]?.last_name || 'Student'}`
              : `${conversation.students.first_name} ${conversation.students.last_name}`,
            avatar_url: Array.isArray(conversation.students)
              ? conversation.students[0]?.avatar_url
              : conversation.students.avatar_url
          }
        : undefined
    }))
  } catch (error) {
    console.error('Error fetching messages:', error)
    return []
  }
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  senderType: 'tutor' | 'student' | 'parent' = 'tutor'
): Promise<Message | null> {
  try {
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        sender_type: senderType,
        content,
        is_read: false
      })
      .select()
      .single()

    if (error) throw error

    // Update conversation's updated_at
    await supabase
      .from('conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', conversationId)

    return message
  } catch (error) {
    console.error('Error sending message:', error)
    return null
  }
}

export async function markMessagesAsRead(
  conversationId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId)
      .eq('is_read', false)

    if (error) throw error
    return true
  } catch (error) {
    console.error('Error marking messages as read:', error)
    return false
  }
}

export async function createConversation(
  tutorId: string,
  studentId: string,
  subject?: string
): Promise<Conversation | null> {
  try {
    // Check if conversation already exists
    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId)
      .single()

    if (existing) {
      return getConversation(existing.id)
    }

    // Create new conversation
    const { data: conversation, error } = await supabase
      .from('conversations')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        subject
      })
      .select()
      .single()

    if (error) throw error
    return getConversation(conversation.id)
  } catch (error) {
    console.error('Error creating conversation:', error)
    return null
  }
}

export async function getUnreadMessageCount(tutorId: string): Promise<number> {
  try {
    const { data: conversations } = await supabase
      .from('conversations')
      .select('id')
      .eq('tutor_id', tutorId)

    if (!conversations) return 0

    const conversationIds = conversations.map(c => c.id)
    
    const { count, error } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('conversation_id', conversationIds)
      .neq('sender_id', tutorId)
      .eq('is_read', false)

    if (error) throw error
    return count || 0
  } catch (error) {
    console.error('Error getting unread count:', error)
    return 0
  }
} 