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
      videos: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          youtube_url: string
          status: string
          progress: number
          transcription: string | null
          processed_content: Json | null
          error_message: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          youtube_url: string
          status?: string
          progress?: number
          transcription?: string | null
          processed_content?: Json | null
          error_message?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          youtube_url?: string
          status?: string
          progress?: number
          transcription?: string | null
          processed_content?: Json | null
          error_message?: string | null
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
      [_ in never]: never
    }
  }
} 