import { Kbd } from '@/shared/components/ui/kbd';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { useSettings, type Density } from '../store';
import { cn } from '@/shared/lib/cn';
import { AccountSettings } from '@/features/account/components/AccountSettings';
import { LabelsSettings } from '@/features/labels/components/LabelsSettings';
import { HighlightsSettings } from '@/features/highlights/components/HighlightsSettings';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { SettingsSection, SettingsRow, SettingsDivider } from './SettingsSection';

const DENSITY_OPTIONS: { value: Density; label: string; hint: string }[] = [
  { value: 'compact', label: 'Compact', hint: 'Smaller text, denser rows' },
  { value: 'default', label: 'Default', hint: 'Balanced' },
  { value: 'comfortable', label: 'Comfortable', hint: 'Larger text, more breathing room' },
];

export function SettingsPage() {
  useDocumentTitle('Settings');
  const density = useSettings((s) => s.density);
  const setDensity = useSettings((s) => s.setDensity);

  return (
    <>
      <PageHeader title="Settings" />

      <div className="flex-1 overflow-y-auto bg-surface-muted/40">
        <div className="max-w-[640px] mx-auto p-8 space-y-8">
          <AccountSettings />

          <SettingsSection
            title="Appearance"
            description="Adjust how eNote looks and feels across the app."
          >
            <SettingsRow label="Density" hint="Scale of text and controls.">
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
            </SettingsRow>
          </SettingsSection>

          <LabelsSettings />

          <HighlightsSettings />

          <SettingsSection
            title="Keyboard shortcuts"
            description="Press these from anywhere in the app."
          >
            {([
              ['New note', 'C'],
              ['Focus search', '/'],
              ['Command palette', '⌘K'],
              ['Close overlays', 'Esc'],
            ] as const).map(([label, key], i, arr) => (
              <div key={label}>
                <SettingsRow label={label}>
                  <Kbd>{key}</Kbd>
                </SettingsRow>
                {i < arr.length - 1 && <SettingsDivider />}
              </div>
            ))}
          </SettingsSection>
        </div>
      </div>
    </>
  );
}
