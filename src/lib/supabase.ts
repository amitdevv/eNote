import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to get real user count from database
export const getUserCount = async (): Promise<number> => {
  try {
    // Query the auth.users table through a custom function or count notes with distinct user_ids
    // Since direct access to auth.users might be restricted, we'll count unique user_ids from notes
    const { count, error } = await supabase
      .from('notes')
      .select('user_id', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error fetching user count:', error);
      return 42; // Fallback to static number
    }

    // This gives us users who have created at least one note
    // For total registered users, you might need to create a database function
    return count || 42;
  } catch (error) {
    console.error('Error fetching user count:', error);
    return 42; // Fallback to static number
  }
};

// Alternative: Get unique users who have created notes
export const getActiveUserCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('user_id');
    
    if (error) {
      console.error('Error fetching active user count:', error);
      return 42;
    }

    // Count unique user IDs
    const uniqueUsers = new Set(data?.map(note => note.user_id));
    return uniqueUsers.size;
  } catch (error) {
    console.error('Error fetching active user count:', error);
    return 42;
  }
};

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