import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env.local file.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database type definitions
export interface Database {
  public: {
    Tables: {
      tutors: {
        Row: {
          id: string
          name: string
          email: string
          avatar: string
          title: string
          specialties: string[]
          rating: number
          total_sessions: number
          total_earnings: number
          join_date: string
          status: 'available' | 'busy' | 'away'
          location: string
          level: number
          xp: number
          xp_to_next_level: number
          streak: number
          rank: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          avatar?: string
          title: string
          specialties: string[]
          rating?: number
          total_sessions?: number
          total_earnings?: number
          join_date?: string
          status?: 'available' | 'busy' | 'away'
          location?: string
          level?: number
          xp?: number
          xp_to_next_level?: number
          streak?: number
          rank?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          email?: string
          avatar?: string
          title?: string
          specialties?: string[]
          rating?: number
          total_sessions?: number
          total_earnings?: number
          status?: 'available' | 'busy' | 'away'
          location?: string
          level?: number
          xp?: number
          xp_to_next_level?: number
          streak?: number
          rank?: string
          updated_at?: string
        }
      }
      sessions: {
        Row: {
          id: string
          tutor_id: string
          student_name: string
          student_avatar: string
          subject: string
          session_date: string
          session_time: string
          duration: number
          status: 'upcoming' | 'completed' | 'cancelled' | 'pending_confirmation'
          meeting_link?: string
          earnings: number
          rating?: number
          notes?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          student_name: string
          student_avatar?: string
          subject: string
          session_date: string
          session_time: string
          duration: number
          status?: 'upcoming' | 'completed' | 'cancelled' | 'pending_confirmation'
          meeting_link?: string
          earnings: number
          rating?: number
          notes?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          student_name?: string
          student_avatar?: string
          subject?: string
          session_date?: string
          session_time?: string
          duration?: number
          status?: 'upcoming' | 'completed' | 'cancelled' | 'pending_confirmation'
          meeting_link?: string
          earnings?: number
          rating?: number
          notes?: string
          updated_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          student_name: string
          student_avatar: string
          subject: string
          description: string
          urgency: 'high' | 'medium' | 'low'
          match_score: number
          duration: number
          frequency: string
          hourly_rate: number
          monthly_rate: number
          start_date: string
          format: 'online' | 'in_person'
          preferred_times: string[]
          student_needs: string
          created_at: string
        }
        Insert: {
          id?: string
          student_name: string
          student_avatar?: string
          subject: string
          description: string
          urgency?: 'high' | 'medium' | 'low'
          match_score?: number
          duration: number
          frequency: string
          hourly_rate: number
          monthly_rate: number
          start_date: string
          format?: 'online' | 'in_person'
          preferred_times: string[]
          student_needs: string
          created_at?: string
        }
        Update: {
          student_name?: string
          student_avatar?: string
          subject?: string
          description?: string
          urgency?: 'high' | 'medium' | 'low'
          match_score?: number
          duration?: number
          frequency?: string
          hourly_rate?: number
          monthly_rate?: number
          start_date?: string
          format?: 'online' | 'in_person'
          preferred_times?: string[]
          student_needs?: string
        }
      }
      administrative_tasks: {
        Row: {
          id: string
          tutor_id: string
          title: string
          description: string
          priority: 'high' | 'medium' | 'low'
          due_date: string
          category: string
          action_required: boolean
          completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tutor_id: string
          title: string
          description: string
          priority?: 'high' | 'medium' | 'low'
          due_date: string
          category: string
          action_required?: boolean
          completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          description?: string
          priority?: 'high' | 'medium' | 'low'
          due_date?: string
          category?: string
          action_required?: boolean
          completed?: boolean
          updated_at?: string
        }
      }
      achievements: {
        Row: {
          id: string
          tutor_id: string
          title: string
          description: string
          icon: string
          unlocked_at: string
          xp_reward: number
        }
        Insert: {
          id?: string
          tutor_id: string
          title: string
          description: string
          icon: string
          unlocked_at?: string
          xp_reward: number
        }
        Update: {
          title?: string
          description?: string
          icon?: string
          xp_reward?: number
        }
      }
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'] 