import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAIStore } from '@/stores/aiStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useFocusMode } from '@/contexts/FocusModeContext';
import TipTapEditor from '@/components/editor/TipTapEditor';
import FocusMode from '@/components/editor/FocusMode';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { getNoteById } = useNotesStore();
  const { focusMode, toggleFocusMode, setFocusMode } = useFocusMode();
  const { isOpen: isAIOpen, toggleSidebar: toggleAI } = useAIStore();
  
  // Simplified - no folder assignments needed
  
  const { 
    content, 
    fontFamily,
    fontSize,
    setCurrentNote,
    setContent
  } = useEditorStore();
  
  useAutoSave();

  useKeyboardShortcuts({
    onNewNote: () => navigate('/editor'),
    onSearch: () => {},
    onSave: () => {},
    onFocusMode: toggleFocusMode // Add focus mode toggle
  });

  // Get current note from store
  // const currentNote = currentNoteId ? (getNoteById(currentNoteId) || null) : null;

  // Load note if editing existing note
  useEffect(() => {
    if (noteId) {
      const existingNote = getNoteById(noteId);
      if (existingNote) {
        setCurrentNote(existingNote);
      } else {
        // Note not found, redirect to new note
        navigate('/editor', { replace: true });
      }
    } else {
      // Reset for new note with optional initial context
      setCurrentNote(null);
    }
  }, [noteId, getNoteById, navigate, setCurrentNote]);

  // No folder context needed - simplified

  // const isNewNote = !noteId || !currentNote;

  return (
    <>
      {/* Focus Mode Overlay */}
      <FocusMode
        content={content}
        onChange={setContent}
        fontFamily={fontFamily}
        fontSize={fontSize}
        isActive={focusMode}
        onExit={() => setFocusMode(false)}
      />
      
      {/* Regular Editor */}
      {!focusMode && (
        <div className="relative h-full w-full flex">
          {/* Main Editor Area */}
          <div 
            className="w-full transition-all duration-300"
            style={{ fontFamily, fontSize: `${fontSize}px` }}
          >
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="Start writing... use / to open the menu"
              fontFamily={fontFamily}
              fontSize={fontSize}
            />
          </div>

          {/* Floating AI Chat Button */}
          {!isAIOpen && (
            <Button
              onClick={toggleAI}
              className="fixed bottom-6 right-6 z-40 h-14 w-14 rounded-full bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 group"
              title="Open AI Assistant"
            >
              <Sparkles className="w-6 h-6 group-hover:scale-110 transition-transform duration-200" />
            </Button>
          )}
        </div>
      )}
    </>
  );
}; 