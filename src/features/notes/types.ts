import type { Database, NoteDoc } from '@/shared/lib/supabase';

export type Note = Database['public']['Tables']['notes']['Row'];
export type NoteInsert = Database['public']['Tables']['notes']['Insert'];
export type NoteUpdate = Database['public']['Tables']['notes']['Update'];

export const EMPTY_DOC: NoteDoc = { type: 'doc', content: [] };

/**
 * The title to show in lists, the command palette, window titles, etc.
 * If the user hasn't typed a title (still 'Untitled' or empty), derive one
 * from the first non-empty line of content. This matches Apple Notes / Bear.
 */
export function getDisplayTitle(note: Pick<Note, 'title' | 'content_text'>): string {
  const t = note.title?.trim();
  if (t && t !== 'Untitled') return t;
  const firstLine = note.content_text
    ?.split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  return firstLine ? firstLine.slice(0, 100) : 'Untitled';
}
