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
    <section>
      <h2 className="text-[12px] font-medium uppercase tracking-wider text-ink-subtle mb-3">
        {title}
      </h2>
      <div className="divide-y divide-line-subtle">{children}</div>
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
    <div className="flex items-center justify-between gap-4 py-3">
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
            <Row label="Density" hint="Scale of text and controls across the app.">
              <div className="flex items-center gap-1 rounded-md bg-surface-muted p-0.5">
                {DENSITY_OPTIONS.map((opt) => {
                  const active = density === opt.value;
                  return (
                    <button
                      key={opt.value}
                      onClick={() => setDensity(opt.value)}
                      title={opt.hint}
                      className={cn(
                        'h-7 px-3 rounded-[5px] text-[12px] font-medium transition-colors duration-150',
                        active
                          ? 'bg-surface-raised text-ink-strong shadow-xs'
                          : 'text-ink-muted hover:text-ink-strong'
                      )}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Row>
          </Section>

          <Section title="Keyboard shortcuts">
            {[
              ['New note', 'C'],
              ['Focus search', '/'],
              ['Command palette', '⌘K'],
              ['Close overlays', 'Esc'],
            ].map(([label, key]) => (
              <Row key={label} label={label}>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-muted text-[11px] text-ink-default font-mono">
                  {key}
                </kbd>
              </Row>
            ))}
          </Section>
        </div>
      </div>
    </>
  );
}
