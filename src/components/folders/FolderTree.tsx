import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useFoldersStore } from '@/stores/foldersStore';
import { useNotesStore } from '@/stores/notesStore';
import { Folder } from '@/types/note';
import {
  ChevronRight,
  ChevronDown,
  FileText,
  Plus,
  Folder as FolderIcon,
  FolderOpen
} from 'lucide-react';

interface FolderTreeProps {
  parentId?: string | null;
  level?: number;
  selectedFolder?: string;
  expandedFolders: string[];
  onFolderSelect: (folderId: string) => void;
  onToggleExpanded: (folderId: string) => void;
  onNoteSelect: (noteId: string) => void;
  onCreateNote: (folderId?: string) => void;
}

interface TreeItem {
  type: 'folder' | 'note';
  id: string;
  name: string;
  data: Folder | any; // Note type
  children?: TreeItem[];
  noteCount?: number;
  color?: string;
}

export const FolderTree: React.FC<FolderTreeProps> = ({
  parentId,
  level = 0,
  selectedFolder,
  expandedFolders,
  onFolderSelect,
  onToggleExpanded,
  onNoteSelect,
  onCreateNote
}) => {
  const { getFoldersByParent } = useFoldersStore();
  const { notes } = useNotesStore();
  
  // Build tree structure combining folders and notes
  const buildTreeItems = (parentId?: string): TreeItem[] => {
    const items: TreeItem[] = [];
    
    // Get folders for this parent
    const folders = getFoldersByParent(parentId);
    
    // Add folders first
    folders.forEach(folder => {
      const folderNotes = notes.filter(note => note.folderId === folder.id);
      items.push({
        type: 'folder',
        id: folder.id,
        name: folder.name,
        data: folder,
        noteCount: folderNotes.length,
        color: folder.color,
        children: buildTreeItems(folder.id)
      });
    });
    
    // Add notes for this parent
    const parentNotes = notes.filter(note => note.folderId === parentId);
    parentNotes.forEach(note => {
      items.push({
        type: 'note',
        id: note.id,
        name: note.title,
        data: note
      });
    });
    
    return items;
  };
  
  const treeItems = buildTreeItems(parentId || undefined);
  
  // Debug: Log folder tree data
  React.useEffect(() => {
    if (level === 0) { // Only log for root level to avoid spam
      console.log('FolderTree - parentId:', parentId);
      console.log('FolderTree - All folders from store:', getFoldersByParent());
      console.log('FolderTree - Root folders:', getFoldersByParent(undefined));
      console.log('FolderTree - All notes:', notes);
      console.log('FolderTree - treeItems:', treeItems);
    }
  }, [treeItems, parentId, level, getFoldersByParent, notes]);
  
  if (treeItems.length === 0) {
    return null;
  }

  const renderTreeItem = (item: TreeItem, itemLevel: number) => {
    const isFolder = item.type === 'folder';
    const hasChildren = isFolder && item.children && item.children.length > 0;
    const isExpanded = isFolder && expandedFolders.includes(item.id);
    const isSelected = isFolder && selectedFolder === item.id;
    const indentLevel = itemLevel * 12; // 12px per level for tighter spacing

    return (
      <div key={item.id}>
        {/* Tree Item */}
        <div 
          className={cn(
            "flex items-center group hover:bg-gray-50 dark:hover:bg-gray-800/50 py-1 px-1 rounded-sm cursor-pointer",
            isSelected && "bg-blue-50 dark:bg-blue-900/20"
          )}
          style={{ paddingLeft: `${4 + indentLevel}px` }}
        >
          {/* Expand/Collapse Button */}
          {isFolder && hasChildren ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onToggleExpanded(item.id);
              }}
              className="h-4 w-4 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 mr-1 flex-shrink-0"
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          ) : (
            <div className="w-4 mr-1" /> // Spacer for alignment
          )}
          
          {/* Icon */}
          <div className="mr-2 flex-shrink-0">
            {isFolder ? (
              isExpanded ? (
                <FolderOpen className="w-4 h-4 text-blue-500" />
              ) : (
                <FolderIcon className="w-4 h-4 text-blue-500" />
              )
            ) : (
              <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            )}
          </div>
          
          {/* Name */}
          <div
            className={cn(
              "flex-1 min-w-0 text-sm select-none",
              isFolder ? "font-medium text-gray-800 dark:text-gray-200" : "text-gray-600 dark:text-gray-400"
            )}
            onClick={() => {
              if (isFolder) {
                onFolderSelect(item.id);
              } else {
                onNoteSelect(item.id);
              }
            }}
          >
            <span className="truncate block">
              {isFolder ? item.name : `${item.name}.md`}
            </span>
          </div>
          
          {/* Note Count Badge for Folders */}
          {isFolder && item.noteCount !== undefined && item.noteCount > 0 && (
            <Badge 
              variant="secondary" 
              className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 ml-2 h-5 px-2"
            >
              {item.noteCount}
            </Badge>
          )}
          
          {/* Action Buttons for Folders - Only Create Note */}
          {isFolder && (
            <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCreateNote(item.id);
                }}
                className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                title={`Create note in ${item.name}`}
              >
                <Plus className="w-3 h-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Children */}
        {isFolder && hasChildren && isExpanded && item.children && (
          <div>
            {item.children.map(child => renderTreeItem(child, itemLevel + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-0">
      {treeItems.map(item => renderTreeItem(item, level))}
    </div>
  );
}; 