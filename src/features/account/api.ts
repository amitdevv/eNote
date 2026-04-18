import { supabase } from '@/shared/lib/supabase';
import type { Database } from '@/shared/lib/supabase';

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfilePatch = Pick<
  Database['public']['Tables']['profiles']['Update'],
  'display_name' | 'avatar_url'
>;

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function updateProfile(userId: string, patch: ProfilePatch): Promise<Profile> {
  const clean: ProfilePatch = {};
  if (patch.display_name !== undefined) {
    const v = patch.display_name?.trim();
    clean.display_name = v ? v : null;
  }
  if (patch.avatar_url !== undefined) {
    const v = patch.avatar_url?.trim();
    clean.avatar_url = v ? v : null;
  }
  const { data, error } = await supabase
    .from('profiles')
    .update(clean)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}

export async function deleteAccount(): Promise<void> {
  const { error } = await supabase.rpc('delete_user');
  if (error) throw error;
  await supabase.auth.signOut();
}
