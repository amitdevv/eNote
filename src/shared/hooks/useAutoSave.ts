import { useEffect, useRef } from 'react';

type Options<T> = {
  /** The value to save. Auto-save triggers when this changes. */
  value: T;
  /** Called to persist the value. Should be stable (use useEvent / ref if needed). */
  save: (value: T) => Promise<void> | void;
  /** Milliseconds of idle time before saving. Default 700. */
  delay?: number;
  /** If false, skips saving. Useful while initial data is loading. */
  enabled?: boolean;
};

/**
 * Debounced auto-save with guaranteed flush on:
 *   - unmount
 *   - tab hide (visibilitychange)
 *   - tab close (beforeunload)
 *   - any explicit flush() call via the returned ref
 *
 * Behaviour:
 *   - On value change, starts a timer for `delay` ms.
 *   - Subsequent changes reset the timer.
 *   - Any "exit path" flushes immediately, synchronous if possible.
 */
export function useAutoSave<T>({ value, save, delay = 700, enabled = true }: Options<T>) {
  const timerRef = useRef<number | null>(null);
  const pendingRef = useRef<T | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;

  function flush() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const pending = pendingRef.current;
    if (pending !== null) {
      pendingRef.current = null;
      void saveRef.current(pending);
    }
  }

  useEffect(() => {
    if (!enabled) return;
    pendingRef.current = value;
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      const pending = pendingRef.current;
      timerRef.current = null;
      if (pending !== null) {
        pendingRef.current = null;
        void saveRef.current(pending);
      }
    }, delay);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [value, delay, enabled]);

  // Flush on tab hide, close, and unmount.
  useEffect(() => {
    if (!enabled) return;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };
    const onBeforeUnload = () => {
      flush();
    };
    window.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onBeforeUnload);
      flush();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  return { flush };
}
