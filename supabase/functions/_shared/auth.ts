import { createClient, type SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.4';

export type AuthContext = {
  userId: string;
  // Service-role client — bypasses RLS. Only used for trusted server logic
  // (reading encrypted keys, writing embeddings across users' own rows).
  admin: SupabaseClient;
  // User-scoped client — respects RLS and resolves auth.uid() inside RPCs
  // like bump_ai_usage.
  user: SupabaseClient;
};

export async function requireUser(req: Request): Promise<AuthContext> {
  const authHeader = req.headers.get('Authorization') ?? '';
  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token) throw new HttpError(401, 'Missing Authorization header');

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !serviceKey || !anonKey) {
    throw new HttpError(500, 'Supabase env missing');
  }

  const user = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await user.auth.getUser();
  if (error || !data.user) throw new HttpError(401, 'Invalid token');

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return { userId: data.user.id, admin, user };
}

/**
 * Increment the caller's daily AI usage counter for the given action.
 * Fire-and-forget — if this fails we don't fail the surrounding request.
 */
export async function bumpUsage(
  user: SupabaseClient,
  action: 'embed' | 'ask'
): Promise<void> {
  try {
    const { error } = await user.rpc('bump_ai_usage', { action_kind: action });
    if (error) console.warn('bumpUsage failed', error.message);
  } catch (e) {
    console.warn('bumpUsage threw', e);
  }
}

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}
