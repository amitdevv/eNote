import { useHotkeys } from 'react-hotkeys-hook';
import { useNavigate } from 'react-router-dom';
import { useNotesUI } from '@/features/notes/store';
import { useCreateNote } from '@/features/notes/hooks';

export function useGlobalShortcuts() {
  const navigate = useNavigate();
  const { commandOpen, setCommandOpen } = useNotesUI();
  const createNote = useCreateNote();

  useHotkeys(
    'mod+k',
    (e) => {
      e.preventDefault();
      setCommandOpen(!commandOpen);
    },
    { enableOnFormTags: true }
  );

  useHotkeys(
    'c',
    async (e) => {
      e.preventDefault();
      const note = await createNote.mutateAsync();
      navigate(`/notes/${note.id}`, { state: { fresh: true } });
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
    },
    { enableOnFormTags: true }
  );
}
