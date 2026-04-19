import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { Button } from '@/shared/components/ui/button';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { useAuth } from '@/features/auth/hooks';
import { cn } from '@/shared/lib/cn';
import {
  HugeiconsIcon,
  BubbleChatIcon,
  Note01Icon,
  PlusSignIcon,
} from '@/shared/lib/icons';
import { useAIStatus, useConversation } from '../hooks';
import { askNotes, type AskSource } from '../api';
import { generateTitle } from '../conversations';
import { ConversationList } from './ConversationList';

type Turn = {
  id: string;
  question: string;
  answer: string;
  sources: AskSource[];
  streaming: boolean;
  error: string | null;
};

function AnswerBody({
  text,
  sources,
  onCitationClick,
}: {
  text: string;
  sources: AskSource[];
  onCitationClick: (n: number) => void;
}) {
  const parts = useMemo(() => text.split(/(\[\d+\])/g), [text]);
  const validNums = new Set(sources.map((s) => s.n));
  return (
    <div className="text-preview text-ink-default leading-relaxed whitespace-pre-wrap">
      {parts.map((part, i) => {
        const m = /^\[(\d+)\]$/.exec(part);
        if (!m) return <span key={i}>{part}</span>;
        const n = Number(m[1]);
        if (!validNums.has(n)) return <span key={i}>{part}</span>;
        return (
          <button
            key={i}
            type="button"
            onClick={() => onCitationClick(n)}
            className="inline-flex items-center justify-center align-baseline mx-0.5 h-[1.25em] min-w-[1.4em] px-1 rounded-md bg-brand/10 text-brand text-[11px] font-semibold tabular-nums hover:bg-brand/20 transition-colors"
            title="View source"
          >
            {n}
          </button>
        );
      })}
    </div>
  );
}

