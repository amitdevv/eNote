import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';
import { ConfirmDialog } from '@/shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  HugeiconsIcon,
  PlusSignIcon,
  MoreHorizontalIcon,
  Delete01Icon,
  BubbleChatIcon,
} from '@/shared/lib/icons';
import { useConversations, useDeleteConversation } from '../hooks';

function formatDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  const msDiff = today.getTime() - d.getTime();
  if (msDiff < 7 * 24 * 60 * 60 * 1000) return d.toLocaleDateString(undefined, { weekday: 'long' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Group conversations by (Today | Yesterday | Monday… | Apr 12) based on
 * updated_at. Preserves the server's already-desc order within each group.
 */
function groupByDay(conversations: { id: string; updated_at: string }[]): {
  key: string;
  ids: string[];
}[] {
  const groups: Record<string, string[]> = {};
  const order: string[] = [];
  for (const c of conversations) {
    const key = formatDay(c.updated_at);
    if (!(key in groups)) {
      groups[key] = [];
      order.push(key);
    }
    groups[key].push(c.id);
  }
  return order.map((k) => ({ key: k, ids: groups[k] }));
}

export function ConversationList({
  activeId,
  onNew,
}: {
  activeId: string | null;
  onNew: () => void;
}) {
  const navigate = useNavigate();
  const { data: list, isLoading } = useConversations();
  const del = useDeleteConversation();
  const [toDelete, setToDelete] = useState<{ id: string; title: string } | null>(
    null,
  );

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await del.mutateAsync(toDelete.id);
      if (toDelete.id === activeId) navigate('/ask');
      toast.success('Chat deleted');
    } catch (e) {
      toast.error("Couldn't delete", {
        description: e instanceof Error ? e.message : undefined,
      });
    } finally {
      setToDelete(null);
    }
  }

  const byDay = list ? groupByDay(list) : [];
  const byId = new Map(list?.map((c) => [c.id, c]));

  return (
    <aside className="hidden md:flex h-full w-[260px] shrink-0 flex-col border-r border-line-subtle bg-[#fdfcfa]">
      <div className="flex h-11 items-center justify-between gap-2 border-b border-line-subtle px-3 shrink-0">
        <span className="text-caption font-medium text-ink-muted uppercase tracking-wider">
          Chats
        </span>
        <Button size="sm" variant="ghost" onClick={onNew} className="gap-1.5">
          <HugeiconsIcon icon={PlusSignIcon} size={12} />
          New
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {isLoading ? (
          <div className="px-2 py-3 text-caption text-ink-muted">Loading…</div>
        ) : !list || list.length === 0 ? (
          <div className="px-2 py-6 text-center">
            <HugeiconsIcon
              icon={BubbleChatIcon}
              size={18}
              className="text-ink-subtle mx-auto mb-2"
            />
            <p className="text-caption text-ink-muted">No chats yet.</p>
            <p className="text-micro text-ink-subtle mt-0.5">
              Ask a question on the right to start.
            </p>
          </div>
        ) : (
          byDay.map((g) => (
            <div key={g.key} className="mb-3">
              <p className="px-2 pb-1 text-micro font-medium uppercase tracking-wider text-ink-subtle">
                {g.key}
              </p>
              <ul>
                {g.ids.map((id) => {
                  const c = byId.get(id)!;
                  const active = id === activeId;
                  return (
                    <li key={id}>
                      <div
                        className={cn(
                          'group relative flex items-center gap-1 rounded-lg pl-2 pr-1 h-8 transition-colors',
                          active
                            ? 'bg-surface-muted text-ink-strong'
                            : 'hover:bg-surface-muted/60 text-ink-default',
                        )}
                      >
                        <button
                          onClick={() => navigate(`/ask/${id}`)}
                          className="flex-1 min-w-0 text-left text-preview truncate"
                          title={c.title ?? 'Untitled chat'}
                        >
                          {c.title ?? 'Untitled chat'}
                        </button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              onClick={(e) => e.stopPropagation()}
                              aria-label="Chat actions"
                              className="opacity-0 group-hover:opacity-100 data-[state=open]:opacity-100 flex size-6 items-center justify-center rounded-md text-ink-muted hover:bg-surface-raised hover:text-ink-strong transition"
                            >
                              <HugeiconsIcon icon={MoreHorizontalIcon} size={14} />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              destructive
                              onSelect={() =>
                                setToDelete({ id, title: c.title ?? 'Untitled chat' })
                              }
                            >
                              <HugeiconsIcon icon={Delete01Icon} size={14} />
                              Delete chat
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(open) => !open && setToDelete(null)}
        title="Delete this chat?"
        description={
          toDelete
            ? `"${toDelete.title}" and all its messages will be permanently removed.`
            : undefined
        }
        confirmLabel={del.isPending ? 'Deleting…' : 'Delete'}
        destructive
        onConfirm={confirmDelete}
      />
    </aside>
  );
}
