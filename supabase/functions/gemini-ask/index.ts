// gemini-ask — streaming RAG over the caller's notes, with persistent chat
// history.
//
// POST /gemini-ask  body: { question: string, conversationId?: string }
//
// Flow:
//   1. Validate JWT. If no conversationId, create a new ai_conversations
//      row (title = truncated question, to be upgraded by gemini-title later).
//      If one is supplied, verify it belongs to the caller.
//   2. Load encrypted Gemini key. Embed the question. RAG top-5.
//   3. Stream Gemini's reply as SSE. We emit, in order:
//        event: conversation  data: {id, isNew}
//        event: sources       data: [...]
//        event: token         data: "..."
//        event: done
//      (event: error can replace any of the middle events.)
//   4. Server-side accumulator buffers the full answer. On stream end,
//      we insert an ai_turns row with question + answer + sources.
//
// Each turn does a fresh RAG retrieval — no chat-history in the prompt.
// Keeps token usage predictable and answers grounded in current notes.

import { preflight, corsHeaders, json } from '../_shared/cors.ts';
import { requireUser, HttpError, bumpUsage } from '../_shared/auth.ts';
import { decrypt } from '../_shared/crypto.ts';
import { embedText, GeminiError } from '../_shared/gemini.ts';

const GEN_MODEL = 'gemini-2.5-flash';
const BASE = 'https://generativelanguage.googleapis.com/v1beta';

const SSE_HEADERS: HeadersInit = {
  ...corsHeaders,
  'content-type': 'text/event-stream',
  'cache-control': 'no-cache',
  connection: 'keep-alive',
};

type SourceRef = {
  n: number;
  id: string;
  title: string;
  preview: string;
  similarity: number;
  updatedAt: string;
};

type FactHit = {
  id: string;
  subject: string;
  predicate: string;
  object: string;
  statement: string;
  source_note_id: string | null;
  source_excerpt: string | null;
  created_at: string;
  similarity: number;
};

// Facts below this similarity are noise — better to not show them than to
// confuse the model. Calibrated against SEMANTIC_SIMILARITY embeddings of
// short fact statements; tune if we see the model missing obvious matches.
const FACT_MIN_SIMILARITY = 0.55;

function sseEvent(event: string, data: string): string {
  const lines = data.split('\n').map((l) => `data: ${l}`).join('\n');
  return `event: ${event}\n${lines}\n\n`;
}

