import { type ClassValue, clsx } from 'clsx';
import { extendTailwindMerge } from 'tailwind-merge';

// Teach tailwind-merge about our custom font-size aliases so it doesn't
// mistake them for text colors (which silently eats `text-white` / `text-brand`
// when combined with e.g. `text-preview` in the same class string).
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['micro', 'caption', 'preview', 'nav', 'header', 'title'] },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
