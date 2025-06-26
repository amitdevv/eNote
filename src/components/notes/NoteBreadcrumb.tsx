import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Note } from '@/types/note';
import { useFoldersStore } from '@/stores/foldersStore';
import { useEditorStore } from '@/stores/editorStore';
import { ChevronRight, Home, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteBreadcrumbProps {
  note: Note | null;
  isNewNote?: boolean;
  currentTitle?: string; // Current title being typed
}

export const NoteBreadcrumb: React.FC<NoteBreadcrumbProps> = ({ 
  note, 
  isNewNote = false, 
  currentTitle 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getFolderPath } = useFoldersStore();
  const { folderId: editorFolderId } = useEditorStore();

  // For new notes, get folder context from URL params or editor store
  let contextFolderId = note?.folderId;
  
  if (isNewNote) {
    const searchParams = new URLSearchParams(location.search);
    const urlFolderId = searchParams.get('folderId');
    
    contextFolderId = editorFolderId || urlFolderId || undefined;
  }

  // Get the full folder path hierarchy
  const folderPath = contextFolderId ? getFolderPath(contextFolderId) : [];
  
  // Use current title if provided, otherwise fall back to note title
  const displayTitle = currentTitle || note?.title || 'Untitled';

  const handleFolderClick = (folderId: string) => {
    navigate(`/notes?folder=${encodeURIComponent(folderId)}`);
  };

  const handleNotesClick = () => {
    navigate('/notes');
  };

  if (isNewNote) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4 px-1">
        <button
          onClick={handleNotesClick}
          className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          title="Go to All Notes"
        >
          <Home className="w-4 h-4 mr-1" />
          All Notes
        </button>
        <ChevronRight className="w-3 h-3" />
        <span className="flex items-center text-gray-700 dark:text-gray-300">
          <FileText className="w-4 h-4 mr-1" />
          {currentTitle || 'New Note'}
        </span>
      </div>
    );
  }

  if (!note) return null;

  return (
    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400 mb-4 px-1 overflow-x-auto">
      {/* Home / All Notes */}
      <button
        onClick={handleNotesClick}
        className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex-shrink-0"
        title="Go to All Notes"
      >
        <Home className="w-4 h-4 mr-1" />
        All Notes
      </button>

      <ChevronRight className="w-3 h-3 flex-shrink-0" />

      {/* Folder Hierarchy */}
      {folderPath.map((folder, index) => (
        <React.Fragment key={folder.id}>
          {index === 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          {index > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}
          <button
            onClick={() => handleFolderClick(folder.id)}
            className="flex items-center hover:text-gray-700 dark:hover:text-gray-300 transition-colors rounded px-2 py-1 hover:bg-gray-100 dark:hover:bg-gray-800 flex-shrink-0"
            title={`Go to ${folder.name} folder`}
          >
            <div className={cn("w-2 h-2 rounded-full mr-2", folder.color)} />
            <span className="truncate max-w-[150px]">{folder.name}</span>
          </button>
        </React.Fragment>
      ))}

      {folderPath.length > 0 && <ChevronRight className="w-3 h-3 flex-shrink-0" />}

      {/* Current Note */}
      <span className="flex items-center text-gray-700 dark:text-gray-300 font-medium flex-shrink-0">
        <FileText className="w-4 h-4 mr-1" />
        <span className="truncate max-w-[200px]" title={displayTitle}>
          {displayTitle}
        </span>
      </span>
    </div>
  );
}; 