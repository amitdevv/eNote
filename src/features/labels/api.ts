import { supabase } from '@/shared/lib/supabase';
import type { Label, LabelInsert, LabelUpdate } from './types';

export async function listLabels(userId: string): Promise<Label[]> {
  const { data, error } = await supabase
    .from('labels')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
  if (error) throw error;
  return (data ?? []) as Label[];
}

export async function createLabel(userId: string, input: LabelInsert): Promise<Label> {
  const name = input.name.trim().toLowerCase().replace(/^#/, '');
  if (!name) throw new Error('Label name is required');
  const { data, error } = await supabase
    .from('labels')
    .insert({ user_id: userId, name, color: input.color })
    .select()
    .single();
  if (error) throw error;
  return data as Label;
}

export async function updateLabel(id: string, patch: LabelUpdate): Promise<Label> {
  const normalised: LabelUpdate = { ...patch };
  if (patch.name !== undefined) {
    normalised.name = patch.name.trim().toLowerCase().replace(/^#/, '');
  }
  const { data, error } = await supabase
    .from('labels')
    .update(normalised)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Label;
}

export async function deleteLabel(id: string): Promise<void> {
  const { error } = await supabase.from('labels').delete().eq('id', id);
  if (error) throw error;
}
