import { useHotkeys } from 'react-hotkeys-hook';
import { useNotesUI } from '@/features/notes/store';

export function useGlobalShortcuts() {
  const {
    commandOpen,
    setCommandOpen,
    quickCaptureOpen,
    setQuickCaptureOpen,
  } = useNotesUI();

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      setCommandOpen(!commandOpen);
    },
    { enableOnFormTags: true }
  );

  // Quick-capture: opens a compact modal. No full-editor navigation unless user asks.
  useHotkeys(
    'c',
    (e) => {
      e.preventDefault();
      setQuickCaptureOpen(true);
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    '/',
    (e) => {
      e.preventDefault();
      const input = document.querySelector<HTMLInputElement>('[data-search-input]');
      input?.focus();
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'esc',
    () => {
      if (commandOpen) setCommandOpen(false);
      if (quickCaptureOpen) setQuickCaptureOpen(false);
    },
    { enableOnFormTags: true }
  );
}
