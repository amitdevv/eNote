import { supabase } from '@/shared/lib/supabase';
import type { Note, NoteInsert, NoteUpdate } from './types';
import { EMPTY_DOC } from './types';

export async function listNotes(userId: string): Promise<Note[]> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('archived', false)
    .order('pinned', { ascending: false })
    .order('updated_at', { ascending: false });
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
