// gemini-title — generate a short (3-5 word) title for a chat conversation.
//
// POST /gemini-title  body: { conversationId: string }
//   - Verifies the conversation belongs to the caller
//   - Reads the first turn (question + answer)
//   - Calls Gemini with a tight prompt → returns ≤5 words
//   - Updates conversations.title
//   - Returns { title }
//
// Client fires this after the first answer completes. Failure is non-fatal —
// the conversation keeps whatever placeholder title it had.

import { preflight, json } from '../_shared/cors.ts';
import { requireUser, HttpError, bumpUsage } from '../_shared/auth.ts';
import { decrypt } from '../_shared/crypto.ts';

const GEN_MODEL = 'gemini-2.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

const TITLE_PROMPT = `Write a short (3-5 words) title summarizing the user's question below.
Rules:
- No quotes, no punctuation at the end.
- Title case or sentence case — whichever reads more natural.
- No preamble, no explanation. Just the title itself.

Question: `;

Deno.serve(async (req) => {
  const p = preflight(req);
  if (p) return p;
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { userId, admin, user } = await requireUser(req);
    const body = await req.json().catch(() => null);
    const conversationId =
      typeof body?.conversationId === 'string' ? body.conversationId : '';
    if (!conversationId) {
      return json({ error: 'conversationId required' }, { status: 400 });
    }

    // Load first turn. RLS on ai_turns ensures the caller owns it.
    const { data: turn, error: tErr } = await user
      .from('ai_turns')
      .select('question')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(1)
      .maybeSingle();
    if (tErr) throw new HttpError(500, tErr.message);
    if (!turn) return json({ error: 'No turns yet' }, { status: 404 });

    // Load Gemini key.
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

    const res = await fetch(
      `${BASE}/models/${GEN_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [
            { role: 'user', parts: [{ text: TITLE_PROMPT + turn.question }] },
          ],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 30,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );
    if (!res.ok) {
      const errText = await res.text().catch(() => '');
      return json(
        { error: `Gemini error (${res.status}): ${errText.slice(0, 200)}` },
        { status: 502 }
      );
    }
    const data = await res.json();
    const parts = data?.candidates?.[0]?.content?.parts ?? [];
    let raw = '';
    for (const part of parts) {
      if (part?.thought) continue;
      if (typeof part?.text === 'string') raw += part.text;
    }
    // Tidy: strip surrounding quotes, trailing punctuation, collapse whitespace.
    const title = raw
      .trim()
      .replace(/^["'“”‘’]+|["'“”‘’]+$/g, '')
      .replace(/[.!?…]+$/g, '')
      .replace(/\s+/g, ' ')
      .slice(0, 64);

    if (!title) {
      return json({ error: 'Empty title from model' }, { status: 500 });
    }

    bumpUsage(user, 'ask');

    const { error: upErr } = await user
      .from('ai_conversations')
      .update({ title })
      .eq('id', conversationId);
    if (upErr) throw new HttpError(500, upErr.message);

    return json({ title });
  } catch (e) {
    if (e instanceof HttpError) {
      return json({ error: e.message }, { status: e.status });
    }
    console.error('gemini-title error', e);
    return json({ error: 'Server error' }, { status: 500 });
  }
});
