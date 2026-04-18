import { supabase } from '@/shared/lib/supabase';
import type { Density, EditorFont, UIFont } from './store';

export type UserSettingsRow = {
  user_id: string;
  density: Density;
  ui_font: UIFont;
  editor_font: EditorFont;
  created_at: string;
  updated_at: string;
};

export type UserSettingsPatch = Partial<
  Pick<UserSettingsRow, 'density' | 'ui_font' | 'editor_font'>
>;

/** Fetch the logged-in user's settings row. Returns null if none exists yet. */
export async function getUserSettings(
  userId: string,
): Promise<UserSettingsRow | null> {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  return (data as UserSettingsRow | null) ?? null;
}

/** Upsert the settings row for the given user with the provided patch. */
export async function upsertUserSettings(
  userId: string,
  patch: UserSettingsPatch,
): Promise<UserSettingsRow> {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert(
      { user_id: userId, ...patch },
      { onConflict: 'user_id' },
    )
    .select()
    .single();
  if (error) throw error;
  return data as UserSettingsRow;
}
