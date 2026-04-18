import { useEffect } from 'react';

const BASE = 'eNote';

/**
 * Sets document.title to `{prefix} — eNote`, or just `eNote` if prefix is falsy.
 * Resets on unmount.
 */
export function useDocumentTitle(prefix?: string | null) {
  useEffect(() => {
    const prev = document.title;
    document.title = prefix && prefix.trim() ? `${prefix} — ${BASE}` : BASE;
    return () => {
      document.title = prev;
    };
  }, [prefix]);
}
