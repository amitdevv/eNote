import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import TipTapEditor from '@/components/editor/TipTapEditor';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { getNoteById } = useNotesStore();
  
  // Simplified - no folder assignments needed
  
  const { 
    content, 
    fontFamily,
    fontSize,
    setCurrentNote,
    setContent
  } = useEditorStore();
  
  useAutoSave();

  useKeyboardShortcuts();

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
    <div className="h-full w-full" style={{ fontFamily, fontSize: `${fontSize}px` }}>
      <TipTapEditor
        content={content}
        onChange={setContent}
        placeholder="Start writing... use / to open the menu"
        fontFamily={fontFamily}
        fontSize={fontSize}
      />
    </div>
  );
}; 