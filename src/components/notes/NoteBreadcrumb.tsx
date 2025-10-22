import React from 'react';
import { getTitleFromContent } from '@/utils/titleUtils';
import { ChevronRight, Home, FileText } from 'lucide-react';
import { Note } from '@/types/note';

interface NoteBreadcrumbProps {
  note: Note | null;
  isNewNote: boolean;
  currentTitle: string;
}

export const NoteBreadcrumb: React.FC<NoteBreadcrumbProps> = ({
  note,
  isNewNote,
  currentTitle
}) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
      <Home className="w-4 h-4" />
      <span>Notes</span>
      <ChevronRight className="w-4 h-4" />
      <FileText className="w-4 h-4" />
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {isNewNote ? (currentTitle || 'New Note') : (note ? getTitleFromContent(note.content) : 'Untitled')}
      </span>
    </nav>
  );
}; 