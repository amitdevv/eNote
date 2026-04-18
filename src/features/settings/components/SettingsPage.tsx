import { useAuth } from '@/features/auth/hooks';
import { Button } from '@/shared/components/ui/button';
import { useSettings, type Density } from '../store';
import { cn } from '@/shared/lib/cn';

const DENSITY_OPTIONS: { value: Density; label: string; hint: string }[] = [
  { value: 'compact', label: 'Compact', hint: 'Smaller text, denser rows' },
  { value: 'default', label: 'Default', hint: 'Balanced' },
  { value: 'comfortable', label: 'Comfortable', hint: 'Larger text, more breathing room' },
];

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="text-[12px] font-medium uppercase tracking-wider text-ink-subtle px-1">
        {title}
      </h2>
      <div className="rounded-xl border border-line-subtle bg-surface-raised overflow-hidden">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-line-subtle last:border-0">
      <div className="min-w-0">
        <p className="text-[14px] text-ink-strong">{label}</p>
        {hint && <p className="text-[12px] text-ink-muted mt-0.5">{hint}</p>}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const density = useSettings((s) => s.density);
  const setDensity = useSettings((s) => s.setDensity);

  return (
    <>
      <header className="flex items-center justify-between border-b border-line-subtle px-4 h-11">
        <h1 className="text-header font-medium text-ink-strong">Settings</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[620px] mx-auto p-8 space-y-8">
          <Section title="Account">
            <Row label="Signed in as" hint={user?.email ?? ''}>
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                Sign out
              </Button>
            </Row>
          </Section>

          <Section title="Appearance">
            <div className="p-4">
              <p className="text-[14px] text-ink-strong">Density</p>
              <p className="text-[12px] text-ink-muted mt-0.5 mb-3">
                Scale of text and controls across the app.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {DENSITY_OPTIONS.map((opt) => {
                  const active = density === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDensity(opt.value)}
                      className={cn(
                        'rounded-lg border px-3 py-2.5 text-left transition-colors duration-150',
                        active
                          ? 'border-brand bg-brand/5 ring-1 ring-brand/30'
                          : 'border-line-default bg-surface-raised hover:bg-surface-muted'
                      )}
                    >
                      <p
                        className={cn(
                          'text-[13px] font-medium',
                          active ? 'text-ink-strong' : 'text-ink-default'
                        )}
                      >
                        {opt.label}
                      </p>
                      <p className="text-[11px] text-ink-muted mt-0.5">{opt.hint}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </Section>

          <Section title="Keyboard shortcuts">
            <Row label="New note">
              <kbd className="px-1.5 py-0.5 rounded border border-line-default text-[11px] text-ink-default bg-surface-raised font-mono">C</kbd>
            </Row>
            <Row label="Focus search">
              <kbd className="px-1.5 py-0.5 rounded border border-line-default text-[11px] text-ink-default bg-surface-raised font-mono">/</kbd>
            </Row>
            <Row label="Command palette">
              <kbd className="px-1.5 py-0.5 rounded border border-line-default text-[11px] text-ink-default bg-surface-raised font-mono">⌘K</kbd>
            </Row>
            <Row label="Close overlays">
              <kbd className="px-1.5 py-0.5 rounded border border-line-default text-[11px] text-ink-default bg-surface-raised font-mono">Esc</kbd>
            </Row>
          </Section>
        </div>
      </div>
    </>
  );
}
