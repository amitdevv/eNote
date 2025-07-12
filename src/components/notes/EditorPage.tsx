import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { getNoteById } = useNotesStore();
  
  // Simplified - no folder assignments needed
  
  const { 
    title, 
    content, 
    fontFamily,
    fontSize,
    setCurrentNote,
    setTitle,
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
    <div className="relative h-full w-full max-w-full overflow-y-auto">
      <Card className="min-h-full w-full max-w-full border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e]">
        <CardHeader className="pb-2 sticky top-0 bg-white dark:bg-[#1e1e1e] z-10">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="text-2xl font-bold border-none px-0 py-2 focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 w-full max-w-full"
          />
        </CardHeader>
        
        <CardContent className="pt-0 w-full max-w-full" style={{ fontFamily, fontSize: `${fontSize}px` }}>
          <div className="pb-16 w-full max-w-full">
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="use / to open the menu"
              fontFamily={fontFamily}
              fontSize={fontSize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 