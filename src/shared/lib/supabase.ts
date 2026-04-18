import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!url || !anonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env');
}

export const supabase = createClient<Database>(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'enote-auth',
  },
});

// ─── Database types ─────────────────────────────────────────────────────────
// Mirrors supabase/migrations/20260418000000_reset.sql

export type NoteDoc = {
  type: 'doc';
  content: unknown[];
};

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database['public']['Tables']['profiles']['Row']> & { id: string };
        Update: Partial<Database['public']['Tables']['profiles']['Row']>;
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: NoteDoc;
          content_text: string;
          archived: boolean;
          pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          content?: NoteDoc;
          content_text?: string;
          archived?: boolean;
          pinned?: boolean;
        };
        Update: {
          title?: string;
          content?: NoteDoc;
          content_text?: string;
          archived?: boolean;
          pinned?: boolean;
        };
      };
    };
  };
}
