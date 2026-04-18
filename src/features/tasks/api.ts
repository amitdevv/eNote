import { supabase } from '@/shared/lib/supabase';
import type { Task, TaskInput, TaskUpdate } from './types';

export async function listTasks(userId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('done', { ascending: true })
    // Pending tasks: due date first (nulls last, chronological), then priority, then recency.
    .order('due_at', { ascending: true, nullsFirst: false })
    .order('priority', { ascending: true })
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createTask(userId: string, input: TaskInput): Promise<Task> {
  const title = input.title.trim();
  if (!title) throw new Error('Task title is required');
  // Only attach description / priority when they diverge from defaults so the
  // insert still works against a DB that has not yet run the extras migration.
  const description = input.description?.trim();
  const payload: Record<string, unknown> = { user_id: userId, title };
  if (description) payload.description = description;
  if (input.priority && input.priority !== 4) payload.priority = input.priority;
  if (input.due_at) payload.due_at = input.due_at;
  const { data, error } = await supabase
    .from('tasks')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateTask(id: string, patch: TaskUpdate): Promise<Task> {
  const normalised: TaskUpdate = { ...patch };
  if (patch.title !== undefined) {
    const t = patch.title.trim();
    if (!t) throw new Error('Task title is required');
    normalised.title = t;
  }
  if (patch.description !== undefined) {
    normalised.description = patch.description.trim();
  }
  const { data, error } = await supabase
    .from('tasks')
    .update(normalised)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  if (error) throw error;
}

export async function clearCompleted(userId: string): Promise<void> {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('user_id', userId)
    .eq('done', true);
  if (error) throw error;
}
