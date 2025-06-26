import React from 'react';
import { Note, Folder } from '@/types/note';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFoldersStore } from '@/stores/foldersStore';
import { 
  X, Plus, Hash,
  Lightbulb, Search, ClipboardList, Edit3, Eye, CheckCircle, FolderIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, onClose, note, onSave }) => {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [status, setStatus] = React.useState<Note['status']>('idea');
  const [workspace, setWorkspace] = React.useState('Personal');
  const [folderId, setFolderId] = React.useState<string>('');
  const [tags, setTags] = React.useState('');
  const [newTag, setNewTag] = React.useState('');

  const { folders, getFoldersByWorkspace } = useFoldersStore();

  // Get folders for the selected workspace
  const workspaceFolders = React.useMemo(() => {
    return getFoldersByWorkspace(workspace);
  }, [workspace, folders, getFoldersByWorkspace]);

  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setWorkspace(note.workspace);
      setFolderId(note.folderId || '');
      setTags(note.tags.join(', '));
      setStatus(note.status);
    } else {
      setTitle('');
      setContent('');
      setWorkspace('Personal');
      setFolderId('');
      setTags('');
      setStatus('idea');
    }
  }, [note]);

  // Update folder selection when workspace changes
  React.useEffect(() => {
    if (folderId && !workspaceFolders.find(f => f.id === folderId)) {
      setFolderId('');
    }
  }, [workspace, workspaceFolders, folderId]);

  const handleSave = () => {
    const noteData: Partial<Note> = {
      title,
      content,
      type: 'markdown', // Always markdown
      status,
      workspace,
      folderId: folderId || undefined,
      tags: tags.split(', ').filter(tag => tag.trim() !== ''),
      updatedAt: new Date(),
    };

    if (!note) {
      noteData.id = Date.now().toString();
      noteData.createdAt = new Date();
    }

    onSave(noteData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.split(', ').includes(newTag.trim())) {
      setTags(tags + ', ' + newTag.trim());
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.split(', ').filter(tag => tag !== tagToRemove).join(', '));
  };

  const statusOptions = [
    { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'text-blue-600' },
    { value: 'research', label: 'Research', icon: Search, color: 'text-purple-600' },
    { value: 'outline', label: 'Outline', icon: ClipboardList, color: 'text-orange-600' },
    { value: 'draft', label: 'Draft', icon: Edit3, color: 'text-gray-600' },
    { value: 'review', label: 'Review', icon: Eye, color: 'text-indigo-600' },
    { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-600' },
  ];

  const selectedFolder = workspaceFolders.find(f => f.id === folderId);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Create New Note'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full"
            />
          </div>

          <div className="flex items-center gap-2 mb-4">
            <Hash className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Markdown Note</span>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as Note['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className={cn("w-4 h-4", option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Workspace</label>
              <Select value={workspace} onValueChange={setWorkspace}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Folder</label>
              <Select value={folderId} onValueChange={setFolderId}>
                <SelectTrigger>
                  <SelectValue placeholder="No folder">
                    {selectedFolder ? (
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", selectedFolder.color)} />
                        <span>{selectedFolder.name}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">No folder</span>
                    )}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">
                    <div className="flex items-center gap-2">
                      <FolderIcon className="w-4 h-4 text-gray-400" />
                      <span>No folder</span>
                    </div>
                  </SelectItem>
                  {workspaceFolders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <div className="flex items-center gap-2">
                        <div className={cn("w-2 h-2 rounded-full", folder.color)} />
                        <span>{folder.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="use / to for suggestions"
              className="min-h-[300px] resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Supports Markdown syntax: **bold**, *italic*, # headers, - lists, etc.
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.split(', ').filter(tag => tag.trim()).map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button onClick={addTag} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-black hover:bg-gray-800">
              {note ? 'Update Note' : 'Create Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};