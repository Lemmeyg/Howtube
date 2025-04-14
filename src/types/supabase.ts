export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          subscription_tier: 'free' | 'pro' | 'enterprise'
          is_admin: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          subscription_tier?: 'free' | 'pro' | 'enterprise'
          is_admin?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      feature_configs: {
        Row: {
          id: string
          tier: 'free' | 'pro' | 'enterprise'
          feature: 'transcription' | 'aiProcessing' | 'export' | 'collaboration' | 'customBranding'
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tier: 'free' | 'pro' | 'enterprise'
          feature: 'transcription' | 'aiProcessing' | 'export' | 'collaboration' | 'customBranding'
          enabled: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tier?: 'free' | 'pro' | 'enterprise'
          feature?: 'transcription' | 'aiProcessing' | 'export' | 'collaboration' | 'customBranding'
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      videos: {
        Row: {
          id: string
          user_id: string
          youtube_url: string
          title: string
          status: 'pending' | 'processing' | 'completed' | 'error'
          progress: number
          transcription: string | null
          processed_content: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          youtube_url: string
          title: string
          status?: 'pending' | 'processing' | 'completed' | 'error'
          progress?: number
          transcription?: string | null
          processed_content?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          youtube_url?: string
          title?: string
          status?: 'pending' | 'processing' | 'completed' | 'error'
          progress?: number
          transcription?: string | null
          processed_content?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_tier: 'free' | 'pro' | 'enterprise'
      feature_name: 'transcription' | 'aiProcessing' | 'export' | 'collaboration' | 'customBranding'
      video_status: 'pending' | 'processing' | 'completed' | 'error'
    }
  }
} 