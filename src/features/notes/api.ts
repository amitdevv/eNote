import { supabase } from '@/shared/lib/supabase';
import type { Note, NoteInsert, NoteUpdate } from './types';
import { EMPTY_DOC } from './types';

export type NoteSort = 'updated' | 'created' | 'title';
export type NotesListFilters = {
  archived?: boolean;
  pinnedOnly?: boolean;
  sort?: NoteSort;
};

export async function listNotes(userId: string, opts?: NotesListFilters): Promise<Note[]> {
  const { archived = false, pinnedOnly = false, sort = 'updated' } = opts ?? {};

  let q = supabase.from('notes').select('*').eq('user_id', userId).eq('archived', archived);
  if (pinnedOnly) q = q.eq('pinned', true);

  // Pinned always bubble to top (unless we're only showing pinned anyway).
  if (!pinnedOnly) q = q.order('pinned', { ascending: false });

  switch (sort) {
    case 'created':
      q = q.order('created_at', { ascending: false });
      break;
    case 'title':
      q = q.order('title', { ascending: true });
      break;
    case 'updated':
    default:
      q = q.order('updated_at', { ascending: false });
  }

  const { data, error } = await q;
  if (error) throw error;
  return data ?? [];
}

export async function getNote(id: string): Promise<Note | null> {
  const { data, error } = await supabase.from('notes').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function createNote(userId: string, partial?: Partial<NoteInsert>): Promise<Note> {
  const insert: NoteInsert = {
    user_id: userId,
    title: partial?.title ?? 'Untitled',
    content: partial?.content ?? EMPTY_DOC,
    content_text: partial?.content_text ?? '',
    ...partial,
  };
  const { data, error } = await supabase.from('notes').insert(insert).select().single();
  if (error) throw error;
  return data;
}

export async function updateNote(id: string, patch: NoteUpdate): Promise<Note> {
  const { data, error } = await supabase
    .from('notes')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteNote(id: string): Promise<void> {
  const { error } = await supabase.from('notes').delete().eq('id', id);
  if (error) throw error;
}

export async function searchNotes(userId: string, query: string): Promise<Note[]> {
  const q = query.trim();
  if (!q) return [];
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .textSearch('fts', q, { type: 'websearch' })
    .limit(50);
  if (error) throw error;
  return data ?? [];
}
