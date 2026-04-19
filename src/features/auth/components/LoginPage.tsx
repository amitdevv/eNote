import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { Button } from '@/shared/components/ui/button';
import { Spinner } from '@/shared/components/ui/spinner';
import { HugeiconsIcon } from '@/shared/lib/icons';
import {
  Edit02Icon,
  CheckmarkSquare01Icon,
  BubbleChatIcon,
  Link01Icon,
  Search01Icon,
  Tag01Icon,
  SourceCodeCircleIcon,
  InboxIcon,
  StarIcon,
} from '@/shared/lib/icons';

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#fff" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" opacity="0.95" />
      <path fill="#fff" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" opacity="0.9" />
      <path fill="#fff" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" opacity="0.85" />
      <path fill="#fff" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

const features = [
  {
    icon: Edit02Icon,
    title: 'A focused, fast editor',
    body: 'Slash commands, markdown shortcuts, and crash-safe drafts so what you wrote is never lost.',
  },
  {
    icon: CheckmarkSquare01Icon,
    title: 'Tasks with context',
    body: 'Turn lines into todos with due dates and priority, attached to the note that birthed them.',
  },
  {
    icon: BubbleChatIcon,
    title: 'Ask your notes',
    body: 'Chat with your own knowledge base. Answers cite the notes they came from.',
  },
  {
    icon: Link01Icon,
    title: 'Related notes, automatic',
    body: 'Ideas from months apart surface beside today\'s note through meaning, not tags.',
  },
  {
    icon: Tag01Icon,
    title: 'Labels & pins that scale',
    body: 'Colored labels and pinned notes stay out of your way until you need them.',
  },
  {
    icon: Search01Icon,
    title: 'Semantic search',
    body: 'Search by what you meant, not just what you typed. Powered by vector embeddings.',
  },
];

const pipeline = [
  {
    icon: Edit02Icon,
    title: 'You write',
    body: 'Your note is saved locally first, then synced, so typing stays instant even offline.',
  },
  {
    icon: SourceCodeCircleIcon,
    title: 'It gets embedded',
    body: 'A background job turns each note into a 768-dim vector via Gemini, queued and retryable.',
  },
  {
    icon: InboxIcon,
    title: 'Stored in pgvector',
    body: 'Vectors live in Postgres with row-level security. Your notes never leave your workspace.',
  },
  {
    icon: StarIcon,
    title: 'Recalled by meaning',
    body: 'Ask, search, or open a note. The closest vectors surface as answers and related links.',
  },
];

