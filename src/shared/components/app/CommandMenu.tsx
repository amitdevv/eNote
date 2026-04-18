import { Command } from 'cmdk';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotesUI } from '@/features/notes/store';
import { useCreateNote, useSearchNotes } from '@/features/notes/hooks';
import { useAuth } from '@/features/auth/hooks';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { HugeiconsIcon, PlusSignIcon, Search01Icon, Settings01Icon, Logout01Icon, Note01Icon } from '@/shared/lib/icons';

export function CommandMenu() {
  const { commandOpen, setCommandOpen } = useNotesUI();
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 200);
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
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh] bg-black/20 backdrop-blur-sm animate-fade-in"
      onClick={close}
    >
      <Command
        loop
        label="Command menu"
        className="w-full max-w-[560px] overflow-hidden rounded-xl border border-line-default bg-surface-panel shadow-lg animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 border-b border-line-subtle px-3 h-11">
          <HugeiconsIcon icon={Search01Icon} size={14} className="text-ink-subtle" />
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Search or run a command…"
            className="flex-1 bg-transparent text-[14px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
          />
        </div>

        <Command.List className="max-h-[50vh] overflow-y-auto p-1.5">
          <Command.Empty className="py-8 text-center text-[13px] text-ink-muted">
            No results.
          </Command.Empty>

          {debouncedQuery.trim() && results && results.length > 0 && (
            <Command.Group
              heading="Notes"
              className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle px-2 py-1.5"
            >
              {results.map((n) => (
                <Command.Item
                  key={n.id}
                  value={`note-${n.id}-${n.title}`}
                  onSelect={() => {
                    close();
                    navigate(`/notes/${n.id}`);
                  }}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-default cursor-pointer data-[selected=true]:bg-surface-muted"
                >
                  <HugeiconsIcon icon={Note01Icon} size={14} className="text-ink-subtle" />
                  <span className="truncate">{n.title || 'Untitled'}</span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          <Command.Group
            heading="Actions"
            className="text-[11px] font-medium uppercase tracking-wider text-ink-subtle px-2 py-1.5"
          >
            <Command.Item
              value="new-note"
              onSelect={handleCreate}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-default cursor-pointer data-[selected=true]:bg-surface-muted"
            >
              <HugeiconsIcon icon={PlusSignIcon} size={14} className="text-ink-subtle" />
              <span>New note</span>
              <kbd className="ml-auto text-[11px] text-ink-subtle">C</kbd>
            </Command.Item>

            <Command.Item
              value="settings"
              onSelect={() => {
                close();
                navigate('/settings');
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-default cursor-pointer data-[selected=true]:bg-surface-muted"
            >
              <HugeiconsIcon icon={Settings01Icon} size={14} className="text-ink-subtle" />
              <span>Open settings</span>
            </Command.Item>

            <Command.Item
              value="sign-out"
              onSelect={() => {
                close();
                signOut();
              }}
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] text-ink-default cursor-pointer data-[selected=true]:bg-surface-muted"
            >
              <HugeiconsIcon icon={Logout01Icon} size={14} className="text-ink-subtle" />
              <span>Sign out</span>
            </Command.Item>
          </Command.Group>
        </Command.List>

        <div className="flex items-center justify-between border-t border-line-subtle px-3 h-8 text-[11px] text-ink-subtle">
          <span>↑↓ navigate · ↵ select · esc close</span>
          <span>⌘K</span>
        </div>
      </Command>
    </div>
  );
}
