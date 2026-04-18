import React, { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { useNotesStore } from '@/stores/notesStore';
import { useAutoSave } from '@/hooks/useAutoSave';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { getNoteById } = useNotesStore();

  const { content, fontFamily, fontSize, setCurrentNote, setContent } = useEditorStore();

  useAutoSave();

  useEffect(() => {
    if (noteId) {
      const existingNote = getNoteById(noteId);
      if (existingNote) {
        setCurrentNote(existingNote);
      } else {
        navigate('/editor', { replace: true });
      }
    } else {
      setCurrentNote(null);
    }
  }, [noteId, getNoteById, navigate, setCurrentNote]);

  return (
    <>
        <div className="relative h-full w-full flex p-4">
          {/* Main Editor Area */}
          <div 
            className="w-full transition-all duration-300"
            style={{ fontFamily, fontSize: `${fontSize}px` }}
          >
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Start writing..."
              className="w-full h-full min-h-screen p-6 border-0 outline-none resize-none bg-white dark:bg-[#272727] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 rounded-2xl focus:border-0 focus:outline-none focus:ring-0"
              style={{ fontFamily, fontSize: `${fontSize}px`, lineHeight: '1.6' }}
            />
          </div>

        </div>
    </>
  );
}; 