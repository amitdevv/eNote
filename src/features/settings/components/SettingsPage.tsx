import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Kbd } from '@/shared/components/ui/kbd';
import { PageHeader } from '@/shared/components/app/PageHeader';
import { useSettings, type Density } from '../store';
import { UI_FONTS, EDITOR_FONTS } from '../fonts';
import { cn } from '@/shared/lib/cn';
import { AccountSettings } from '@/features/account/components/AccountSettings';
import { LabelsSettings } from '@/features/labels/components/LabelsSettings';
import { HighlightsSettings } from '@/features/highlights/components/HighlightsSettings';
import { AISettings } from '@/features/ai/components/AISettings';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { SettingsSection, SettingsRow, SettingsDivider } from './SettingsSection';

const DENSITY_OPTIONS: { value: Density; label: string; hint: string }[] = [
  { value: 'compact', label: 'Compact', hint: 'Smaller text, denser rows' },
  { value: 'default', label: 'Default', hint: 'Balanced' },
  { value: 'comfortable', label: 'Comfortable', hint: 'Larger text, more breathing room' },
];

type TabId = 'account' | 'appearance' | 'ai' | 'labels' | 'highlights' | 'shortcuts';

const TABS: { id: TabId; label: string }[] = [
  { id: 'account', label: 'Account' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'ai', label: 'AI' },
  { id: 'labels', label: 'Labels' },
  { id: 'highlights', label: 'Highlights' },
  { id: 'shortcuts', label: 'Shortcuts' },
];

export function SettingsPage() {
  useDocumentTitle('Settings');
  const [tab, setTab] = useState<TabId>('account');
  const density = useSettings((s) => s.density);
  const setDensity = useSettings((s) => s.setDensity);
  const uiFont = useSettings((s) => s.uiFont);
  const setUIFont = useSettings((s) => s.setUIFont);
  const editorFont = useSettings((s) => s.editorFont);
  const setEditorFont = useSettings((s) => s.setEditorFont);

  return (
    <>
      <PageHeader title="Settings" />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-[720px] mx-auto px-8 pt-8 pb-16">
          <Tabs.Root value={tab} onValueChange={(v) => setTab(v as TabId)}>
            <Tabs.List className="flex items-center gap-1 mb-8 -mx-1">
              {TABS.map((t) => (
                <Tabs.Trigger
                  key={t.id}
                  value={t.id}
                  className={cn(
                    'relative h-9 px-3 rounded-md text-preview font-medium transition-colors',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
                    'data-[state=active]:text-ink-strong data-[state=active]:bg-surface-muted',
                    'data-[state=inactive]:text-ink-muted hover:text-ink-strong hover:bg-surface-muted/60',
                  )}
                >
                  {t.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            <Tabs.Content value="account" className="focus:outline-none">
              <AccountSettings />
            </Tabs.Content>

            <Tabs.Content value="appearance" className="focus:outline-none">
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
                            'h-7 px-3 rounded-[5px] text-caption font-medium transition-colors duration-150',
                            active
                              ? 'bg-surface-raised text-ink-strong shadow-xs'
                              : 'text-ink-muted hover:text-ink-strong',
                          )}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </SettingsRow>

                <SettingsDivider />

                <SettingsRow
                  label="Interface font"
                  hint="Used in the sidebar, menus, and buttons."
                >
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {UI_FONTS.map((opt) => {
                      const active = uiFont === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setUIFont(opt.value)}
                          title={opt.hint}
                          className={cn(
                            'flex items-center gap-2 h-8 px-2.5 rounded-md border text-caption font-medium transition-colors',
                            active
                              ? 'border-brand bg-brand/10 text-ink-strong'
                              : 'border-line-default text-ink-muted hover:border-line-default hover:bg-surface-muted hover:text-ink-strong',
                          )}
                        >
                          <span
                            className="text-[15px] leading-none"
                            style={{ fontFamily: opt.stack }}
                          >
                            {opt.preview}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </SettingsRow>

                <SettingsDivider />

                <SettingsRow
                  label="Editor font"
                  hint="Used when you're writing inside a note."
                >
                  <div className="flex items-center gap-1.5 flex-wrap justify-end">
                    {EDITOR_FONTS.map((opt) => {
                      const active = editorFont === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => setEditorFont(opt.value)}
                          title={opt.hint}
                          className={cn(
                            'flex items-center gap-2 h-8 px-2.5 rounded-md border text-caption font-medium transition-colors',
                            active
                              ? 'border-brand bg-brand/10 text-ink-strong'
                              : 'border-line-default text-ink-muted hover:bg-surface-muted hover:text-ink-strong',
                          )}
                        >
                          <span
                            className="text-[15px] leading-none"
                            style={{ fontFamily: opt.stack }}
                          >
                            {opt.preview}
                          </span>
                          <span>{opt.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </SettingsRow>
              </SettingsSection>
            </Tabs.Content>

            <Tabs.Content value="ai" className="focus:outline-none">
              <AISettings />
            </Tabs.Content>

            <Tabs.Content value="labels" className="focus:outline-none">
              <LabelsSettings />
            </Tabs.Content>

            <Tabs.Content value="highlights" className="focus:outline-none">
              <HighlightsSettings />
            </Tabs.Content>

            <Tabs.Content value="shortcuts" className="focus:outline-none">
              <SettingsSection
                title="Keyboard shortcuts"
                description="Press these from anywhere in the app."
              >
                {(
                  [
                    ['New note', 'C'],
                    ['Focus search', '/'],
                    ['Command palette', '⌘K'],
                    ['Close overlays', 'Esc'],
                  ] as const
                ).map(([label, key], i, arr) => (
                  <div key={label}>
                    <SettingsRow label={label}>
                      <Kbd>{key}</Kbd>
                    </SettingsRow>
                    {i < arr.length - 1 && <SettingsDivider />}
                  </div>
                ))}
              </SettingsSection>
            </Tabs.Content>
          </Tabs.Root>
        </div>
      </div>
    </>
  );
}
