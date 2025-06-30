import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Folder } from '@/types/note';
import { useFoldersStore } from '@/stores/foldersStore';
import { FolderIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FolderManagerProps {
  isOpen: boolean;
  onClose: () => void;
  folder?: Folder | null;
  onSave: (folderData: Partial<Folder>) => void;
  parentId?: string; // For creating nested folders
}

const folderColors = [
  { name: 'Blue', class: 'bg-blue-500', value: 'bg-blue-500' },
  { name: 'Green', class: 'bg-green-500', value: 'bg-green-500' },
  { name: 'Purple', class: 'bg-purple-500', value: 'bg-purple-500' },
  { name: 'Orange', class: 'bg-orange-500', value: 'bg-orange-500' },
  { name: 'Pink', class: 'bg-pink-500', value: 'bg-pink-500' },
  { name: 'Indigo', class: 'bg-indigo-500', value: 'bg-indigo-500' },
  { name: 'Red', class: 'bg-red-500', value: 'bg-red-500' },
  { name: 'Teal', class: 'bg-teal-500', value: 'bg-teal-500' },
];

export const FolderManager: React.FC<FolderManagerProps> = ({
  isOpen,
  onClose,
  folder,
  onSave,
  parentId
}) => {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-blue-500');
  const [selectedParentId, setSelectedParentId] = useState<string>('');

  const { folders, getFolderPath } = useFoldersStore();

  // Get available parent folders (exclude current folder and its descendants)
  const availableParentFolders = React.useMemo(() => {
    if (!folder) {
      // For new folders, show all folders as potential parents
      return folders;
    }
    
    // For editing existing folders, exclude the folder itself and its descendants
    const excludeFolderIds = new Set([folder.id]);
    
    // Find all descendants
    const findDescendants = (folderId: string) => {
      folders.forEach(f => {
        if (f.parentId === folderId && !excludeFolderIds.has(f.id)) {
          excludeFolderIds.add(f.id);
          findDescendants(f.id);
        }
      });
    };
    
    findDescendants(folder.id);
    
    return folders.filter(f => !excludeFolderIds.has(f.id));
  }, [folder, folders]);

  React.useEffect(() => {
    if (folder) {
      setName(folder.name);
      setSelectedColor(folder.color);
      setSelectedParentId(folder.parentId || '');
    } else {
      setName('');
      setSelectedColor('bg-blue-500');
      setSelectedParentId(parentId || '');
    }
  }, [folder, isOpen, parentId]);

  const handleSave = () => {
    if (!name.trim()) {
      return;
    }

    const folderData: Partial<Folder> = {
      name: name.trim(),
      color: selectedColor,
      parentId: selectedParentId || undefined,
    };

    onSave(folderData);
    // Don't call onClose here - let the parent handle it
    setName('');
    setSelectedColor('bg-blue-500');
    setSelectedParentId('');
  };

  const handleClose = () => {
    onClose();
    setName('');
    setSelectedColor('bg-blue-500');
    setSelectedParentId('');
  };

  // Build folder path display
  const getParentFolderPath = (folderId: string) => {
    const path = getFolderPath(folderId);
    return path.map(f => f.name).join(' > ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {folder ? 'Edit Folder' : 'Create New Folder'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Folder Name */}
          <div className="space-y-2">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter folder name..."
              className="w-full"
              autoFocus
              onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            />
          </div>

          {/* Parent Folder Selection */}
          <div className="space-y-2">
            <Label>Parent Folder</Label>
            <Select value={selectedParentId || "none"} onValueChange={(value) => setSelectedParentId(value === "none" ? "" : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Root level">
                  {selectedParentId ? (
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-gray-400" />
                      <span className="truncate">{getParentFolderPath(selectedParentId)}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Root level</span>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <div className="flex items-center gap-2">
                    <FolderIcon className="w-4 h-4 text-gray-400" />
                    <span>Root level</span>
                  </div>
                </SelectItem>
                {availableParentFolders.map((parentFolder) => (
                  <SelectItem key={parentFolder.id} value={parentFolder.id}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-2 h-2 rounded-full", parentFolder.color)} />
                      <span className="truncate">{getParentFolderPath(parentFolder.id)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <Label>Folder Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {folderColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setSelectedColor(color.value)}
                  className={cn(
                    "flex items-center justify-center w-12 h-12 rounded-lg border-2 transition-all duration-200",
                    selectedColor === color.value
                      ? "border-gray-900 dark:border-gray-100 scale-110"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500"
                  )}
                  title={color.name}
                >
                  <div className={cn("w-6 h-6 rounded-full", color.class)} />
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="space-y-2">
            <Label>Preview</Label>
            <div className="flex flex-col space-y-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              {selectedParentId && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  In: {getParentFolderPath(selectedParentId)}
                </div>
              )}
              <div className="flex items-center space-x-3">
                <div className={cn("w-3 h-3 rounded-full", selectedColor)} />
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {name || 'Folder Name'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!name.trim()}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {folder ? 'Update Folder' : 'Create Folder'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 