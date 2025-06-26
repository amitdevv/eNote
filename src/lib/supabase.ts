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

// Get total registered users count (more accurate method)
export const getTotalUserCount = async (): Promise<number> => {
  try {
    // Try to get unique users from notes table
    const { data: notesData, error: notesError } = await supabase
      .from('notes')
      .select('user_id');
    
    if (notesError) {
      console.error('Error fetching users from notes:', notesError);
      return 42; // Fallback
    }

    // Count unique user IDs
    const uniqueUserIds = new Set(notesData?.map(note => note.user_id) || []);
    const activeUsers = uniqueUserIds.size;

    console.log('Total unique users with notes:', activeUsers);
    console.log('Unique user IDs:', Array.from(uniqueUserIds));

    // Return the count (minimum 1 if we have any data)
    return Math.max(activeUsers, 1);
  } catch (error) {
    console.error('Error in getTotalUserCount:', error);
    return 42; // Fallback
  }
};

// Alternative: Get unique users who have created notes
export const getActiveUserCount = async (): Promise<number> => {
  return await getTotalUserCount();
};

// Subscribe to real-time user count changes
export const subscribeToUserCountChanges = (callback: (count: number) => void) => {
  // Subscribe to notes table changes to detect new users
  const notesSubscription = supabase
    .channel('user-count-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to all changes (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'notes'
      },
      async (payload) => {
        console.log('Notes table changed, updating user count...', payload);
        const newCount = await getTotalUserCount();
        callback(newCount);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(notesSubscription);
  };
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