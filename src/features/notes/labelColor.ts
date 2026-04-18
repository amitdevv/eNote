/**
 * Deterministic colour for a label string.
 * Each label hashes to one of N palette entries so "work" is always
 * the same amber, "idea" always the same blue, etc. No user config.
 *
 * Palette values are picked for:
 *  - dot: ~50–60% lightness, enough saturation to register as "yellow/blue/etc."
 *  - bg:  ~95% lightness, ~25% saturation — tinted but quiet, reads on
 *         our warm-neutral surface-panel without shouting.
 *  - text: ~25–35% lightness so the label stays readable on the tinted bg.
 */
export type LabelPalette = { dot: string; bg: string; text: string };

const PALETTE: LabelPalette[] = [
  { dot: '#F59E0B', bg: '#FEF3C7', text: '#92400E' }, // amber
  { dot: '#EAB308', bg: '#FEF9C3', text: '#854D0E' }, // yellow
  { dot: '#84CC16', bg: '#ECFCCB', text: '#3F6212' }, // lime
  { dot: '#22C55E', bg: '#DCFCE7', text: '#166534' }, // green
  { dot: '#14B8A6', bg: '#CCFBF1', text: '#115E59' }, // teal
  { dot: '#06B6D4', bg: '#CFFAFE', text: '#155E75' }, // cyan
  { dot: '#3B82F6', bg: '#DBEAFE', text: '#1E40AF' }, // blue
  { dot: '#6366F1', bg: '#E0E7FF', text: '#3730A3' }, // indigo
  { dot: '#A855F7', bg: '#F3E8FF', text: '#6B21A8' }, // purple
  { dot: '#EC4899', bg: '#FCE7F3', text: '#9D174D' }, // pink
  { dot: '#EF4444', bg: '#FEE2E2', text: '#991B1B' }, // red
  { dot: '#78716C', bg: '#F5F5F4', text: '#44403C' }, // stone
];

function hash(str: string): number {
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function labelColor(label: string): LabelPalette {
  return PALETTE[hash(label.toLowerCase()) % PALETTE.length];
}
