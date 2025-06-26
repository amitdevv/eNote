import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';

export const useAutoSave = () => {
  const { 
    currentNoteId, 
    title, 
    content, 
    tags, 
    fontFamily,
    markClean 
  } = useEditorStore();
  
  const { addNote, updateNote } = useNotesStore();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveNote = useCallback(async () => {
    // Only save if we have something to save
    if (!title.trim() && !content.trim() && (!tags || tags.length === 0)) {
      return;
    }

    const noteData = {
      title: title.trim() || 'Untitled',
      content: content,
      tags: tags || [],
      fontFamily: fontFamily || 'Inter',
      type: 'markdown' as const
    };

    try {
      if (currentNoteId) {
        await updateNote(currentNoteId, noteData);
      } else {
        const newId = await addNote(noteData);
        if (newId) {
          useEditorStore.setState({ currentNoteId: newId });
        }
      }
      markClean();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [currentNoteId, title, content, tags, fontFamily, addNote, updateNote, markClean]);

  // Auto-save with debounce
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for 2 seconds
    timeoutRef.current = setTimeout(() => {
      saveNote();
    }, 2000);

    // Cleanup
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [title, content, tags, fontFamily, saveNote]);

  return {
    saveNote
  };
}; 