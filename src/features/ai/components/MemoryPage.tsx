import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { useMyFacts, useRetireFact, useAIStatus } from '../hooks';
import { Button } from '@/shared/components/ui/button';
import { HugeiconsIcon, AiBrain02Icon, Delete01Icon, Note01Icon } from '@/shared/lib/icons';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import type { UserFact } from '../api';

function formatPredicate(p: string): string {
  return p.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function FactRow({ fact }: { fact: UserFact }) {
  const retire = useRetireFact();

  const onRetire = async () => {
    try {
      await retire.mutateAsync(fact.id);
      toast.success('Fact retired', {
        description: 'eNote will ignore it when answering questions.',
      });
    } catch (e) {
      toast.error("Couldn't retire fact", {
        description: e instanceof Error ? e.message : undefined,
      });
    }
  };

  return (
    <li className="group rounded-xl border border-line-subtle bg-surface-card px-4 py-3 hover:border-line-default transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-micro font-medium uppercase tracking-wider text-ink-subtle">
              {formatPredicate(fact.predicate)}
            </span>
          </div>
          <p className="text-body text-ink-strong">{fact.statement}</p>
          {fact.source_note_id && (
            <Link
              to={`/notes/${fact.source_note_id}`}
              className="mt-2 inline-flex items-center gap-1.5 text-caption text-ink-muted hover:text-brand transition-colors"
            >
              <HugeiconsIcon icon={Note01Icon} size={13} />
              <span className="truncate max-w-[28ch]">
                {fact.source_note_title || 'Untitled'}
              </span>
            </Link>
          )}
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={onRetire}
          disabled={retire.isPending}
          className="shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100 transition-opacity"
          aria-label="Retire this fact"
          title="Retire — eNote will ignore this fact when answering"
        >
          <HugeiconsIcon icon={Delete01Icon} size={14} />
        </Button>
      </div>
    </li>
  );
}

export function MemoryPage() {
  useDocumentTitle('Memory');
  const { data: status } = useAIStatus();
  const { data: facts, isLoading } = useMyFacts();

  if (status && !status.connected) {
    return (
      <div className="mx-auto max-w-[680px] px-6 py-16 text-center">
        <div className="inline-flex items-center justify-center size-12 rounded-2xl bg-brand/10 text-brand mb-4">
          <HugeiconsIcon icon={AiBrain02Icon} size={22} />
        </div>
        <h1 className="text-header font-semibold text-ink-strong mb-2">Memory</h1>
        <p className="text-preview text-ink-muted max-w-prose mx-auto">
          Connect Gemini in Settings to let eNote learn facts about you from
          your notes. When you contradict yourself across notes, newer wins —
          so Ask always gives the current answer.
        </p>
        <Link
          to="/settings"
          className="mt-5 inline-block text-caption text-brand hover:underline"
        >
          Go to settings →
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[680px] px-6 py-8">
      <header className="mb-6">
        <div className="flex items-center gap-2.5 mb-1">
          <HugeiconsIcon icon={AiBrain02Icon} size={20} className="text-brand" />
          <h1 className="text-header font-semibold text-ink-strong">Memory</h1>
        </div>
        <p className="text-preview text-ink-muted max-w-prose">
          Facts eNote has learned about you. These are the authoritative source
          when Ask answers factual questions — newer facts automatically
          supersede older ones. Hover a fact to retire it.
        </p>
      </header>

      {isLoading && (
        <div className="py-10 text-center text-preview text-ink-muted">
          Loading memory…
        </div>
      )}

      {!isLoading && (!facts || facts.length === 0) && (
        <div className="rounded-xl border border-dashed border-line-subtle px-6 py-10 text-center">
          <p className="text-preview text-ink-muted">
            Nothing learned yet. Write notes about yourself (preferences,
            attributes, goals) and eNote will pick them up.
          </p>
          <Link
            to="/settings"
            className="mt-3 inline-block text-caption text-brand hover:underline"
          >
            Or run “Build memory” from Settings →
          </Link>
        </div>
      )}

      {!isLoading && facts && facts.length > 0 && (
        <ul className="flex flex-col gap-2">
          {facts.map((f) => (
            <FactRow key={f.id} fact={f} />
          ))}
        </ul>
      )}
    </div>
  );
}