// Human-readable relative date for the prompt. The LLM is far more reliable
// at "more recent than" reasoning when timestamps are described in plain
// English ("yesterday", "3 days ago") than when given raw ISO strings.
function describeWhen(iso: string, now: Date): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'unknown date';
  const diffMs = now.getTime() - t;
  const diffMin = Math.round(diffMs / 60_000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.round(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? '' : 's'} ago`;
  const diffDay = Math.round(diffHr / 24);
  if (diffDay < 14) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  return new Date(iso).toISOString().slice(0, 10);
}

function buildPrompt(
  question: string,
  sources: SourceRef[],
  notes: string[],
  factsBlock: string,
): string {
  const header = factsBlock
    ? `You are answering a question about the user. You have TWO sources:

1. CURRENT FACTS — a small, deduplicated set of canonical facts about the user. These reflect the user's CURRENT state. They have already been reconciled, so they will never contradict each other.
2. NOTES — full text of the most relevant notes. Notes may contain older statements that have since been revised. When a note contradicts a fact, the FACT is correct; the note is outdated.

Rules:
- If the question is answered by a CURRENT FACT, answer from that fact. Cite the note in square brackets like [1] (the citation tag is already shown next to each fact).
- If the question needs more than facts (synthesis, recall, summary), use the NOTES too — but ignore note content that contradicts a CURRENT FACT.
- Cite every factual claim with the note number, like [1] or [2].
- If multiple notes agree, cite the most relevant one (no need to cite all).
- Concise. Short sentences. No preamble.
- If neither source contains the answer, say so plainly. Never invent.`
    : `You are answering a question using the user's personal notes as the ONLY source.
Rules:
- Cite every factual claim with the note number in square brackets, like [1] or [2].
- If the notes don't contain the answer, say so plainly. Do NOT invent facts.
- Keep the answer concise. Short paragraphs. No preamble like "Based on your notes…".
- If more than one note supports a claim, cite them all: [1][3].`;

  const now = new Date();
  const notesBlock = sources
    .map((s, i) => {
      const when = describeWhen(s.updatedAt, now);
      return `[${s.n}] "${s.title || 'Untitled'}" — updated ${when}\n${notes[i]}`;
    })
    .join('\n\n');

  if (factsBlock) {
    return `${header}\n\nCURRENT FACTS:\n${factsBlock}\n\nNOTES:\n${notesBlock}\n\nQuestion: ${question}\n\nAnswer:`;
  }
  return `${header}\n\nNotes:\n${notesBlock}\n\nQuestion: ${question}\n\nAnswer:`;
}

// Pick the most useful slice of a note for the prompt. For short notes (the
// common case) we keep the whole thing. For longer notes we keep the TAIL —
// in journal-style usage, recently-added lines sit at the bottom and that's
// where the current state of any evolving fact lives. Without this, a long
// note where the user revised "fav subject = science" at the end would be
// truncated to its outdated head.
function noteSliceForPrompt(text: string, max = 4000): string {
  const t = (text ?? '').trim();
  if (t.length <= max) return t || '(empty note)';
  return `…(earlier content truncated)…\n${t.slice(-max)}`;
}

// First-turn placeholder title: just the question, truncated. gemini-title
// will replace this with a short LLM-generated label shortly after the first
// answer completes.
function placeholderTitle(question: string): string {
  const one = question.replace(/\s+/g, ' ').trim();
  return one.length > 64 ? one.slice(0, 61) + '…' : one;
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
    const question = typeof body?.question === 'string' ? body.question.trim() : '';
    const providedConvId =
      typeof body?.conversationId === 'string' && body.conversationId.length > 0
        ? body.conversationId
        : null;
    if (!question) {
      return json({ error: 'question required' }, { status: 400 });
    }

    // Load caller's encrypted key.
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

    // Resolve or create the conversation. The user client respects RLS
    // (so providedConvId has to belong to the caller).
    let conversationId: string;
    let isNewConversation = false;
    if (providedConvId) {
      const { data: conv, error: cErr } = await user
        .from('ai_conversations')
        .select('id')
        .eq('id', providedConvId)
        .maybeSingle();
      if (cErr) throw new HttpError(500, cErr.message);
      if (!conv) return json({ error: 'Conversation not found' }, { status: 404 });
      conversationId = conv.id as string;
    } else {
      isNewConversation = true;
      const { data: inserted, error: iErr } = await user
        .from('ai_conversations')
        .insert({ user_id: userId, title: placeholderTitle(question) })
        .select('id')
        .single();
      if (iErr || !inserted) {
        throw new HttpError(500, iErr?.message ?? 'failed to create conversation');
      }
      conversationId = inserted.id as string;
    }

    // 1. Embed question with RETRIEVAL_QUERY hint — matches the
    //    RETRIEVAL_DOCUMENT hint used when indexing notes. Without matching
    //    task types, ranking is noticeably less confident.
    const queryVec = await embedText(apiKey, question, 'RETRIEVAL_QUERY');
    const vecLiteral = `[${queryVec.join(',')}]`;

    // 2. Hybrid retrieval — RAG over notes AND lookup of canonical facts.
    //    Run them in parallel; both go through RLS-scoped RPCs so the user
    //    can never see anyone else's data.
    const [notesRes, factsRes] = await Promise.all([
      user.rpc('search_notes_by_embedding', {
        query_embedding: vecLiteral,
        match_count: 5,
      }),
      user.rpc('search_facts_by_embedding', {
        query_embedding: vecLiteral,
        match_count: 3,
        min_similarity: FACT_MIN_SIMILARITY,
      }),
    ]);
    if (notesRes.error) throw new HttpError(500, `RPC failed: ${notesRes.error.message}`);
    if (factsRes.error) {
      // Facts retrieval is best-effort — if the RPC fails we still answer
      // from notes alone. Don't fail the whole request.
      console.warn('search_facts_by_embedding failed:', factsRes.error.message);
    }
    bumpUsage(user, 'embed');

    const noteRows = (notesRes.data ?? []) as Array<{
      id: string;
      title: string;
      content_text: string;
      updated_at: string;
      similarity: number;
    }>;
    const factRows = (factsRes.data ?? []) as FactHit[];

    // Pull in any note that a fact cites but that didn't make the top-5
    // RAG hits — otherwise the citation [N] in the answer can't be linked
    // back to a real source chip.
    const noteIdsInRag = new Set(noteRows.map((r) => r.id));
    const missingFactNoteIds = Array.from(
      new Set(
        factRows
          .map((f) => f.source_note_id)
          .filter((id): id is string => !!id && !noteIdsInRag.has(id))
      )
    );
    let extraNotes: typeof noteRows = [];
    if (missingFactNoteIds.length > 0) {
      const { data: extra } = await user
        .from('notes')
        .select('id,title,content_text,updated_at')
        .in('id', missingFactNoteIds);
      extraNotes = ((extra ?? []) as Array<{
        id: string;
        title: string;
        content_text: string;
        updated_at: string;
      }>).map((n) => ({ ...n, similarity: 0 }));
    }

    const allNoteRows = [...noteRows, ...extraNotes];

    const sources: SourceRef[] = allNoteRows.map((r, i) => ({
      n: i + 1,
      id: r.id,
      title: r.title ?? 'Untitled',
      preview: (r.content_text ?? '').slice(0, 240),
      similarity: r.similarity,
      updatedAt: r.updated_at,
    }));

    // Map each fact to its source-note citation number, if known.
    const noteIdToN = new Map(sources.map((s) => [s.id, s.n]));
    const factsBlock = factRows
      .map((f) => {
        const n = f.source_note_id ? noteIdToN.get(f.source_note_id) : undefined;
        return n ? `- ${f.statement} [${n}]` : `- ${f.statement}`;
      })
      .join('\n');

    // Helper: persist the final turn. We call this once we know the answer
    // (or whatever partial answer we got).
    const saveTurn = async (answerText: string, errText: string | null) => {
      await user.from('ai_turns').insert({
        conversation_id: conversationId,
        user_id: userId,
        question,
        answer: answerText,
        sources,
        error: errText,
      });
    };

    // If no relevant notes, short-circuit with a friendly non-streaming answer.
    if (sources.length === 0) {
      const answer = "You don't have any notes yet that match this question.";
      await saveTurn(answer, null);
      const stream = new ReadableStream({
        start(ctrl) {
          const enc = new TextEncoder();
          ctrl.enqueue(
            enc.encode(
              sseEvent(
                'conversation',
                JSON.stringify({ id: conversationId, isNew: isNewConversation })
              )
            )
          );
          ctrl.enqueue(enc.encode(sseEvent('sources', JSON.stringify([]))));
          ctrl.enqueue(enc.encode(sseEvent('token', JSON.stringify(answer))));
          ctrl.enqueue(enc.encode(sseEvent('done', '')));
          ctrl.close();
        },
      });
      return new Response(stream, { headers: SSE_HEADERS });
    }

    // 3. Stream Gemini
    const notesText = allNoteRows.map((r) => noteSliceForPrompt(r.content_text ?? ''));
    const prompt = buildPrompt(question, sources, notesText, factsBlock);

    const geminiRes = await fetch(
      `${BASE}/models/${GEN_MODEL}:streamGenerateContent?alt=sse&key=${encodeURIComponent(apiKey)}`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 1024,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
      }
    );

    if (!geminiRes.ok || !geminiRes.body) {
      const errText = await geminiRes.text().catch(() => '');
      const msg = `Gemini error (${geminiRes.status}): ${errText.slice(0, 300)}`;
      await saveTurn('', msg);
      return json({ error: msg }, { status: geminiRes.status === 429 ? 429 : 502 });
    }

    bumpUsage(user, 'ask');

    // 4. Pipe Gemini's SSE → our SSE, buffering the full answer so we can
    //    insert the ai_turns row on completion.
    const stream = new ReadableStream({
      async start(ctrl) {
        const enc = new TextEncoder();
        const dec = new TextDecoder();

        // Preamble: conversation id, then sources.
        ctrl.enqueue(
          enc.encode(
            sseEvent(
              'conversation',
              JSON.stringify({ id: conversationId, isNew: isNewConversation })
            )
          )
        );
        ctrl.enqueue(enc.encode(sseEvent('sources', JSON.stringify(sources))));

        const reader = geminiRes.body!.getReader();
        let buffer = '';
        let answerAccum = '';
        let streamError: string | null = null;
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            // Gemini emits SSE with CRLF line endings, so frames are separated
            // by "\r\n\r\n", not "\n\n". Strip CRs as we decode so the rest of
            // the parser only deals with LF-terminated lines. Without this the
            // indexOf('\n\n') below never matches, the buffer grows forever,
            // and the turn is persisted with an empty answer.
            buffer += dec.decode(value, { stream: true }).replace(/\r/g, '');

            let idx: number;
            while ((idx = buffer.indexOf('\n\n')) !== -1) {
              const frame = buffer.slice(0, idx);
              buffer = buffer.slice(idx + 2);

              const dataLines = frame
                .split('\n')
                .filter((l) => l.startsWith('data: '))
                .map((l) => l.slice(6));
              if (dataLines.length === 0) continue;
              const payload = dataLines.join('\n');
              if (payload === '[DONE]') continue;

              try {
                const parsed = JSON.parse(payload);
                const parts = parsed?.candidates?.[0]?.content?.parts ?? [];
                let text = '';
                for (const part of parts) {
                  if (part?.thought) continue;
                  if (typeof part?.text === 'string') text += part.text;
                }
                if (text) {
                  answerAccum += text;
                  ctrl.enqueue(enc.encode(sseEvent('token', JSON.stringify(text))));
                }
              } catch {
                // partial / keepalive — ignore
              }
            }
          }
          ctrl.enqueue(enc.encode(sseEvent('done', '')));
        } catch (e) {
          streamError = e instanceof Error ? e.message : String(e);
          ctrl.enqueue(enc.encode(sseEvent('error', JSON.stringify(streamError))));
        } finally {
          // Persist regardless of whether streaming succeeded fully. A
          // partial answer is still useful to the user.
          try {
            await saveTurn(answerAccum, streamError);
          } catch (saveErr) {
            console.warn('saveTurn failed', saveErr);
            // If this was a brand-new conversation and we failed to save its
            // first turn, roll back the conversation row. Otherwise the user
            // ends up with a phantom empty chat in their history that opens
            // to nothing.
            if (isNewConversation) {
              try {
                await user
                  .from('ai_conversations')
                  .delete()
                  .eq('id', conversationId);
              } catch (rbErr) {
                console.warn('conversation rollback failed', rbErr);
              }
            }
          }
          ctrl.close();
        }
      },
    });

    return new Response(stream, { headers: SSE_HEADERS });
  } catch (e) {
    if (e instanceof HttpError) {
      return json({ error: e.message }, { status: e.status });
    }
    if (e instanceof GeminiError) {
      return json({ error: e.message }, { status: e.status === 429 ? 429 : 502 });
    }
    console.error('gemini-ask error', e);
    return json({ error: 'Server error' }, { status: 500 });
  }
});
