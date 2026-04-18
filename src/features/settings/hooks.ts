import { useEffect, useRef } from 'react';
import { useSettings } from './store';
import { uiFontStack, editorFontStack } from './fonts';
import { getUserSettings, upsertUserSettings } from './api';
import { useAuth } from '@/features/auth/hooks';

/** Applies the density preference to <html data-density=…> so CSS can target it. */
export function useApplyDensity() {
  const density = useSettings((s) => s.density);
  useEffect(() => {
    document.documentElement.dataset.density = density;
  }, [density]);
}

/** Applies font-family preferences via CSS variables. */
export function useApplyFonts() {
  const uiFont = useSettings((s) => s.uiFont);
  const editorFont = useSettings((s) => s.editorFont);
  useEffect(() => {
    document.documentElement.style.setProperty('--font-ui', uiFontStack(uiFont));
    document.documentElement.style.setProperty(
      '--font-editor',
      editorFontStack(editorFont),
    );
  }, [uiFont, editorFont]);
}

const DEFAULTS = {
  density: 'default',
  uiFont: 'inter',
  editorFont: 'inter',
} as const;

// How many consecutive sync failures before we surface a toast to the user.
// Single transient failures are noisy; persistent failures are worth reporting.
const SYNC_FAIL_THRESHOLD = 3;

/**
 * Syncs appearance settings (density, fonts) with Supabase so they follow
 * the user across devices.
 *
 * Flow:
 *   1. On sign-in, reset local state to defaults (so Device B doesn't briefly
 *      show Device A's settings during the hydration window), then fetch the
 *      user's row and hydrate zustand.
 *   2. After hydration, any change to density/uiFont/editorFont is debounced
 *      (300ms) and upserted to the server. Local zustand still updates
 *      instantly — the server write is fire-and-forget, with logging on
 *      failure and a toast after repeated failures so users aren't left in
 *      the dark when sync is silently broken.
 *   3. The first push immediately after hydration is suppressed — otherwise
 *      every login would trigger a round-trip write of data we just read.
 *
 * localStorage persistence is kept as a fast-paint fallback for offline /
 * logged-out use.
 */
export function useSyncSettings() {
  const { user } = useAuth();
  const density = useSettings((s) => s.density);
  const uiFont = useSettings((s) => s.uiFont);
  const editorFont = useSettings((s) => s.editorFont);
  const hydratedRef = useRef(false);
  // Suppress the very next push after a hydrate (see step 3 above).
  const skipNextPushRef = useRef(false);
  // Track consecutive failures so we only annoy the user once it looks
  // systemic, not for transient hiccups.
  const failureCountRef = useRef(0);
  const toastShownRef = useRef(false);

  // Step 1: hydrate from server when the user changes.
  useEffect(() => {
    if (!user) {
      // Sign-out: clear state so the next sign-in starts clean (no leak of
      // previous user's preferences onto the new user's screen).
      hydratedRef.current = false;
      skipNextPushRef.current = false;
      failureCountRef.current = 0;
      toastShownRef.current = false;
      useSettings.setState(DEFAULTS);
      return;
    }
    let cancelled = false;
    // Reset to defaults before fetch so Device B never momentarily shows
    // Device A's settings during the network window.
    skipNextPushRef.current = true;
    useSettings.setState(DEFAULTS);

    getUserSettings(user.id)
      .then((row) => {
        if (cancelled) return;
        if (row) {
          skipNextPushRef.current = true;
          useSettings.setState({
            density: row.density,
            uiFont: row.ui_font,
            editorFont: row.editor_font,
          });
        }
        hydratedRef.current = true;
      })
      .catch((err) => {
        if (cancelled) return;
        // Couldn't load — allow writes anyway so the user's local changes
        // still attempt to sync once the network recovers.
        console.warn('[settings] failed to load user_settings row', err);
        hydratedRef.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  // Step 2: debounced write on any change after hydration.
  useEffect(() => {
    if (!user || !hydratedRef.current) return;
    if (skipNextPushRef.current) {
      skipNextPushRef.current = false;
      return;
    }
    const timer = setTimeout(async () => {
      try {
        await upsertUserSettings(user.id, {
          density,
          ui_font: uiFont,
          editor_font: editorFont,
        });
        failureCountRef.current = 0;
        toastShownRef.current = false;
      } catch (err) {
        failureCountRef.current += 1;
        console.warn(
          `[settings] sync failed (attempt ${failureCountRef.current})`,
          err,
        );
        if (
          failureCountRef.current >= SYNC_FAIL_THRESHOLD &&
          !toastShownRef.current
        ) {
          toastShownRef.current = true;
          // Lazy-load sonner so this file stays light for the common case.
          import('sonner')
            .then(({ toast }) => {
              toast.error("Couldn't sync your preferences", {
                description:
                  "Changes are saved on this device and will sync when the connection recovers.",
              });
            })
            .catch(() => {});
        }
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [user?.id, density, uiFont, editorFont]);
}
