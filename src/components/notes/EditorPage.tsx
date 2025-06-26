import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAutoSave } from '@/hooks/useAutoSave';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { TextStats } from '@/components/editor/TextStats';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { getNoteById } = useNotesStore();
  
  const { 
    title, 
    content, 
    fontFamily,
    setCurrentNote,
    setTitle,
    setContent,
    resetEditor
  } = useEditorStore();
  
  const { manualSave } = useAutoSave();

  useKeyboardShortcuts({
    onSave: () => manualSave()
  });

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
      // Reset for new note
      setCurrentNote(null);
    }
  }, [noteId, getNoteById, navigate, setCurrentNote]);

  return (
    <div className="relative h-full">
      <Card className="h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1e1e1e]">
        <CardHeader className="pb-4">
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title..."
            className="text-2xl font-bold border-none px-0 py-2 focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent dark:bg-[#1e1e1e] text-gray-900 dark:text-gray-100"
          />
        </CardHeader>
        
        <CardContent className="pt-0 h-full" style={{ fontFamily }}>
          <div className="h-full pb-16">
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