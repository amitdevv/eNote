import { supabase } from '@/shared/lib/supabase';
import type { AskSource } from './api';

export type ConversationSummary = {
  id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
};

export type TurnRow = {
  id: string;
  conversation_id: string;
  question: string;
  answer: string;
  sources: AskSource[];
  error: string | null;
  created_at: string;
};

export type ConversationDetail = ConversationSummary & {
  turns: TurnRow[];
};

export async function listConversations(): Promise<ConversationSummary[]> {
  const { data, error } = await supabase
    .from('ai_conversations')
    .select('id,title,created_at,updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (error) throw error;
  return (data ?? []) as ConversationSummary[];
}

export async function getConversation(id: string): Promise<ConversationDetail> {
  const [{ data: conv, error: cErr }, { data: turns, error: tErr }] = await Promise.all([
    supabase
      .from('ai_conversations')
      .select('id,title,created_at,updated_at')
      .eq('id', id)
      .maybeSingle(),
    supabase
      .from('ai_turns')
      .select('id,conversation_id,question,answer,sources,error,created_at')
      .eq('conversation_id', id)
      .order('created_at', { ascending: true }),
  ]);
  if (cErr) throw cErr;
  if (tErr) throw tErr;
  if (!conv) throw new Error('Conversation not found');
  return {
    ...(conv as ConversationSummary),
    turns: (turns ?? []) as TurnRow[],
  };
}

export async function deleteConversation(id: string): Promise<void> {
  const { error } = await supabase.from('ai_conversations').delete().eq('id', id);
  if (error) throw error;
}

export async function renameConversation(
  id: string,
  title: string,
): Promise<void> {
  const { error } = await supabase
    .from('ai_conversations')
    .update({ title })
    .eq('id', id);
  if (error) throw error;
}

/** Fire the gemini-title Edge Function. Fire-and-forget from client — errors
 *  are fine to swallow; conversation keeps its placeholder title. */
export async function generateTitle(conversationId: string): Promise<void> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) return;
  const base = import.meta.env.VITE_SUPABASE_URL as string;
  await fetch(`${base}/functions/v1/gemini-title`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
    },
    body: JSON.stringify({ conversationId }),
  }).catch(() => {
    // Swallow — placeholder title stays.
  });
}
