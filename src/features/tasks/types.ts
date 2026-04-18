import type { Database } from '@/shared/lib/supabase';

export type Task = Database['public']['Tables']['tasks']['Row'];
export type TaskInsert = Database['public']['Tables']['tasks']['Insert'];
export type TaskUpdate = Database['public']['Tables']['tasks']['Update'];

export type Priority = 1 | 2 | 3 | 4;

/**
 * Todoist-style priority palette. P1 = loud red, P4 = neutral.
 * Used for the circular checkbox border/fill and the flag swatch in the picker.
 */
export const PRIORITY_META: Record<
  Priority,
  { label: string; dot: string; ringFilled: string }
> = {
  1: { label: 'Priority 1', dot: '#dc2626', ringFilled: '#fecaca' }, // red
  2: { label: 'Priority 2', dot: '#ea580c', ringFilled: '#fed7aa' }, // orange
  3: { label: 'Priority 3', dot: '#2563eb', ringFilled: '#bfdbfe' }, // blue
  4: { label: 'Priority 4', dot: '#9ca3af', ringFilled: 'transparent' }, // none
};

export type TaskInput = {
  title: string;
  description?: string;
  priority?: Priority;
  due_at?: string | null;
};
