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
          username: string
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: number
          name: string
          slug: string
          description: string | null
          icon: string | null
          color: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          description?: string | null
          icon?: string | null
          color?: string | null
          created_at?: string
        }
      }
      notes: {
        Row: {
          id: number
          title: string
          content: string
          module_id: number
          author_id: string
          status: 'draft' | 'published' | 'archived'
          category: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          title: string
          content?: string
          module_id: number
          author_id: string
          status?: 'draft' | 'published' | 'archived'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          title?: string
          content?: string
          module_id?: number
          author_id?: string
          status?: 'draft' | 'published' | 'archived'
          category?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tags: {
        Row: {
          id: number
          name: string
          color: string | null
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          color?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          color?: string | null
          created_at?: string
        }
      }
      note_tags: {
        Row: {
          note_id: number
          tag_id: number
          created_at: string
        }
        Insert: {
          note_id: number
          tag_id: number
          created_at?: string
        }
        Update: {
          note_id?: number
          tag_id?: number
          created_at?: string
        }
      }
      attachments: {
        Row: {
          id: number
          note_id: number
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          created_at: string
        }
        Insert: {
          id?: number
          note_id: number
          file_name: string
          file_path: string
          file_size: number
          mime_type: string
          created_at?: string
        }
        Update: {
          id?: number
          note_id?: number
          file_name?: string
          file_path?: string
          file_size?: number
          mime_type?: string
          created_at?: string
        }
      }
      change_logs: {
        Row: {
          id: number
          note_id: number
          user_id: string
          action: 'create' | 'update' | 'delete'
          description: string | null
          created_at: string
        }
        Insert: {
          id?: number
          note_id: number
          user_id: string
          action: 'create' | 'update' | 'delete'
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: number
          note_id?: number
          user_id?: string
          action?: 'create' | 'update' | 'delete'
          description?: string | null
          created_at?: string
        }
      }
      module_stats: {
        Row: {
          id: number
          module_id: number
          total_notes: number
          last_updated: string
          created_at: string
        }
        Insert: {
          id?: number
          module_id: number
          total_notes?: number
          last_updated?: string
          created_at?: string
        }
        Update: {
          id?: number
          module_id?: number
          total_notes?: number
          last_updated?: string
          created_at?: string
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