export function LoginPage() {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogle() {
    setLoading(true);
    setError(null);
    const { error } = await signInWithGoogle();
    if (error) {
      setError(error);
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Sky gradient — covers the hero section only */}
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[780px] -z-20"
        style={{
          background:
            'linear-gradient(180deg, #dbeafe 0%, #e0f2fe 20%, #f0f9ff 55%, #f4f3f1 100%)',
        }}
      />
      <div
        aria-hidden
        className="absolute -top-40 -left-40 w-[620px] h-[620px] rounded-full -z-10 blur-3xl opacity-60"
        style={{ background: 'radial-gradient(circle, #7dd3fc 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="absolute top-20 -right-40 w-[620px] h-[620px] rounded-full -z-10 blur-3xl opacity-55"
        style={{ background: 'radial-gradient(circle, #c4b5fd 0%, transparent 70%)' }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[780px] -z-10 pointer-events-none opacity-[0.12] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      <div className="relative bg-surface-app/0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 lg:px-10 py-6">
          <div className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-brand flex items-center justify-center text-white font-semibold text-[14px] shadow-lg shadow-brand/20">
              eN
            </div>
            <span className="text-title font-semibold text-ink-strong tracking-tight">eNote</span>
          </div>
        </header>

        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-10 pb-28 lg:pt-16 lg:pb-40">
          <div className="relative w-full max-w-[860px] text-center">
            <h1 className="font-display text-[clamp(40px,6vw,72px)] leading-[1.05] tracking-[-0.02em] text-ink-strong">
              A calm home for your
              <br className="hidden sm:block" />{' '}
              <span className="italic text-brand">notes, tasks</span>, and fleeting thoughts.
            </h1>

            <p className="mt-6 max-w-[560px] mx-auto text-[17px] leading-[1.6] text-ink-muted">
              Capture ideas, turn them into tasks, and ask your own notes anything.
            </p>

            <div className="mt-10 flex items-center justify-center">
              <Button
                size="lg"
                className="h-14 px-7 gap-3 rounded-xl bg-brand hover:bg-brand/90 text-white text-title font-semibold shadow-[0_14px_32px_-10px_rgba(109,120,213,0.55)] hover:shadow-[0_18px_36px_-10px_rgba(109,120,213,0.65)] transition-shadow duration-200"
                onClick={handleGoogle}
                disabled={loading}
              >
                {loading ? <Spinner /> : <GoogleIcon />}
                <span>Continue with Google</span>
              </Button>
            </div>

            {error && (
              <p className="mt-3 text-caption text-red-600">{error}</p>
            )}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative px-6 py-24 lg:py-32 bg-surface-app">
          <div className="mx-auto max-w-[1080px]">
            <div className="max-w-[640px] mb-14">
              <span className="text-caption uppercase tracking-[0.12em] text-brand font-semibold">
                What's inside
              </span>
              <h2 className="mt-3 font-display text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-0.02em] text-ink-strong">
                Everything you need to think. Nothing that gets in the way.
              </h2>
              <p className="mt-4 text-title leading-[1.55] text-ink-muted">
                eNote is a quieter alternative to a dozen notion-shaped tools. It writes, it remembers, it reminds, and it doesn't demand your attention.
              </p>
            </div>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f) => (
                <li
                  key={f.title}
                  className="group rounded-2xl border border-line-default bg-surface-panel p-6 hover:border-brand/30 hover:shadow-md transition-all duration-200"
                >
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand/10 text-brand group-hover:bg-brand group-hover:text-white transition-colors">
                    <HugeiconsIcon icon={f.icon} size={18} />
                  </span>
                  <h3 className="mt-4 text-title font-semibold text-ink-strong tracking-tight">
                    {f.title}
                  </h3>
                  <p className="mt-1.5 text-preview leading-[1.55] text-ink-muted">
                    {f.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Under the hood */}
        <section id="how" className="relative px-6 py-24 lg:py-32 bg-surface-panel border-y border-line-default">
          <div className="mx-auto max-w-[1080px]">
            <div className="max-w-[640px] mb-14">
              <span className="text-caption uppercase tracking-[0.12em] text-brand font-semibold">
                Under the hood
              </span>
              <h2 className="mt-3 font-display text-[clamp(32px,4vw,48px)] leading-[1.1] tracking-[-0.02em] text-ink-strong">
                How your notes become a searchable second brain.
              </h2>
              <p className="mt-4 text-title leading-[1.55] text-ink-muted">
                Every note flows through a small, honest pipeline: local-first drafts, background embeddings, and vector recall, all running on Postgres with pgvector.
              </p>
            </div>

            <ol className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {pipeline.map((step, i) => (
                <li
                  key={step.title}
                  className="relative rounded-2xl border border-line-default bg-surface-raised p-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-10 items-center justify-center rounded-xl bg-brand text-white shadow-sm shadow-brand/30">
                      <HugeiconsIcon icon={step.icon} size={18} />
                    </span>
                    <span className="font-display text-[22px] text-ink-placeholder tabular-nums">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="mt-5 text-title font-semibold text-ink-strong tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-1.5 text-preview leading-[1.55] text-ink-muted">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>

            {/* Stack strip */}
            <div className="mt-12 rounded-2xl border border-line-default bg-surface-app p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <div className="text-caption uppercase tracking-[0.12em] text-ink-muted font-semibold">Storage</div>
                  <div className="mt-2 font-display text-[22px] text-ink-strong">Postgres + pgvector</div>
                  <p className="mt-1.5 text-preview leading-[1.5] text-ink-muted">
                    Row-level security per user. Vectors live next to their notes, never in a third-party index.
                  </p>
                </div>
                <div>
                  <div className="text-caption uppercase tracking-[0.12em] text-ink-muted font-semibold">Embeddings</div>
                  <div className="mt-2 font-display text-[22px] text-ink-strong">Gemini · 768 dims</div>
                  <p className="mt-1.5 text-preview leading-[1.5] text-ink-muted">
                    Queued and idempotent. Retries on failure, caches on success, never double-bills.
                  </p>
                </div>
                <div>
                  <div className="text-caption uppercase tracking-[0.12em] text-ink-muted font-semibold">Chat & titles</div>
                  <div className="mt-2 font-display text-[22px] text-ink-strong">Gemini · grounded RAG</div>
                  <p className="mt-1.5 text-preview leading-[1.5] text-ink-muted">
                    Answers cite the notes they pulled from. Auto-titles keep your library tidy without prompting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
