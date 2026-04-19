// gemini-key — validate, encrypt, and store a user's Gemini API key.
//
// POST   /gemini-key   body: { apiKey: string }
//   -> validates the key by making a test embedding call
//   -> AES-256-GCM encrypts the key
//   -> upserts user_settings (gemini_key_ciphertext, last4, connected_at)
//   -> returns { connected: true, last4 }
//
// DELETE /gemini-key
//   -> clears stored key columns for the caller
//   -> returns { connected: false }

import { preflight, json } from '../_shared/cors.ts';
import { requireUser, HttpError } from '../_shared/auth.ts';
import { encrypt } from '../_shared/crypto.ts';
import { validateKey } from '../_shared/gemini.ts';

Deno.serve(async (req) => {
  const p = preflight(req);
  if (p) return p;

  try {
    const { userId, admin } = await requireUser(req);

    if (req.method === 'DELETE') {
      const { error } = await admin
        .from('user_settings')
        .update({
          gemini_key_ciphertext: null,
          gemini_key_last4: null,
          gemini_connected_at: null,
        })
        .eq('user_id', userId);
      if (error) throw new HttpError(500, error.message);
      return json({ connected: false });
    }

    if (req.method !== 'POST') {
      return json({ error: 'Method not allowed' }, { status: 405 });
    }

    const body = await req.json().catch(() => null);
    const apiKey = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';
    if (apiKey.length < 20) {
      return json({ error: 'API key looks invalid.' }, { status: 400 });
    }

    const ok = await validateKey(apiKey);
    if (!ok) {
      return json(
        { error: 'Google rejected this key. Check it and try again.' },
        { status: 400 }
      );
    }

    const ciphertext = await encrypt(apiKey);
    const last4 = apiKey.slice(-4);
    const connectedAt = new Date().toISOString();

    // Upsert: user_settings row may not exist yet for this user.
    const { error } = await admin
      .from('user_settings')
      .upsert(
        {
          user_id: userId,
          gemini_key_ciphertext: ciphertext,
          gemini_key_last4: last4,
          gemini_connected_at: connectedAt,
        },
        { onConflict: 'user_id' }
      );
    if (error) throw new HttpError(500, error.message);

    return json({ connected: true, last4, connectedAt });
  } catch (e) {
    if (e instanceof HttpError) {
      return json({ error: e.message }, { status: e.status });
    }
    console.error('gemini-key error', e);
    return json({ error: 'Server error' }, { status: 500 });
  }
});
