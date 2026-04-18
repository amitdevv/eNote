/**
 * Label palette. Users pick a color key per label in Settings; we render the
 * pill using the {dot, bg, text} triple for that key. Orphans (a label name
 * on a note that no longer has a record) fall back to `stone`.
 *
 * Rules: dots are ~50–60% lightness (readable as a "yellow"/"blue"/etc. signal),
 * backgrounds are ~90–95% lightness (quiet tint on our warm-neutral panel),
 * text is dark enough to read on the tinted background.
 */
export type LabelPalette = { dot: string; bg: string; text: string };

export const PALETTE_KEYS = [
  'amber', 'yellow', 'lime', 'green', 'teal', 'cyan',
  'blue', 'indigo', 'purple', 'pink', 'red', 'stone',
] as const;
export type PaletteKey = (typeof PALETTE_KEYS)[number];

export const PALETTE: Record<PaletteKey, LabelPalette> = {
  amber:  { dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E' },
  yellow: { dot: '#EAB308', bg: '#FEF9C3', text: '#854D0E' },
  lime:   { dot: '#84CC16', bg: '#ECFCCB', text: '#3F6212' },
  green:  { dot: '#22C55E', bg: '#DCFCE7', text: '#166534' },
  teal:   { dot: '#14B8A6', bg: '#CCFBF1', text: '#115E59' },
  cyan:   { dot: '#06B6D4', bg: '#CFFAFE', text: '#155E75' },
  blue:   { dot: '#3B82F6', bg: '#DBEAFE', text: '#1E40AF' },
  indigo: { dot: '#6366F1', bg: '#E0E7FF', text: '#3730A3' },
  purple: { dot: '#A855F7', bg: '#F3E8FF', text: '#6B21A8' },
  pink:   { dot: '#EC4899', bg: '#FCE7F3', text: '#9D174D' },
  red:    { dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' },
  stone:  { dot: '#78716C', bg: '#F5F5F4', text: '#44403C' },
};

export function paletteByKey(key: string | null | undefined): LabelPalette {
  if (key && key in PALETTE) return PALETTE[key as PaletteKey];
  return PALETTE.stone;
}
