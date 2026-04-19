// gemini-embed — embed a piece of text with the caller's Gemini key.
//
// POST /gemini-embed   body: { text: string, noteId?: string }
//   -> fetches caller's encrypted key from user_settings
//   -> decrypts, calls text-embedding-004
//   -> if noteId is given: writes embedding + embedding_updated_at on that note
//      (admin client; RLS bypass, so we re-verify ownership first)
//   -> returns { embedding: number[] }   (client uses this for search queries)
//
// The noteId path lets the client fire-and-forget from the save hook without
// a round-trip to rewrite the vector. For pure query embedding (search UI),
// omit noteId and the function just returns the vector.

import { preflight, json } from '../_shared/cors.ts';
import { requireUser, HttpError, bumpUsage } from '../_shared/auth.ts';
import { decrypt } from '../_shared/crypto.ts';
import { embedText, GeminiError } from '../_shared/gemini.ts';

Deno.serve(async (req) => {
  const p = preflight(req);
  if (p) return p;
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { userId, admin, user } = await requireUser(req);

    const body = await req.json().catch(() => null);
    const text = typeof body?.text === 'string' ? body.text : '';
    const noteId = typeof body?.noteId === 'string' ? body.noteId : null;
    if (!text.trim()) {
      return json({ error: 'text required' }, { status: 400 });
    }

    // Load caller's encrypted Gemini key.
    const { data: settings, error: sErr } = await admin
      .from('user_settings')
      .select('gemini_key_ciphertext')
      .eq('user_id', userId)
      .maybeSingle();
    if (sErr) throw new HttpError(500, sErr.message);
    if (!settings?.gemini_key_ciphertext) {
      return json({ error: 'Gemini not connected' }, { status: 400 });
    }

    const apiKey = await decrypt(settings.gemini_key_ciphertext);

    // Task-type hint: RETRIEVAL_DOCUMENT when we're indexing a note row,
    // RETRIEVAL_QUERY when we're embedding a free-form search string from
    // the client (no noteId). Matching hints on both sides of the search
    // gives far cleaner similarity separation than the general-purpose mode.
    const taskType = noteId ? 'RETRIEVAL_DOCUMENT' : 'RETRIEVAL_QUERY';
    let embedding: number[];
    try {
      embedding = await embedText(apiKey, text, taskType);
    } catch (e) {
      if (e instanceof GeminiError) {
        return json({ error: e.message }, { status: e.status === 429 ? 429 : 502 });
      }
      throw e;
    }

    // Count this call against the user's daily budget. Fire-and-forget —
    // a failing counter shouldn't block a successful embedding.
    bumpUsage(user, 'embed');

    if (noteId) {
      // Verify the note belongs to the caller before writing with admin client.
      const { data: note, error: nErr } = await admin
        .from('notes')
        .select('id,user_id')
        .eq('id', noteId)
        .maybeSingle();
      if (nErr) throw new HttpError(500, nErr.message);
      if (!note || note.user_id !== userId) {
        return json({ error: 'Note not found' }, { status: 404 });
      }

      // Belt-and-suspenders: scope the update itself to the caller's user_id.
      // Even if the ownership guard above is ever edited out by mistake, an
      // attacker can't overwrite another user's embedding — the WHERE clause
      // won't match any row. Defense in depth against a single-point-of-failure
      // auth check.
      const { error: uErr } = await admin
        .from('notes')
        .update({
          embedding: embedding as unknown as string, // pgvector accepts number[]
          embedding_updated_at: new Date().toISOString(),
        })
        .eq('id', noteId)
        .eq('user_id', userId);
      if (uErr) throw new HttpError(500, uErr.message);

      // Don't return the full vector when we already wrote it — save bandwidth.
      return json({ ok: true, noteId });
    }

    return json({ embedding });
  } catch (e) {
    if (e instanceof HttpError) {
      return json({ error: e.message }, { status: e.status });
    }
    console.error('gemini-embed error', e);
    return json({ error: 'Server error' }, { status: 500 });
  }
});
