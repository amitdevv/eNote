import { useEffect, useRef } from 'react';

type Snapshot<T> = {
  savedAt: number;
  baseUpdatedAt: string | null;
  draft: T;
};

const KEY_PREFIX = 'enote-draft:';

function storageKey(id: string) {
  return `${KEY_PREFIX}${id}`;
}

/**
 * Read (and remove) a recovered snapshot if it's newer than the server copy.
 * Used on note load to restore unsaved edits after a crash.
 */
export function readDraftSnapshot<T>(id: string, serverUpdatedAt: string | null): T | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const snap = JSON.parse(raw) as Snapshot<T>;
    if (!snap || typeof snap.savedAt !== 'number') return null;
    if (serverUpdatedAt && new Date(serverUpdatedAt).getTime() >= snap.savedAt) {
      // Server is newer — snapshot is stale. Drop it.
      localStorage.removeItem(storageKey(id));
      return null;
    }
    return snap.draft;
  } catch {
    return null;
  }
}

export function clearDraftSnapshot(id: string) {
  try {
    localStorage.removeItem(storageKey(id));
  } catch {
    // ignore
  }
}

/**
 * Throttled write-through to localStorage so unsaved edits survive a crash.
 * Complements useAutoSave (which persists to the server on idle / exit paths).
 * Call clearDraftSnapshot(id) once the server has confirmed the save.
 */
export function useDraftSnapshot<T>({
  id,
  draft,
  baseUpdatedAt,
  enabled = true,
  throttleMs = 300,
}: {
  id: string | null | undefined;
  draft: T;
  baseUpdatedAt: string | null;
  enabled?: boolean;
  throttleMs?: number;
}) {
  const timerRef = useRef<number | null>(null);
  const latestRef = useRef<{ draft: T; baseUpdatedAt: string | null }>({ draft, baseUpdatedAt });
  latestRef.current = { draft, baseUpdatedAt };

  useEffect(() => {
    if (!enabled || !id) return;

    const write = () => {
      try {
        const snap: Snapshot<T> = {
          savedAt: Date.now(),
          baseUpdatedAt: latestRef.current.baseUpdatedAt,
          draft: latestRef.current.draft,
        };
        localStorage.setItem(storageKey(id), JSON.stringify(snap));
      } catch {
        // Quota or serialization error — ignore; autosave still runs.
      }
    };

    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(write, throttleMs);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [id, draft, enabled, throttleMs]);
}
