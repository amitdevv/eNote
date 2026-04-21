// extract-facts — turn a note into atomic, supersedable facts.
//
// POST /extract-facts   body: { noteId: string }
//
// Flow (corrected — see review notes):
//   1. Validate JWT, load the note (must belong to caller).
//   2. Call Gemini to extract candidate facts. THIS RUNS BEFORE any
//      destructive write — if Gemini fails we leave existing facts alone.
//   3. Hard-delete the note's prior facts EXCEPT user_edited ones (so a
//      manually retired fact doesn't get resurrected by re-extraction).
//   4. For each candidate: embed the statement, call upsert_user_fact RPC.
//      The RPC handles supersession + insert in one transaction with a
//      per-chain advisory lock — no JS-side races, no partial writes.
//   5. Stamp notes.facts_extracted_at = now() so the backfill knows this
//      note is fresh and skips it next time.
//
// Why we still re-extract instead of "diff and patch": the extraction is
// non-deterministic (LLM), so any heuristic for "is this the same fact as
// last time?" is itself unreliable. Re-extracting + supersession handles
// the genuinely-changed cases correctly, and the no-op cases are cheap
// (advisory lock + similarity check + skip).

import { preflight, json } from '../_shared/cors.ts';
import { requireUser, HttpError, bumpUsage } from '../_shared/auth.ts';
import { decrypt } from '../_shared/crypto.ts';
import { embedText, GeminiError } from '../_shared/gemini.ts';

const GEN_MODEL = 'gemini-2.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

// Passed to upsert_user_fact. When (subject, predicate) match exactly, we
// still verify the candidate shares meaning by embedding similarity. Below
// this threshold the upsert refuses (returns predicate_collision_low_similarity)
// rather than silently retiring an unrelated fact.
const SUPERSESSION_SIM_THRESHOLD = 0.5;

type ExtractedFact = {
  subject: string;
  predicate: string;
  object: string;
  statement: string;
  source_excerpt: string;
};

function buildExtractionPrompt(noteTitle: string, noteText: string): string {
  return `You are extracting durable facts about the user from one of their personal notes.

A FACT is something true about the USER that would still be true tomorrow:
- preferences ("favorite_subject = science")
- attributes ("city = bangalore", "role = student", "stack = react")
- ongoing situations ("weakness = dsa", "goal = land_swe_internship")
- relationships ("manager = anand_sir", "team = growth")

NOT facts — do NOT extract:
- one-off tasks ("buy milk", "english presentation tomorrow")
- transient events ("had a meeting today", "feeling tired")
- questions, doubts, half-thoughts ("should I learn rust?")
- generic knowledge (code snippets, definitions, recipe steps)
- meta-commentary about notes themselves

CHRONOLOGICAL READING:
Within a single note, content is roughly chronological. If the user contradicts themselves
(e.g. "fav subject = maths" then later "fav subject = science"), extract ONLY the LATER one.
Treat lines marked with "→", "~~text~~", "(old)", "scratch that", "actually" as the writer
moving on — keep the newer position, drop the older.

PREDICATE NAMING:
Use snake_case, singular noun, written from the user's perspective.
Prefer short canonical names: favorite_subject, weakness, city, role, stack, goal.
Don't invent overly specific predicates ("favorite_subject_for_class_10" — use "favorite_subject").

Return ONLY a JSON array. No prose, no markdown fences. Schema for each item:
{
  "subject": "user",
  "predicate": "favorite_subject",
  "object": "science",
  "statement": "User's favorite subject is science",
  "source_excerpt": "my fav subject is science"
}

If the note contains no extractable facts, return [].

Note title: ${JSON.stringify(noteTitle || 'Untitled')}

Note content:
${noteText}

Facts (JSON array):`;
}

