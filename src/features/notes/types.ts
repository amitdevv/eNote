import type { Database, NoteDoc } from '@/shared/lib/supabase';

export type Note = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export const EMPTY_DOC: NoteDoc = { type: 'doc', content: [] };
