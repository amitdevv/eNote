import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesUI } from '@/features/notes/store';
import { useCreateNote, useSearchNotes } from '@/features/notes/hooks';
import { getDisplayTitle } from '@/features/notes/types';
import { useAuth } from '@/features/auth/hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { Kbd } from '@/shared/components/ui/kbd';
import {
  HugeiconsIcon,
  PlusSignIcon,
  Search01Icon,
  Settings01Icon,
  Logout01Icon,
  Note01Icon,
  ArchiveIcon,
} from '@/shared/lib/icons';

const itemCls =
  'flex items-center gap-2.5 rounded-md px-2 h-8 text-[13px] text-ink-default cursor-pointer select-none data-[selected=true]:bg-surface-muted data-[selected=true]:text-ink-strong';

const groupCls =
  '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-ink-subtle';

export function CommandMenu() {
  const { commandOpen, setCommandOpen } = useNotesUI();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 180);
  const navigate = useNavigate();
  const createNote = useCreateNote();
  const { signOut } = useAuth();
  const { data: results } = useSearchNotes(debouncedQuery);

  useEffect(() => {
    if (!commandOpen) setQuery('');
  }, [commandOpen]);

  function close() {
    setCommandOpen(false);
  }

  async function handleCreate() {
    close();
    const note = await createNote.mutateAsync();
    navigate(`/notes/${note.id}`);
  }

  if (!commandOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] bg-black/25 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <Command
        loop
        label="Command menu"
        className="w-full max-w-[560px] overflow-hidden rounded-xl border border-line-default bg-surface-panel shadow-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line-subtle px-3 h-12">
          <HugeiconsIcon icon={Search01Icon} size={15} className="text-ink-subtle shrink-0" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search notes or run a command…"
            className="flex-1 bg-transparent text-[14px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
          />
          <Kbd>Esc</Kbd>
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto p-1.5">
          <Command.Empty className="py-10 text-center text-[13px] text-ink-muted">
            No results.
          </Command.Empty>

          {debouncedQuery.trim() && results && results.length > 0 && (
            <Command.Group heading="Notes" className={groupCls}>
              {results.map((n) => {
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

          <Command.Group heading="Actions" className={groupCls}>
            <Command.Item value="new-note" onSelect={handleCreate} className={itemCls}>
              <HugeiconsIcon icon={PlusSignIcon} size={14} className="text-ink-subtle" />
              <span className="flex-1">New note</span>
              <Kbd>C</Kbd>
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

        <div className="flex items-center justify-between gap-2 border-t border-line-subtle px-3 h-9 text-[11px] text-ink-subtle">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              <span>navigate</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Kbd>↵</Kbd>
              <span>select</span>
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <Kbd>⌘</Kbd>
            <Kbd>K</Kbd>
          </span>
        </div>
      </Command>
    </div>
  );
}
