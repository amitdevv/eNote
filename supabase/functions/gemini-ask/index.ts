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
};

function sseEvent(event: string, data: string): string {
  const lines = data.split('\n').map((l) => `data: ${l}`).join('\n');
  return `event: ${event}\n${lines}\n\n`;
}

function buildPrompt(question: string, sources: SourceRef[], notes: string[]): string {
  const header = `You are answering a question using the user's personal notes as the ONLY source.
Rules:
- Cite every factual claim with the note number in square brackets, like [1] or [2].
- If the notes don't contain the answer, say so plainly. Do NOT invent facts.
- Keep the answer concise. Short paragraphs. No preamble like "Based on your notes…".
- If more than one note supports a claim, cite them all: [1][3].`;

  const notesBlock = sources
    .map((s, i) => `[${s.n}] "${s.title || 'Untitled'}"\n${notes[i]}`)
    .join('\n\n');

  return `${header}\n\nNotes:\n${notesBlock}\n\nQuestion: ${question}\n\nAnswer:`;
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

    // 2. RAG
    const { data: hits, error: rErr } = await user.rpc('search_notes_by_embedding', {
      query_embedding: vecLiteral,
      match_count: 5,
    });
    if (rErr) throw new HttpError(500, `RPC failed: ${rErr.message}`);
    bumpUsage(user, 'embed');

    const rows = (hits ?? []) as Array<{
      id: string;
      title: string;
      content_text: string;
      similarity: number;
    }>;

    const sources: SourceRef[] = rows.map((r, i) => ({
      n: i + 1,
      id: r.id,
      title: r.title ?? 'Untitled',
      preview: (r.content_text ?? '').slice(0, 240),
      similarity: r.similarity,
    }));

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
    const notesText = rows.map((r) =>
      (r.content_text ?? '').slice(0, 2000).trim() || '(empty note)'
    );
    const prompt = buildPrompt(question, sources, notesText);

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
