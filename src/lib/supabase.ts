import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on your current schema
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          type: string;
          status: string;
          folder_id: string | null;
          created_at: string;
          updated_at: string;
          tags: string[];
          starred: boolean;
          priority: string | null;
          font_family: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string;
          type?: string;
          status?: string;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          starred?: boolean;
          priority?: string | null;
          font_family?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          type?: string;
          status?: string;
          folder_id?: string | null;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          starred?: boolean;
          priority?: string | null;
          font_family?: string;
          user_id?: string;
        };
      };
      folders: {
        Row: {
          id: string;
          name: string;
          color: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          name: string;
          color?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          id?: string;
          name?: string;
          color?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
          user_id?: string;
        };
      };
    };
  };
} 