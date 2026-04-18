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

  // Slash and ⌘F both open the command palette (which doubles as search).
  useHotkeys(
    '/',
    (e) => {
      e.preventDefault();
      setCommandOpen(true);
    },
    { enableOnFormTags: false }
  );

  useHotkeys(
    'mod+f',
    (e) => {
      e.preventDefault();
      setCommandOpen(true);
    },
    { enableOnFormTags: true }
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
