import { supabase } from '@/shared/lib/supabase';
import type { Highlight, HighlightInsert, HighlightUpdate } from './types';

export async function listHighlights(userId: string): Promise<Highlight[]> {
  const { data, error } = await supabase
    .from('highlights')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Highlight[];
}

export async function createHighlight(userId: string, input: HighlightInsert): Promise<Highlight> {
  const name = input.name.trim();
  if (!name) throw new Error('Highlight name is required');
  const { data, error } = await supabase
    .from('highlights')
    .insert({ user_id: userId, name, color: input.color })
    .select()
    .single();
  if (error) throw error;
  return data as Highlight;
}

export async function updateHighlight(id: string, patch: HighlightUpdate): Promise<Highlight> {
  const { data, error } = await supabase
    .from('highlights')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Highlight;
}

export async function deleteHighlight(id: string): Promise<void> {
  const { error } = await supabase.from('highlights').delete().eq('id', id);
  if (error) throw error;
}
