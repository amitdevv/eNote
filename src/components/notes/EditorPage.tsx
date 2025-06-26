import React, { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { NoteBreadcrumb } from '@/components/notes/NoteBreadcrumb';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TextStats } from '@/components/editor/TextStats';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { getNoteById } = useNotesStore();
  const location = useLocation();
  
  // Get URL parameters for initial folder assignment
  const searchParams = new URLSearchParams(location.search);
  const initialFolderId = searchParams.get('folderId');
  
  const { 
    title, 
    content, 
    fontFamily,
    currentNoteId,
    setCurrentNote,
    setTitle,
    setContent,
    setFolderId,
    resetEditor
  } = useEditorStore();
  
  const { manualSave } = useAutoSave();

  useKeyboardShortcuts({
    onSave: () => manualSave()
  });

  // Get current note from store
  const currentNote = currentNoteId ? (getNoteById(currentNoteId) || null) : null;

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
      
      // Set initial context from URL parameters
      if (initialFolderId) {
        // Set initial folder for new note
        setFolderId(initialFolderId);
      }
    }
  }, [noteId, getNoteById, navigate, setCurrentNote, initialFolderId, setFolderId]);

  const isNewNote = !noteId || !currentNote;

  return (
    <div className="relative h-full w-full max-w-full">
      <Card className="h-full w-full max-w-full border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e] overflow-hidden">
        <CardHeader className="pb-4">
          {/* Breadcrumb Navigation */}
          <NoteBreadcrumb 
            note={currentNote} 
            isNewNote={isNewNote}
            currentTitle={title}
          />
          
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="text-2xl font-bold border-none px-0 py-2 focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100 w-full max-w-full"
          />
        </CardHeader>
        
        <CardContent className="pt-0 h-full w-full max-w-full overflow-hidden" style={{ fontFamily }}>
          <div className="h-full pb-16 w-full max-w-full overflow-hidden">
            <TipTapEditor
              content={content}
              onChange={setContent}
              placeholder="use / to open the menu"
              fontFamily={fontFamily}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Text Statistics - positioned for visibility and PDF export */}
      <TextStats content={content} title={title} />
    </div>
  );
}; 