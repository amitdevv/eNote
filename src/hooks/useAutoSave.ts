import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAuth } from '@/contexts/AuthContext';

export const useAutoSave = () => {
  const { 
    currentNoteId, 
    content, 
    contentType,
    tags, 
    fontFamily,
    fontSize,
    markClean 
  } = useEditorStore();
  
  const { addNote, updateNote } = useNotesStore();
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveNote = useCallback(async () => {
    // Don't save if user is not authenticated
    if (!user?.id) {
      return;
    }

    // Only save if we have something to save
    if (!content.trim() && (!tags || tags.length === 0)) {
      return;
    }

    const noteData = {
      content: content,
      type: contentType,
      tags: tags || [],
      fontFamily: fontFamily || 'Inter',
      fontSize: fontSize || 16,
    };

    try {
      if (currentNoteId) {
        await updateNote(currentNoteId, noteData, user.id);
      } else {
        const newId = await addNote(noteData, user.id);
        if (newId) {
          useEditorStore.setState({ currentNoteId: newId });
        }
      }
      markClean();
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [currentNoteId, content, contentType, tags, fontFamily, fontSize, addNote, updateNote, markClean, user?.id]);

  // Auto-save with debounce
  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Don't set timeout if user is not authenticated
    if (!user?.id) {
      return;
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
  }, [content, contentType, tags, fontFamily, fontSize, saveNote, user?.id]);

  return {
    saveNote
  };
}; 