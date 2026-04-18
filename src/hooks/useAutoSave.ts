import { useEffect, useRef, useCallback } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAuth } from '@/contexts/AuthContext';

export const useAutoSave = () => {
  const { currentNoteId, content, tags, fontFamily, fontSize } = useEditorStore();
  const { addNote, updateNote } = useNotesStore();
  const { user } = useAuth();
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const saveNote = useCallback(async () => {
    if (!user?.id) return;
    if (!content.trim() && (!tags || tags.length === 0)) return;

    const noteData = {
      content,
      tags: tags || [],
      fontFamily: fontFamily || 'Inter',
      fontSize: fontSize || 16,
    };

    if (currentNoteId) {
      await updateNote(currentNoteId, noteData, user.id);
    } else {
      const newId = await addNote(noteData, user.id);
      if (newId) {
        useEditorStore.setState({ currentNoteId: newId });
      }
    }
  }, [currentNoteId, content, tags, fontFamily, fontSize, addNote, updateNote, user?.id]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (!user?.id) return;

    timeoutRef.current = setTimeout(saveNote, 2000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [content, tags, fontFamily, fontSize, saveNote, user?.id]);

  return { saveNote };
};
