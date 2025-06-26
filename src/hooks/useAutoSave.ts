import { useEffect, useRef } from 'react';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';

export const useAutoSave = () => {
  const { 
    currentNoteId, 
    title, 
    content, 
    status, 
    folderId,
    tags, 
    fontFamily, 
    isDirty,
    markClean,
    setAutoSaveTimer 
  } = useEditorStore();
  
  const { addNote, updateNote } = useNotesStore();
  const lastSaveRef = useRef<string>('');
  
  // Create a stable reference to current note data
  const currentDataRef = useRef({
    title,
    content,
    status,
    folderId,
    tags,
    fontFamily
  });
  
  // Update ref when data changes
  useEffect(() => {
    currentDataRef.current = {
      title,
      content,
      status,
      folderId,
      tags,
      fontFamily
    };
  }, [title, content, status, folderId, tags, fontFamily]);

  const saveNote = () => {
    const data = currentDataRef.current;
    
    // Don't save if there's no meaningful content
    if (!data.title.trim() && !data.content.trim()) {
      return;
    }

    // Create a unique string representation of current data
    const currentDataString = JSON.stringify(data);
    
    // Skip if nothing has changed since last save
    if (lastSaveRef.current === currentDataString) {
      return;
    }

    const noteData = {
      title: data.title.trim() || 'Untitled',
      content: data.content,
      type: 'markdown' as const,
      status: data.status,
      folderId: data.folderId || undefined,
      tags: data.tags,
      fontFamily: data.fontFamily,
    };

    if (currentNoteId) {
      updateNote(currentNoteId, noteData);
    } else {
      // For new notes, add and update the editor with the new ID
      const newId = addNote(noteData);
      useEditorStore.setState({ currentNoteId: newId });
    }

    lastSaveRef.current = currentDataString;
    markClean();
  };

  // Auto-save effect
  useEffect(() => {
    if (!isDirty) return;

    const timer = setTimeout(() => {
      saveNote();
    }, 2000); // 2 second delay

    setAutoSaveTimer(timer);

    return () => {
      clearTimeout(timer);
    };
  }, [isDirty]); // Only depend on isDirty flag

  // Manual save function
  const manualSave = () => {
    saveNote();
  };

  return { manualSave };
}; 