// Strip any wrapping markdown fence — Gemini occasionally adds ```json ... ```
// despite responseMimeType: application/json. Cheap insurance.
function stripJsonFence(s: string): string {
  const trimmed = s.trim();
  if (!trimmed.startsWith('```')) return trimmed;
  return trimmed
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function isValidFact(x: unknown): x is ExtractedFact {
  if (!x || typeof x !== 'object') return false;
  const f = x as Record<string, unknown>;
  return (
    typeof f.subject === 'string' && f.subject.trim().length > 0 &&
    typeof f.predicate === 'string' && f.predicate.trim().length > 0 &&
    typeof f.object === 'string' && f.object.trim().length > 0 &&
    typeof f.statement === 'string' && f.statement.trim().length > 0
  );
}

function normalizePredicate(p: string): string {
  return p
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_')
    .replace(/[^a-z0-9_]/g, '');
}

async function extractFactsFromNote(
  apiKey: string,
  noteTitle: string,
  noteText: string,
): Promise<ExtractedFact[]> {
  const prompt = buildExtractionPrompt(noteTitle, noteText);

  const res = await fetch(
    `${BASE}/models/${GEN_MODEL}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new GeminiError(
      res.status,
      `extract-facts gemini error (${res.status}): ${body.slice(0, 200)}`
    );
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const text = parts.map((p: { text?: string }) => p?.text ?? '').join('');
  if (!text) return [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(stripJsonFence(text));
  } catch {
    console.warn('extract-facts: model returned non-JSON, ignoring:', text.slice(0, 200));
    return [];
  }
  if (!Array.isArray(parsed)) return [];

  // Two-stage filter: validate raw shape, normalize, then re-validate. The
  // second pass catches predicates that became empty after stripping non-
  // alphanumeric chars (e.g. an emoji-only predicate from a hallucination).
  return parsed
    .filter(isValidFact)
    .map((f) => ({
      ...f,
      subject: f.subject.trim().toLowerCase(),
      predicate: normalizePredicate(f.predicate),
      object: f.object.trim(),
      statement: f.statement.trim(),
      // Cap excerpt length defensively — never trust the LLM to keep it short.
      source_excerpt: (f.source_excerpt ?? '').trim().slice(0, 500),
    }))
    .filter((f) => f.subject.length > 0 && f.predicate.length > 0 && f.object.length > 0);
}

Deno.serve(async (req) => {
  const p = preflight(req);
  if (p) return p;
  if (req.method !== 'POST') {
    return json({ error: 'Method not allowed' }, { status: 405 });
  }

  try {
    const { userId, admin, user } = await requireUser(req);

    const body = await req.json().catch(() => null);
    const noteId = typeof body?.noteId === 'string' ? body.noteId.trim() : '';
    if (!noteId) return json({ error: 'noteId required' }, { status: 400 });

    // Load the note via the user-scoped client → RLS verifies ownership.
    const { data: note, error: nErr } = await user
      .from('notes')
      .select('id,title,content_text')
      .eq('id', noteId)
      .maybeSingle();
    if (nErr) throw new HttpError(500, nErr.message);
    if (!note) return json({ error: 'Note not found' }, { status: 404 });

    const noteText = (note.content_text ?? '').trim();
    if (!noteText) {
      // Empty note: clear any prior facts (still skip user-edited rows so
      // manual retirements survive a note being blanked) and stamp the note.
      await admin
        .from('user_facts')
        .delete()
        .eq('source_note_id', noteId)
        .eq('user_id', userId)
        .eq('user_edited', false);
      await admin
        .from('notes')
        .update({ facts_extracted_at: new Date().toISOString() })
        .eq('id', noteId)
        .eq('user_id', userId);
      return json({ ok: true, extracted: 0, superseded: 0, facts: [] });
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

    // ── EXTRACT FIRST ──────────────────────────────────────────────────────
    // No destructive writes until we have new candidates in hand. If Gemini
    // fails (429, 502, network), the prior facts stay intact.
    let extracted: ExtractedFact[];
    try {
      extracted = await extractFactsFromNote(apiKey, note.title ?? '', noteText);
    } catch (e) {
      if (e instanceof GeminiError) {
        return json({ error: e.message }, { status: e.status === 429 ? 429 : 502 });
      }
      throw e;
    }

    // Count one chat call against the daily 'ask' budget regardless of how
    // many facts came back.
    bumpUsage(user, 'ask');

    // ── NOW SAFE TO REPLACE ────────────────────────────────────────────────
    // Delete prior facts from THIS note, but preserve user_edited rows —
    // those represent the user explicitly disagreeing with extraction, and
    // we never want to silently undo their decision.
    const { error: delErr } = await admin
      .from('user_facts')
      .delete()
      .eq('source_note_id', noteId)
      .eq('user_id', userId)
      .eq('user_edited', false);
    if (delErr) throw new HttpError(500, `cleanup failed: ${delErr.message}`);

    if (extracted.length === 0) {
      // Stamp anyway so the backfill skips this note next time.
      await admin
        .from('notes')
        .update({ facts_extracted_at: new Date().toISOString() })
        .eq('id', noteId)
        .eq('user_id', userId);
      return json({ ok: true, extracted: 0, superseded: 0, facts: [] });
    }

    let supersededCount = 0;
    let skippedCount = 0;
    const inserted: { id: string; predicate: string; statement: string }[] = [];

    for (const fact of extracted) {
      // Embed the statement. SEMANTIC_SIMILARITY hint — fact-to-fact
      // comparison, not query-to-document.
      let embedding: number[];
      try {
        embedding = await embedText(apiKey, fact.statement, 'SEMANTIC_SIMILARITY');
      } catch (e) {
        // One bad fact shouldn't tank the whole batch.
        console.warn('extract-facts: embed failed, skipping fact:', fact.statement, e);
        continue;
      }
      // Each successful embed counts against the daily 'embed' budget — the
      // user sees the real cost in the usage dashboard.
      bumpUsage(user, 'embed');

      const vecLiteral = `[${embedding.join(',')}]`;

      // Atomic upsert: lookup + supersede + insert in one transaction with
      // a per-chain advisory lock. See migration 20260421010000.
      const { data: rows, error: rpcErr } = await user.rpc('upsert_user_fact', {
        p_subject: fact.subject,
        p_predicate: fact.predicate,
        p_object: fact.object,
        p_statement: fact.statement,
        p_source_excerpt: fact.source_excerpt || null,
        p_source_note_id: noteId,
        p_embedding: vecLiteral,
        p_min_similarity: SUPERSESSION_SIM_THRESHOLD,
      });
      if (rpcErr) {
        console.warn('extract-facts: upsert RPC failed:', rpcErr.message);
        continue;
      }

      const result = (rows ?? [])[0] as
        | { inserted_id: string | null; superseded_id: string | null; skipped_reason: string | null }
        | undefined;
      if (!result) continue;

      if (result.skipped_reason) {
        skippedCount++;
        if (result.skipped_reason !== 'user_retired' && import.meta) {
          // Helpful debugging info: a predicate-name collision with low
          // similarity usually means the LLM aliased two unrelated facts
          // under the same predicate.
          console.warn(
            'extract-facts: upsert skipped',
            result.skipped_reason,
            fact.predicate,
            fact.statement
          );
        }
        continue;
      }

      if (result.inserted_id) {
        inserted.push({
          id: result.inserted_id,
          predicate: fact.predicate,
          statement: fact.statement,
        });
      }
      if (result.superseded_id) {
        supersededCount++;
      }
    }

    // Stamp the note as freshly extracted so the backfill resume logic skips
    // it. We do this even if some individual upserts were skipped — the note
    // itself was processed.
    await admin
      .from('notes')
      .update({ facts_extracted_at: new Date().toISOString() })
      .eq('id', noteId)
      .eq('user_id', userId);

    return json({
      ok: true,
      extracted: inserted.length,
      superseded: supersededCount,
      skipped: skippedCount,
      facts: inserted,
    });
  } catch (e) {
    if (e instanceof HttpError) {
      return json({ error: e.message }, { status: e.status });
    }
    if (e instanceof GeminiError) {
      return json({ error: e.message }, { status: e.status === 429 ? 429 : 502 });
    }
    console.error('extract-facts error', e);
    return json({ error: 'Server error' }, { status: 500 });
  }
});
