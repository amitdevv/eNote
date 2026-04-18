import type { EditorFont, UIFont } from './store';

export type FontOption<T extends string> = {
  value: T;
  label: string;
  hint: string;
  /** CSS font-family stack applied to --font-ui / --font-editor. */
  stack: string;
  /** Preview style for the picker. */
  preview: string;
};

export const UI_FONTS: FontOption<UIFont>[] = [
  {
    value: 'inter',
    label: 'Inter',
    hint: 'Neutral sans — default',
    stack: 'Inter, system-ui, -apple-system, sans-serif',
    preview: 'Aa',
  },
  {
    value: 'geist',
    label: 'Geist',
    hint: 'Geometric, slightly tighter',
    stack: 'Geist, Inter, system-ui, sans-serif',
    preview: 'Aa',
  },
  {
    value: 'system',
    label: 'System',
    hint: 'Matches your OS',
    stack: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    preview: 'Aa',
  },
];

export const EDITOR_FONTS: FontOption<EditorFont>[] = [
  {
    value: 'inter',
    label: 'Inter',
    hint: 'Sans — same as the interface',
    stack: 'Inter, system-ui, sans-serif',
    preview: 'Aa',
  },
  {
    value: 'geist',
    label: 'Geist',
    hint: 'Geometric sans',
    stack: 'Geist, Inter, system-ui, sans-serif',
    preview: 'Aa',
  },
  {
    value: 'lora',
    label: 'Lora',
    hint: 'Serif — best for long-form writing',
    stack: '"Lora", Georgia, "Times New Roman", serif',
    preview: 'Aa',
  },
  {
    value: 'mono',
    label: 'Fira Code',
    hint: 'Monospace — code-heavy notes',
    stack: '"Fira Code", ui-monospace, "SFMono-Regular", Menlo, monospace',
    preview: 'Aa',
  },
];

export function uiFontStack(f: UIFont): string {
  return (UI_FONTS.find((x) => x.value === f) ?? UI_FONTS[0]).stack;
}

export function editorFontStack(f: EditorFont): string {
  return (EDITOR_FONTS.find((x) => x.value === f) ?? EDITOR_FONTS[0]).stack;
}
