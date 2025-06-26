import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFoldersStore } from '@/stores/foldersStore';
import { useNotesStore } from '@/stores/notesStore';
import { Folder } from '@/types/note';
import {
  ChevronRight,
  FolderPlus,
  MoreVertical,
  Edit,
  Trash2,
  FileText,
  Plus
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface FolderTreeProps {
  parentId?: string | null;
  level?: number;
  selectedFolder?: string;
  expandedFolders: string[];
  onFolderSelect: (folderId: string) => void;
  onCreateFolder: (parentId?: string) => void;
  onEditFolder: (folder: Folder) => void;
  onDeleteFolder: (folderId: string) => void;
  onToggleExpanded: (folderId: string) => void;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: (folderId?: string) => void;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  parentId,
  level = 0,
  selectedFolder,
  expandedFolders,
  onFolderSelect,
  onCreateFolder,
  onEditFolder,
  onDeleteFolder,
  onToggleExpanded,
  onNoteSelect,
  onCreateNote
}) => {
  const { getFoldersByParent } = useFoldersStore();
  const { notes } = useNotesStore();
  
  const folders = getFoldersByParent(parentId || undefined);
  const folderNotes = notes.filter(note => note.folderId === parentId);
  
  if (folders.length === 0 && folderNotes.length === 0) {
    return null;
  }

  return (
    <div className={cn("space-y-1", level > 0 && "ml-4")}>
      {folders.map((folder) => {
        const hasSubfolders = getFoldersByParent(folder.id).length > 0;
        const hasNotes = notes.filter(note => note.folderId === folder.id).length > 0;
        const hasChildren = hasSubfolders || hasNotes;
        const isExpanded = expandedFolders.includes(folder.id);
        const isSelected = selectedFolder === folder.id;

        return (
          <div key={folder.id}>
            {/* Folder Item */}
            <div className="flex items-center group">
              <div className="flex items-center flex-1 min-w-0">
                {hasChildren ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onToggleExpanded(folder.id)}
                    className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
                  >
                    <ChevronRight 
                      className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        isExpanded && "rotate-90"
                      )}
                    />
                  </Button>
                ) : (
                  <div className="w-6" />
                )}
                
                <Button
                  variant="ghost"
                  className={cn(
                    "flex-1 justify-between h-8 px-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300 min-w-0",
                    isSelected && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100"
                  )}
                  onClick={() => onFolderSelect(folder.id)}
                >
                  <div className="flex items-center min-w-0 flex-1">
                    <div className={cn("w-2 h-2 rounded-full mr-2 flex-shrink-0", folder.color)} />
                    <span className="text-sm truncate">{folder.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-400 flex-shrink-0 ml-2">
                    {folder.noteCount || 0}
                  </Badge>
                </Button>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCreateNote(folder.id)}
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title={`Create note in ${folder.name}`}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onCreateFolder(folder.id)}
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title={`Create subfolder in ${folder.name}`}
                >
                  <FolderPlus className="w-3 h-3" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <MoreVertical className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => onEditFolder(folder)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeleteFolder(folder.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Children - Subfolders and Notes */}
            {hasChildren && isExpanded && (
              <div className="ml-6">
                {/* Notes in this folder */}
                {notes.filter(note => note.folderId === folder.id).map((note) => (
                  <div key={note.id} className="flex items-center group py-1">
                    <div className="w-6" />
                    <Button
                      variant="ghost"
                      className="flex-1 justify-start h-7 px-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-600 dark:text-gray-400 min-w-0"
                      onClick={() => onNoteSelect(note.id)}
                    >
                      <FileText className="w-3 h-3 mr-2 flex-shrink-0" />
                      <span className="text-sm truncate">{note.title}</span>
                    </Button>
                  </div>
                ))}
                
                {/* Subfolders */}
                <FolderTree
                  parentId={folder.id}
                  level={level + 1}
                  selectedFolder={selectedFolder}
                  expandedFolders={expandedFolders}
                  onFolderSelect={onFolderSelect}
                  onCreateFolder={onCreateFolder}
                  onEditFolder={onEditFolder}
                  onDeleteFolder={onDeleteFolder}
                  onToggleExpanded={onToggleExpanded}
                  onNoteSelect={onNoteSelect}
                  onCreateNote={onCreateNote}
                />
              </div>
            )}
          </div>
        );
      })}
      
      {/* Root level notes (notes without a folder) */}
      {parentId === undefined && folderNotes.map((note) => (
        <div key={note.id} className="flex items-center group py-1">
          <div className="w-6" />
          <Button
            variant="ghost"
            className="flex-1 justify-start h-7 px-2 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-600 dark:text-gray-400 min-w-0"
            onClick={() => onNoteSelect(note.id)}
          >
            <FileText className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="text-sm truncate">{note.title}</span>
          </Button>
        </div>
      ))}
    </div>
  );
}; 