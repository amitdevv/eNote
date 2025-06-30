import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseKeyboardShortcutsProps {
  onNewNote?: () => void;
  onSearch?: () => void;
  onSave?: () => void;
}

export const useKeyboardShortcuts = ({ 
  onNewNote, 
  onSearch, 
  onSave 
}: UseKeyboardShortcutsProps = {}) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const ctrlKey = isMac ? event.metaKey : event.ctrlKey;

      // Ctrl/Cmd + N - New note
      if (ctrlKey && event.key === 'n') {
        event.preventDefault();
        if (onNewNote) {
          onNewNote();
        } else {
          navigate('/editor');
        }
      }

      // Ctrl/Cmd + K - Search (focus search)
      if (ctrlKey && event.key === 'k') {
        event.preventDefault();
        if (onSearch) {
          onSearch();
        }
      }

      // Ctrl/Cmd + S - Save
      if (ctrlKey && event.key === 's') {
        event.preventDefault();
        if (onSave) {
          onSave();
        }
      }

      // Ctrl/Cmd + / - Toggle help
      if (ctrlKey && event.key === '/') {
        event.preventDefault();
        // Could show a help modal in the future
      }

      // ESC - Go back to notes (only if not already handled by other components)
      if (event.key === 'Escape' && window.location.pathname.includes('/editor')) {
        // Check if the event was already handled/prevented
        if (!event.defaultPrevented) {
          // Additional check: don't navigate if user is in a specific context (like code block)
          const activeElement = document.activeElement;
          const isInCodeBlock = activeElement?.closest('pre') || activeElement?.closest('[data-type="codeBlock"]');
          
          if (!isInCodeBlock) {
            navigate('/notes');
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navigate, onNewNote, onSearch, onSave]);
};

export default useKeyboardShortcuts; 