import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'enote-auth-session',
    storage: {
      getItem: (key: string) => {
        try {
          return localStorage.getItem(key);
        } catch (error) {
          console.warn('Failed to get item from localStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          localStorage.setItem(key, value);
        } catch (error) {
          console.warn('Failed to set item in localStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          localStorage.removeItem(key);
        } catch (error) {
          console.warn('Failed to remove item from localStorage:', error);
        }
      },
    },
  },
});

// Database types based on current schema
export interface Database {
  public: {
    Tables: {
      notes: {
        Row: {
          id: string;
          title: string;
          content: string;
          created_at: string;
          updated_at: string;
          tags: string[];
          starred: boolean;
          priority: string | null;
          font_family: string;
          font_size: number;
          user_id: string;
        };
        Insert: {
          id?: string;
          title: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          starred?: boolean;
          priority?: string | null;
          font_family?: string;
          font_size?: number;
          user_id: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          created_at?: string;
          updated_at?: string;
          tags?: string[];
          starred?: boolean;
          priority?: string | null;
          font_family?: string;
          font_size?: number;
          user_id?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string | null;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Functions: {
      get_total_user_count: {
        Args: {};
        Returns: number;
      };
      get_user_profiles_count: {
        Args: {};
        Returns: number;
      };
    };
  };
} 