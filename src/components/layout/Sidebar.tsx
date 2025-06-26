import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useFoldersStore } from '@/stores/foldersStore';
import { FolderManager } from '@/components/folders/FolderManager';
import { FolderTree } from '@/components/folders/FolderTree';
import { Folder } from '@/types/note';
import {
  Plus,
  Star,
  FileText,
  Calendar,
  Settings,
  Sun,
  Moon,
  FolderPlus,
  ChevronRight
} from 'lucide-react';
// Removed workspaces import - we'll show folders directly

interface SidebarProps {
  selectedWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
  onNewNote: () => void;
  noteCount: number;
  sidebarCounts?: {
    all: number;
    today: number;
    starred: number;
    todo: number;
    markdown: number;
    code: number;
  };
  onFolderSelect?: (folderId: string) => void;
  selectedFolder?: string;
  onNoteSelect?: (noteId: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedWorkspace,
  onWorkspaceChange,
  onNewNote,
  noteCount,
  sidebarCounts,
  onFolderSelect,
  selectedFolder,
  onNoteSelect
}) => {
  const [expandedFolders, setExpandedFolders] = React.useState<string[]>([]);
  const [folderManagerOpen, setFolderManagerOpen] = React.useState(false);
  const [editingFolder, setEditingFolder] = React.useState<Folder | null>(null);
  const [currentParentId, setCurrentParentId] = React.useState<string>('');
  
  const { theme, toggleTheme } = useTheme();
  
  const { 
    folders, 
    addFolder, 
    updateFolder, 
    deleteFolder, 
    getFoldersByParent 
  } = useFoldersStore();

  // Removed workspace toggle function - no longer needed

  const handleCreateFolder = (parentId?: string) => {
    setCurrentParentId(parentId || '');
    setEditingFolder(null);
    setFolderManagerOpen(true);
  };

  const handleCreateNote = (folderId?: string) => {
    // Create note with folder context if provided
    if (folderId) {
      // Navigate to editor with folder context
      const url = `/editor?folderId=${folderId}`;
      window.location.href = url;
    } else {
      onNewNote();
    }
  };

  const handleToggleFolderExpanded = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleEditFolder = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderManagerOpen(true);
  };

  const handleDeleteFolder = (folderId: string) => {
    if (window.confirm('Are you sure you want to delete this folder? Notes in this folder will be moved to "No Folder".')) {
      deleteFolder(folderId);
    }
  };

  const handleSaveFolder = (folderData: Partial<Folder>) => {
    console.log('handleSaveFolder called with:', folderData);
    console.log('editingFolder:', editingFolder);
    console.log('currentParentId:', currentParentId);
    
    if (editingFolder) {
      console.log('Updating folder:', editingFolder.id);
      updateFolder(editingFolder.id, folderData);
    } else {
      console.log('Adding new folder');
      const newFolderId = addFolder({ 
        name: folderData.name || 'New Folder',
        color: folderData.color || 'bg-blue-500',
        parentId: currentParentId || undefined
      });
      console.log('New folder created with ID:', newFolderId);
    }
    // Reset state
    setCurrentParentId('');
    setEditingFolder(null);
    setFolderManagerOpen(false);
  };

  const sidebarItems = [
    { icon: FileText, label: 'All Notes', count: sidebarCounts?.all || noteCount, id: 'all' },
    { icon: Calendar, label: 'Today', count: sidebarCounts?.today || 0, id: 'today' },
    { icon: Star, label: 'Starred', count: sidebarCounts?.starred || 0, id: 'starred' },
  ];

  return (
    <>
      <div className="w-64 h-screen bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notes</h1>
            <Button
              onClick={toggleTheme}
              size="sm"
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
          </div>
          
          {/* New Note Button */}
          <Button
            onClick={onNewNote}
            className="w-full bg-[#333333] hover:bg-[#404040] text-white mb-4"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {/* Quick Access Items */}
            <div className="mb-6">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between h-9 px-3 mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300",
                    selectedWorkspace === item.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
                  )}
                  onClick={() => onWorkspaceChange(item.id)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-400">
                    {item.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Folders Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">FOLDERS</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCreateFolder()}
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                  title="Create new folder"
                >
                  <FolderPlus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="space-y-1">
                <FolderTree
                  parentId={undefined}
                  selectedFolder={selectedFolder}
                  expandedFolders={expandedFolders}
                  onFolderSelect={(folderId) => onFolderSelect?.(folderId)}
                  onCreateFolder={handleCreateFolder}
                  onEditFolder={handleEditFolder}
                  onDeleteFolder={handleDeleteFolder}
                  onToggleExpanded={handleToggleFolderExpanded}
                  onNoteSelect={(noteId) => onNoteSelect?.(noteId)}
                  onCreateNote={handleCreateNote}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Settings */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button variant="ghost" className="w-full justify-start h-9 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-all duration-200">
            <Settings className="w-4 h-4 mr-3" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </div>

      {/* Folder Manager Dialog */}
      <FolderManager
        isOpen={folderManagerOpen}
        onClose={() => setFolderManagerOpen(false)}
        folder={editingFolder}
        onSave={handleSaveFolder}
        parentId={currentParentId}
      />
    </>
  );
};