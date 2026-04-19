import { Command } from 'cmdk';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesUI } from '@/features/notes/store';
import { useCreateNote, useNotes, useSearchNotes } from '@/features/notes/hooks';
import { getDisplayTitle } from '@/features/notes/types';
import { useAuth } from '@/features/auth/hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { useAIStatus, useSemanticSearch } from '@/features/ai/hooks';
import { cn } from '@/shared/lib/cn';
import {
  HugeiconsIcon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  Logout01Icon,
  Note01Icon,
  ArchiveIcon,
  BubbleChatIcon,
} from '@/shared/lib/icons';

const itemCls =
  'flex items-center gap-2.5 rounded-md px-2 h-8 text-preview text-ink-default cursor-pointer select-none data-[selected=true]:bg-surface-muted data-[selected=true]:text-ink-strong';

const groupCls =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-micro [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-subtle';

type Mode = 'keyword' | 'ask';

export function CommandMenu() {
  const { commandOpen, setCommandOpen } = useNotesUI();
  const [rawQuery, setRawQuery] = useState('');
  const [mode, setMode] = useState<Mode>('keyword');
  const navigate = useNavigate();
  const createNote = useCreateNote();
  const { signOut } = useAuth();
  const { data: aiStatus } = useAIStatus();

  // "?" prefix switches to Ask mode inline — common power-user trick.
  // Strip the prefix from the query so the embedding call doesn't waste tokens.
  const { effectiveQuery, effectiveMode } = useMemo(() => {
    if (rawQuery.startsWith('?')) {
      return { effectiveQuery: rawQuery.slice(1).trim(), effectiveMode: 'ask' as Mode };
    }
    return { effectiveQuery: rawQuery, effectiveMode: mode };
  }, [rawQuery, mode]);

  // Ask mode benefits from a longer debounce — each keystroke is a network call
  // (query embedding) + RPC. 400ms strikes a balance between feeling responsive
  // and not burning the free-tier RPM.
  const debouncedKeyword = useDebounce(effectiveQuery, 180);
  const debouncedAsk = useDebounce(effectiveQuery, 400);

  const { data: keywordResults } = useSearchNotes(debouncedKeyword);
  const {
    data: askResults,
    isFetching: askLoading,
    error: askError,
  } = useSemanticSearch(effectiveMode === 'ask' ? debouncedAsk : '');

  const { data: allNotes } = useNotes();
  const recentNotes = (allNotes ?? []).slice(0, 5);
  const showRecent =
    !effectiveQuery.trim() && recentNotes.length > 0 && effectiveMode === 'keyword';

  useEffect(() => {
    if (!commandOpen) {
      setRawQuery('');
      setMode('keyword');
    }
  }, [commandOpen]);

  function close() {
    setCommandOpen(false);
  }

  async function handleCreate() {
    close();
    const note = await createNote.mutateAsync();
    navigate(`/notes/${note.id}`);
  }

  function toggleMode() {
    setMode((m) => (m === 'ask' ? 'keyword' : 'ask'));
    // Clear a `?` prefix in raw input when explicitly toggling off — avoids
    // the confusing state where the toggle says "keyword" but the prefix
    // forces ask mode anyway.
    if (rawQuery.startsWith('?')) setRawQuery(rawQuery.slice(1));
  }

  if (!commandOpen) return null;

  const askHasResults = askResults && askResults.length > 0;
  const askHasQuery = effectiveMode === 'ask' && effectiveQuery.length >= 3;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/20 animate-fade-in"
      onClick={close}
    >
      <Command
        loop
        label="Command menu"
        style={{ translate: '-50% 0' }}
        // cmdk filters items client-side by default (fuzzy match against
        // `value`). For AI results we already have server-ranked order, so
        // disable the built-in filter to preserve similarity order.
        shouldFilter={effectiveMode === 'keyword'}
        className="absolute left-1/2 top-[14vh] w-[min(calc(100vw-2rem),620px)] overflow-hidden rounded-2xl border border-line-default bg-surface-panel shadow-lg animate-sheet-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line-subtle px-3 h-12">
          <HugeiconsIcon
            icon={effectiveMode === 'ask' ? BubbleChatIcon : Search01Icon}
            size={15}
            className={cn(
              'shrink-0',
              effectiveMode === 'ask' ? 'text-brand' : 'text-ink-subtle'
            )}
          />
          <Command.Input
            value={rawQuery}
            onValueChange={setRawQuery}
            placeholder={
              effectiveMode === 'ask'
                ? 'Ask your notes anything…'
                : 'Search notes or run a command…'
            }
            className="flex-1 bg-transparent text-nav text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
          />
          <button
            type="button"
            onClick={toggleMode}
            disabled={!aiStatus?.connected}
            title={
              aiStatus?.connected
                ? "Switch between keyword search and AI 'Ask' mode"
                : 'Connect Gemini in Settings → AI to enable Ask mode'
            }
            className={cn(
              'shrink-0 h-7 px-2 rounded-md text-caption font-medium transition-colors',
              effectiveMode === 'ask'
                ? 'bg-brand/10 text-brand'
                : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong',
              !aiStatus?.connected && 'opacity-40 cursor-not-allowed hover:bg-transparent'
            )}
          >
            {effectiveMode === 'ask' ? 'Ask' : 'Keyword'}
          </button>
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto p-1.5">
          {/* Empty / loading / error states — only the one that matches runs */}

          {effectiveMode === 'ask' && !aiStatus?.connected && (
            <div className="py-8 text-center px-6">
              <p className="text-preview text-ink-muted mb-1">
                Gemini isn't connected yet.
              </p>
              <p className="text-caption text-ink-subtle">
                Add a free key in <span className="font-medium">Settings → AI</span> to
                search your notes by meaning.
              </p>
            </div>
          )}

          {effectiveMode === 'ask' && aiStatus?.connected && askHasQuery && askLoading && (
            <div className="py-8 text-center text-preview text-ink-muted">
              Thinking…
            </div>
          )}

          {effectiveMode === 'ask' &&
            aiStatus?.connected &&
            askHasQuery &&
            !askLoading &&
            askError && (
              <div className="py-8 text-center text-preview text-ink-muted">
                Couldn't reach Gemini. Try keyword search.
              </div>
            )}

          <Command.Empty className="py-10 text-center text-preview text-ink-muted">
            {effectiveMode === 'ask' ? 'No related notes.' : 'No results.'}
          </Command.Empty>

          {/* Ask mode: top item is "Chat with notes", followed by semantic nav results */}
          {effectiveMode === 'ask' && askHasQuery && aiStatus?.connected && (
            <Command.Group heading="Chat" className={groupCls}>
              <Command.Item
                value="ask-ai-chat"
                onSelect={() => {
                  close();
                  navigate(`/ask?q=${encodeURIComponent(effectiveQuery)}`);
                }}
                className={itemCls}
              >
                <HugeiconsIcon
                  icon={BubbleChatIcon}
                  size={14}
                  className="text-brand"
                />
                <span className="flex-1 truncate">
                  Ask AI: <span className="text-ink-muted">{effectiveQuery}</span>
                </span>
                <span className="text-micro text-ink-subtle shrink-0">Enter</span>
              </Command.Item>
            </Command.Group>
          )}

          {effectiveMode === 'ask' && askHasResults && (
            <Command.Group heading="Matching notes" className={groupCls}>
              {askResults!.map((hit) => {
                const title = hit.title?.trim() || 'Untitled';
                return (
                  <Command.Item
                    key={hit.id}
                    value={hit.id}
                    onSelect={() => {
                      close();
                      navigate(`/notes/${hit.id}`);
                    }}
                    className={itemCls}
                  >
                    <HugeiconsIcon
                      icon={Note01Icon}
                      size={14}
                      className="text-ink-subtle"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="truncate">{title}</div>
                      {hit.content_text && (
                        <div className="truncate text-caption text-ink-subtle">
                          {hit.content_text.slice(0, 120)}
                        </div>
                      )}
                    </div>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          {/* Keyword mode */}
          {effectiveMode === 'keyword' &&
            debouncedKeyword.trim() &&
            keywordResults &&
            keywordResults.length > 0 && (
              <Command.Group heading="Notes" className={groupCls}>
                {keywordResults.map((n) => {
                  const t = getDisplayTitle(n);
                  return (
                    <Command.Item
                      key={n.id}
                      value={`note-${n.id}-${t}`}
                      onSelect={() => {
                        close();
                        navigate(`/notes/${n.id}`);
                      }}
                      className={itemCls}
                    >
                      <HugeiconsIcon icon={Note01Icon} size={14} className="text-ink-subtle" />
                      <span className="truncate flex-1">{t}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            )}

          {showRecent && (
            <Command.Group heading="Recent" className={groupCls}>
              {recentNotes.map((n) => {
                const t = getDisplayTitle(n);
                return (
                  <Command.Item
                    key={n.id}
                    value={`recent-${n.id}-${t}`}
                    onSelect={() => {
                      close();
                      navigate(`/notes/${n.id}`);
                    }}
                    className={itemCls}
                  >
                    <HugeiconsIcon icon={Note01Icon} size={14} className="text-ink-subtle" />
                    <span className="truncate flex-1">{t}</span>
                  </Command.Item>
                );
              })}
            </Command.Group>
          )}

          <Command.Group heading="Actions" className={groupCls}>
            <Command.Item value="new-note" onSelect={handleCreate} className={itemCls}>
              <HugeiconsIcon icon={PlusSignIcon} size={14} className="text-ink-subtle" />
              <span className="flex-1">New note</span>
            </Command.Item>
            <Command.Item
              value="open-archived"
              onSelect={() => {
                close();
                navigate('/archived');
              }}
              className={itemCls}
            >
              <HugeiconsIcon icon={ArchiveIcon} size={14} className="text-ink-subtle" />
              <span className="flex-1">Open archived</span>
            </Command.Item>
            <Command.Item
              value="settings"
              onSelect={() => {
                close();
                navigate('/settings');
              }}
              className={itemCls}
            >
              <HugeiconsIcon icon={Settings01Icon} size={14} className="text-ink-subtle" />
              <span className="flex-1">Open settings</span>
            </Command.Item>
            <Command.Item
              value="sign-out"
              onSelect={() => {
                close();
                signOut();
              }}
              className={itemCls}
            >
              <HugeiconsIcon icon={Logout01Icon} size={14} className="text-ink-subtle" />
              <span className="flex-1">Sign out</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

      </Command>
    </div>
  );
}