function SourceList({
  turnId,
  sources,
}: {
  turnId: string;
  sources: AskSource[];
}) {
  if (sources.length === 0) return null;
  return (
    <div className="mt-4 pt-3 border-t border-line-subtle">
      <p className="text-micro font-medium uppercase tracking-wider text-ink-subtle mb-2">
        Sources
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {sources.map((s) => (
          <li key={s.id}>
            <Link
              to={`/notes/${s.id}`}
              id={`ask-src-${turnId}-${s.n}`}
              className="group flex items-start gap-2.5 rounded-lg px-2.5 py-2 border border-line-subtle hover:border-line-default hover:bg-surface-muted transition-colors"
            >
              <span className="shrink-0 mt-[1px] inline-flex items-center justify-center size-5 rounded-md bg-brand/10 text-brand text-[11px] font-semibold tabular-nums">
                {s.n}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-caption font-medium text-ink-strong truncate">
                    {s.title || 'Untitled'}
                  </span>
                </div>
                {s.preview && (
                  <p className="text-micro text-ink-muted line-clamp-2">
                    {s.preview}
                  </p>
                )}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function AskPage() {
  useDocumentTitle('Ask');
  const navigate = useNavigate();
  const { convId } = useParams<{ convId?: string }>();
  const [params, setParams] = useSearchParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: status, isLoading: statusLoading } = useAIStatus();

  // Server-persisted turns. Null when starting a brand-new chat.
  const { data: conversation } = useConversation(convId);

  // Local state for the in-flight (streaming) turn plus anything we just
  // added client-side before the server refetches.
  const [pendingTurns, setPendingTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState('');
  const streamingRef = useRef(false);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // The turns we render = server-fetched turns (when conv loaded) + any
  // locally-added pending turns for the current session.
  const turns: Turn[] = useMemo(() => {
    const serverTurns: Turn[] = (conversation?.turns ?? []).map((t) => ({
      id: t.id,
      question: t.question,
      answer: t.answer,
      sources: t.sources ?? [],
      streaming: false,
      error: t.error,
    }));
    return [...serverTurns, ...pendingTurns];
  }, [conversation, pendingTurns]);

  // Clear local pending turns when we switch conversations (via URL).
  useEffect(() => {
    setPendingTurns([]);
    streamingRef.current = false;
    abortRef.current?.abort();
  }, [convId]);

  // Initial ?q= handoff from ⌘K or a shared link. Only auto-submit once and
  // only on a blank conversation (/ask with no :convId).
  const autoSubmitRef = useRef(false);
  useEffect(() => {
    const q = params.get('q');
    if (!autoSubmitRef.current && q && q.trim() && status?.connected && !convId) {
      autoSubmitRef.current = true;
      submit(q.trim());
      const next = new URLSearchParams(params);
      next.delete('q');
      setParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status?.connected, convId]);

  // Auto-scroll to bottom on new content.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [turns]);

  function focusSource(turnId: string, n: number) {
    const el = document.getElementById(`ask-src-${turnId}-${n}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      el.classList.add('ring-2', 'ring-brand/40');
      setTimeout(() => el.classList.remove('ring-2', 'ring-brand/40'), 1200);
    }
  }

  async function submit(question: string) {
    if (!question.trim() || streamingRef.current) return;
    if (!status?.connected) {
      toast.error('Connect Gemini in Settings → AI first.');
      return;
    }

    const localId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

    setPendingTurns((list) => [
      ...list,
      {
        id: localId,
        question: question.trim(),
        answer: '',
        sources: [],
        streaming: true,
        error: null,
      },
    ]);
    setInput('');
    streamingRef.current = true;
    const controller = new AbortController();
    abortRef.current = controller;

    const patch = (updater: (t: Turn) => Turn) =>
      setPendingTurns((list) => list.map((t) => (t.id === localId ? updater(t) : t)));

    // Capture whether this was the first turn of a new conversation — we'll
    // kick off title generation after the stream completes.
    let createdConvId: string | null = null;
    let isNewConv = false;

    try {
      await askNotes(question.trim(), {
        conversationId: convId ?? null,
        signal: controller.signal,
        onConversation: (info) => {
          createdConvId = info.id;
          isNewConv = info.isNew;
          // If the server just created a conversation, update the URL so
          // reloading lands on it and the history list refreshes.
          if (info.isNew && !convId) {
            navigate(`/ask/${info.id}`, { replace: true });
          }
          // Invalidate the conversations list so the new row appears.
          if (user) {
            qc.invalidateQueries({ queryKey: ['ai', 'conversations', user.id] });
          }
        },
        onSources: (s) => patch((t) => ({ ...t, sources: s })),
        onToken: (chunk) => patch((t) => ({ ...t, answer: t.answer + chunk })),
        onError: (msg) => patch((t) => ({ ...t, streaming: false, error: msg })),
        onDone: () => patch((t) => ({ ...t, streaming: false })),
      });
    } finally {
      streamingRef.current = false;
      abortRef.current = null;

      if (createdConvId) {
        // Refetch the conversation FIRST so the authoritative server turn is
        // in cache before we drop the pending one. If we cleared pending first
        // (invalidate is async), the UI would briefly show the conversation
        // without the just-answered turn while React Query fetched — the
        // user's message would appear to disappear.
        try {
          await qc.refetchQueries({
            queryKey: ['ai', 'conversation', createdConvId],
          });
        } catch {
          // Non-fatal — worst case we keep the pending turn mounted a bit
          // longer on next render; the cache updates eventually anyway.
        }
        setPendingTurns([]);

        if (user) {
          qc.invalidateQueries({ queryKey: ['ai', 'conversations', user.id] });
        }

        // First-turn title polish: fire gemini-title, then refresh list.
        if (isNewConv) {
          generateTitle(createdConvId).finally(() => {
            if (user) {
              qc.invalidateQueries({ queryKey: ['ai', 'conversations', user.id] });
            }
          });
        }
      }

      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit(input);
    }
  }

  function stopStream() {
    abortRef.current?.abort();
    streamingRef.current = false;
    setPendingTurns((list) =>
      list.map((t) => (t.streaming ? { ...t, streaming: false } : t)),
    );
  }

  function newChat() {
    abortRef.current?.abort();
    streamingRef.current = false;
    setPendingTurns([]);
    navigate('/ask');
  }

  const canInteract = !!status?.connected;
  const isEmpty = !convId && turns.length === 0;

  return (
    <div className="flex h-full min-h-0">
      <ConversationList activeId={convId ?? null} onNew={newChat} />

      <div className="flex-1 min-w-0 flex flex-col min-h-0">
        <PageHeader
          title={
            <span className="flex items-center gap-2">
              <HugeiconsIcon icon={BubbleChatIcon} size={15} className="text-brand" />
              {conversation?.title ?? 'Ask'}
            </span>
          }
          trailing={
            <Button size="sm" variant="ghost" onClick={newChat} className="gap-1.5">
              <HugeiconsIcon icon={PlusSignIcon} size={12} />
              New chat
            </Button>
          }
        />

        <div ref={scrollRef} className="flex-1 overflow-y-auto bg-[#fdfcfa]">
          <div className="max-w-[760px] mx-auto px-6 md:px-8 py-8 pb-40">
            {!statusLoading && !canInteract ? (
              <EmptyConnect onSettings={() => navigate('/settings')} />
            ) : isEmpty ? (
              <EmptyPrompt onPick={submit} />
            ) : (
              <div className="flex flex-col gap-10">
                {turns.map((t) => (
                  <div key={t.id} className="flex flex-col gap-3">
                    <div className="self-end max-w-[85%] rounded-2xl rounded-br-md bg-brand/10 text-ink-strong px-4 py-2.5 text-preview">
                      {t.question}
                    </div>
                    <div className="max-w-full">
                      {t.streaming && !t.answer && (
                        <div className="inline-flex items-center gap-2 text-preview text-ink-muted">
                          <span className="size-1.5 rounded-full bg-brand animate-pulse" />
                          Reading your notes…
                        </div>
                      )}
                      {t.answer && (
                        <AnswerBody
                          text={t.answer}
                          sources={t.sources}
                          onCitationClick={(n) => focusSource(t.id, n)}
                        />
                      )}
                      {t.error && !t.streaming && (
                        <p className="text-preview text-red-600 mt-1">{t.error}</p>
                      )}
                      {!t.streaming && t.sources.length > 0 && (
                        <SourceList turnId={t.id} sources={t.sources} />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="shrink-0 bg-[#fdfcfa]">
          <div className="max-w-[760px] mx-auto px-4 md:px-6 py-3">
            <div
              className={cn(
                'flex items-end gap-2 rounded-2xl border border-line-default bg-surface-raised px-3 py-2.5 shadow-xs',
                !canInteract && 'opacity-60',
              )}
            >
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={
                  canInteract
                    ? 'Ask anything about your notes…'
                    : 'Connect Gemini to start asking'
                }
                rows={1}
                disabled={!canInteract}
                className="flex-1 resize-none bg-transparent text-nav text-ink-strong placeholder:text-ink-placeholder focus:outline-none min-h-[22px] max-h-[160px]"
                onInput={(e) => {
                  const el = e.currentTarget;
                  el.style.height = 'auto';
                  el.style.height = Math.min(el.scrollHeight, 160) + 'px';
                }}
              />
              {streamingRef.current ? (
                <Button size="sm" variant="ghost" onClick={stopStream}>
                  Stop
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => submit(input)}
                  disabled={!canInteract || !input.trim()}
                >
                  Ask
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyConnect({ onSettings }: { onSettings: () => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-4 pt-24">
      <div className="size-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
        <HugeiconsIcon icon={BubbleChatIcon} size={22} />
      </div>
      <div className="max-w-sm">
        <h2 className="text-header font-semibold text-ink-strong mb-1">
          Chat with your notes
        </h2>
        <p className="text-preview text-ink-muted">
          Add a free Google Gemini key and ask anything about what you've
          written. Every answer cites the note it came from.
        </p>
      </div>
      <Button onClick={onSettings}>Connect Gemini</Button>
    </div>
  );
}

const EXAMPLE_PROMPTS = [
  'What have I written about this week?',
  'Summarize my notes on interviews.',
  "What's on my reading list and why?",
  'What was that auth bug I debugged?',
];

function EmptyPrompt({ onPick }: { onPick: (q: string) => void }) {
  return (
    <div className="flex flex-col items-center text-center gap-6 pt-20">
      <div className="size-12 rounded-2xl bg-brand/10 text-brand flex items-center justify-center">
        <HugeiconsIcon icon={BubbleChatIcon} size={22} />
      </div>
      <div className="max-w-sm">
        <h2 className="text-header font-semibold text-ink-strong mb-1">
          Ask your notes anything
        </h2>
        <p className="text-preview text-ink-muted">
          Questions pull from the 5 most relevant notes. Click any citation
          to jump to the source.
        </p>
      </div>
      <div className="w-full max-w-lg grid grid-cols-1 sm:grid-cols-2 gap-2">
        {EXAMPLE_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => onPick(p)}
            className="group text-left rounded-xl border border-line-subtle hover:border-line-default hover:bg-surface-muted px-3 py-2.5 transition-colors"
          >
            <div className="flex items-start gap-2">
              <HugeiconsIcon
                icon={PlusSignIcon}
                size={12}
                className="text-ink-subtle mt-[3px] shrink-0"
              />
              <span className="text-caption text-ink-default leading-snug">{p}</span>
            </div>
          </button>
        ))}
      </div>
      <p className="text-caption text-ink-subtle flex items-center gap-1.5">
        <HugeiconsIcon icon={Note01Icon} size={12} />
        Only your notes are used as context.
      </p>
    </div>
  );
}
