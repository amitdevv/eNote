import { useState } from 'react';
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { toast } from 'sonner';
import * as Popover from '@radix-ui/react-popover';
import { Command } from 'cmdk';
import { cn } from '@/shared/lib/cn';

const LANGUAGES: { value: string | null; label: string }[] = [
  { value: null, label: 'Auto detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'html', label: 'HTML' },
  { value: 'css', label: 'CSS' },
  { value: 'json', label: 'JSON' },
  { value: 'bash', label: 'Bash' },
  { value: 'python', label: 'Python' },
  { value: 'sql', label: 'SQL' },
  { value: 'markdown', label: 'Markdown' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
  { value: 'java', label: 'Java' },
];

function CopyIcon({ ok }: { ok?: boolean }) {
  if (ok) {
    return (
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path
          d="M2.5 7.5l2.75 2.75L11.5 4"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="4.5" y="4.5" width="8" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function WrapIcon({ on }: { on?: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1.5 3h11M1.5 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d={on ? 'M1.5 7h8.25a2.25 2.25 0 0 1 0 4.5H7.5m1.5-1.5 1.5 1.5L9 12.5' : 'M1.5 7h11'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden>
      <path
        d="M2.5 3.75 5 6.25l2.5-2.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const [open, setOpen] = useState(false);
  const [copiedAt, setCopiedAt] = useState(0);
  const language = (node.attrs.language ?? null) as string | null;
  const wrapped = node.attrs.wrapped === true;
  const currentLabel =
    LANGUAGES.find((l) => l.value === language)?.label ?? language ?? 'Auto detect';

  async function copy() {
    try {
      await navigator.clipboard.writeText(node.textContent);
      setCopiedAt(Date.now());
      setTimeout(() => setCopiedAt(0), 1400);
    } catch {
      toast.error('Copy failed');
    }
  }

  const justCopied = copiedAt > 0;

  return (
    <NodeViewWrapper
      className="relative group my-[0.5em]"
      data-wrapped={wrapped ? 'true' : 'false'}
    >
      <div
        contentEditable={false}
        className="absolute top-2 right-2 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity select-none"
      >
        <Popover.Root open={open} onOpenChange={setOpen}>
          <Popover.Trigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 h-6 rounded-md px-1.5 text-[11px] font-medium text-ink-muted hover:bg-surface-active hover:text-ink-strong transition-colors"
            >
              {currentLabel}
              <ChevronIcon />
            </button>
          </Popover.Trigger>
          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={6}
              className="z-50 rounded-lg border border-line-default bg-surface-panel shadow-md overflow-hidden w-[200px] data-[state=open]:animate-fade-in"
            >
              <Command loop>
                <div className="border-b border-line-subtle px-2 h-9 flex items-center">
                  <Command.Input
                    placeholder="Search language…"
                    className="flex-1 bg-transparent text-[13px] text-ink-strong placeholder:text-ink-placeholder focus:outline-none"
                  />
                </div>
                <Command.List className="max-h-[260px] overflow-y-auto p-1">
                  <Command.Empty className="py-6 text-center text-[12px] text-ink-muted">
                    No matches.
                  </Command.Empty>
                  {LANGUAGES.map((lang) => {
                    const active = language === lang.value;
                    return (
                      <Command.Item
                        key={lang.value ?? '__auto__'}
                        value={lang.label}
                        onSelect={() => {
                          updateAttributes({ language: lang.value });
                          setOpen(false);
                        }}
                        className="flex items-center w-full gap-2 rounded-md px-2 h-8 text-[13px] text-ink-default cursor-pointer data-[selected=true]:bg-surface-muted"
                      >
                        <span className="flex-1 truncate">{lang.label}</span>
                        {active && <span className="text-brand text-[13px]">✓</span>}
                      </Command.Item>
                    );
                  })}
                </Command.List>
              </Command>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>

        <button
          type="button"
          onClick={() => updateAttributes({ wrapped: !wrapped })}
          aria-label={wrapped ? 'Disable word wrap' : 'Enable word wrap'}
          title={wrapped ? 'Disable word wrap' : 'Enable word wrap'}
          className={cn(
            'h-6 w-6 flex items-center justify-center rounded-md transition-colors',
            wrapped
              ? 'bg-surface-active text-ink-strong'
              : 'text-ink-muted hover:bg-surface-active hover:text-ink-strong'
          )}
        >
          <WrapIcon on={wrapped} />
        </button>

        <button
          type="button"
          onClick={copy}
          aria-label="Copy code"
          title={justCopied ? 'Copied' : 'Copy code'}
          className={cn(
            'h-6 w-6 flex items-center justify-center rounded-md transition-colors',
            justCopied
              ? 'text-brand'
              : 'text-ink-muted hover:bg-surface-active hover:text-ink-strong'
          )}
        >
          <CopyIcon ok={justCopied} />
        </button>
      </div>

      <pre className="!m-0">
        <NodeViewContent<'code'> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
