import { memo, useState } from 'react';
import { NodeViewWrapper, NodeViewContent, type NodeViewProps } from '@tiptap/react';
import { cn } from '@/shared/lib/cn';

const LANGUAGES: { value: string; label: string }[] = [
  { value: 'null', label: 'Auto' },
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
      <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
        <path d="M2.5 7.5l2.75 2.75L11.5 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <rect x="4.5" y="4.5" width="8" height="8.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.5 4.5V3a1.5 1.5 0 0 0-1.5-1.5H3A1.5 1.5 0 0 0 1.5 3v7A1.5 1.5 0 0 0 3 11.5h1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function WrapIcon({ on }: { on?: boolean }) {
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M1.5 3h11M1.5 10.5h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d={on ? 'M1.5 7h8.25a2.25 2.25 0 0 1 0 4.5H7.5m1.5-1.5 1.5 1.5L9 12.5' : 'M1.5 7h11'}
        stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function CodeBlockViewImpl({ node, updateAttributes }: NodeViewProps) {
  const [copiedAt, setCopiedAt] = useState(0);
  const language = (node.attrs.language ?? 'null') as string;
  const wrapped = node.attrs.wrapped === true;
  const justCopied = copiedAt > 0;

  function copy() {
    navigator.clipboard.writeText(node.textContent).then(() => {
      setCopiedAt(Date.now());
      setTimeout(() => setCopiedAt(0), 1400);
    });
  }

  return (
    <NodeViewWrapper
      className="relative group my-[0.5em]"
      data-wrapped={wrapped ? 'true' : 'false'}
    >
      <div
        contentEditable={false}
        className="absolute top-2 right-2 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity select-none"
      >
        <select
          value={language}
          onChange={(e) => updateAttributes({ language: e.target.value === 'null' ? null : e.target.value })}
          className="h-6 pl-1.5 pr-5 text-micro font-medium text-ink-muted hover:text-ink-strong bg-transparent hover:bg-surface-active rounded-md border-0 appearance-none cursor-pointer focus:outline-none"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10' fill='none'><path d='M2.5 3.75 5 6.25l2.5-2.5' stroke='%236B6965' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/></svg>\")",
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 4px center',
          }}
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => updateAttributes({ wrapped: !wrapped })}
          aria-label={wrapped ? 'Disable word wrap' : 'Enable word wrap'}
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
          aria-label={justCopied ? 'Copied' : 'Copy code'}
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

      <pre>
        <NodeViewContent<'code'> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}

// Re-render only when attrs change. Content updates flow through
// NodeViewContent directly via ProseMirror — React re-renders would
// tear down the DOM ProseMirror holds refs to, breaking cursor position.
export const CodeBlockView = memo(
  CodeBlockViewImpl,
  (prev, next) =>
    prev.node.attrs.language === next.node.attrs.language &&
    prev.node.attrs.wrapped === next.node.attrs.wrapped
);
