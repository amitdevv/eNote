import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import {
  SettingsSection,
  SettingsRow,
  SettingsDivider,
} from '@/features/settings/components/SettingsSection';
import {
  useAIStatus,
  useConnectGemini,
  useDisconnectGemini,
  useBackfillEmbeddings,
  useTodayUsage,
} from '../hooks';
import { clearAllEmbeddings } from '../api';
import { useAuth } from '@/features/auth/hooks';

function UsageStat({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-line-subtle px-3 py-2.5">
      <div className="flex items-baseline justify-between">
        <span className="text-caption text-ink-muted">{label}</span>
        <span className="text-header font-semibold text-ink-strong tabular-nums">
          {value}
        </span>
      </div>
      <p className="text-micro text-ink-subtle mt-0.5">{hint}</p>
    </div>
  );
}

export function AISettings() {
  const { user } = useAuth();
  const { data: status, isLoading } = useAIStatus();
  const connect = useConnectGemini();
  const disconnect = useDisconnectGemini();
  const backfill = useBackfillEmbeddings();
  const { data: usage } = useTodayUsage();
  const [reindexing, setReindexing] = useState(false);

  const [apiKey, setApiKey] = useState('');
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const backfillStartedRef = useRef(false);

  async function handleConnect() {
    const trimmed = apiKey.trim();
    if (!trimmed) return;
    try {
      await connect.mutateAsync(trimmed);
      setApiKey('');
      toast.success('Gemini connected', {
        description: 'Indexing your notes for AI search…',
      });
      // Kick off backfill in the background. Don't await — user can keep
      // using the app.
      if (!backfillStartedRef.current) {
        backfillStartedRef.current = true;
        backfill.mutate(
          {
            onProgress: (done, total) => setProgress({ done, total }),
          },
          {
            onSuccess: ({ embedded, total }) => {
              backfillStartedRef.current = false;
              setProgress(null);
              if (total > 0) {
                toast.success(`Indexed ${embedded} of ${total} notes`);
              }
            },
            onError: () => {
              backfillStartedRef.current = false;
              setProgress(null);
              toast.error("Couldn't finish indexing", {
                description: 'Some notes will be indexed later.',
              });
            },
          },
        );
      }
    } catch (e) {
      toast.error('Could not connect Gemini', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  async function handleDisconnect() {
    try {
      await disconnect.mutateAsync();
      toast.success('Gemini disconnected');
    } catch (e) {
      toast.error('Could not disconnect', {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  async function handleReindex() {
    if (!user) return;
    setReindexing(true);
    try {
      await clearAllEmbeddings(user.id);
      backfill.mutate(
        { onProgress: (done, total) => setProgress({ done, total }) },
        {
          onSuccess: ({ embedded, total }) => {
            setProgress(null);
            setReindexing(false);
            toast.success(`Re-indexed ${embedded} of ${total} notes`);
          },
          onError: () => {
            setProgress(null);
            setReindexing(false);
            toast.error('Re-index failed');
          },
        },
      );
    } catch (e) {
      setReindexing(false);
      toast.error("Couldn't re-index", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  }

  return (
    <>
      <SettingsSection
        title="AI features"
        description="eNote uses Google Gemini for semantic search, related-notes, and Q&A across your notes. Bring your own free key — your key stays encrypted and never leaves the server."
      >
        {isLoading ? (
          <div className="px-4 py-6 text-preview text-ink-muted">Loading…</div>
        ) : status?.connected ? (
          <>
            <SettingsRow
              label="Gemini"
              hint={`Connected with key ending ••••${status.last4}`}
            >
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-brand/10 text-brand text-caption font-medium">
                  <span className="size-1.5 rounded-full bg-brand" />
                  Connected
                </span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDisconnect}
                  disabled={disconnect.isPending}
                >
                  {disconnect.isPending ? 'Disconnecting…' : 'Disconnect'}
                </Button>
              </div>
            </SettingsRow>

            {progress && progress.total > 0 && (
              <>
                <SettingsDivider />
                <div className="px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-caption text-ink-muted">
                      Indexing notes
                    </span>
                    <span className="text-caption text-ink-muted tabular-nums">
                      {progress.done} / {progress.total}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-surface-muted overflow-hidden">
                    <div
                      className="h-full bg-brand transition-[width] duration-300"
                      style={{ width: `${(progress.done / progress.total) * 100}%` }}
                    />
                  </div>
                </div>
              </>
            )}

            <SettingsDivider />
            <SettingsRow
              label="Re-index notes"
              hint="Re-embed every note with the latest model and retrieval hints. Useful after changes that improve search quality."
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={handleReindex}
                disabled={reindexing || backfill.isPending}
              >
                {reindexing || backfill.isPending ? 'Re-indexing…' : 'Re-index'}
              </Button>
            </SettingsRow>

            <SettingsDivider />
            <div className="px-4 py-3.5">
              <div className="flex items-baseline justify-between mb-3">
                <span className="text-caption font-medium text-ink-muted">
                  Usage today
                </span>
                <a
                  href="https://aistudio.google.com/usage"
                  target="_blank"
                  rel="noreferrer"
                  className="text-micro text-ink-subtle hover:text-brand transition-colors"
                >
                  Live quota ↗
                </a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <UsageStat
                  label="Embeddings"
                  hint="Notes indexed + search queries"
                  value={usage?.embeds ?? 0}
                />
                <UsageStat
                  label="Questions"
                  hint="Ask-your-notes calls"
                  value={usage?.asks ?? 0}
                />
              </div>
              <p className="mt-3 text-micro text-ink-subtle">
                Resets at midnight UTC. Google sets the free-tier ceiling, not
                eNote — check the live quota link for your remaining budget.
              </p>
            </div>
          </>
        ) : (
          <div className="px-4 py-4 flex flex-col gap-3">
            <label className="text-caption font-medium text-ink-muted" htmlFor="gemini-key">
              Gemini API key
            </label>
            <div className="flex items-center gap-2">
              <Input
                id="gemini-key"
                type="password"
                placeholder="AIza…"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                autoComplete="off"
                spellCheck={false}
                className="font-mono"
              />
              <Button
                onClick={handleConnect}
                disabled={!apiKey.trim() || connect.isPending}
                size="sm"
              >
                {connect.isPending ? 'Verifying…' : 'Connect'}
              </Button>
            </div>
            <p className="text-caption text-ink-subtle">
              Get a free key at{' '}
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-brand hover:underline"
              >
                aistudio.google.com/app/apikey
              </a>
              . Free tier is plenty for eNote.
            </p>
          </div>
        )}
      </SettingsSection>
    </>
  );
}
