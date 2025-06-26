import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

import { 
  Plus, 
  Search,
  ArrowLeft,
  Hash,
  Flag,
  Folder,
  Tag,
  X,
  Download,
  FileText as FileTextIcon,
  Lightbulb, 
  ClipboardList, 
  Edit3, 
  Eye, 
  CheckCircle,
  Grid3X3,
  List
} from 'lucide-react';
import { FontSelector } from '@/components/ui/font-selector';
import { Badge } from '@/components/ui/badge';
import { useNotesStore } from '@/stores/notesStore';
import { useEditorStore } from '@/stores/editorStore';
import { 
  exportNotesAsJSON, 
  exportAllNotesAsMarkdown,
  exportNoteAsMarkdown,
  exportNoteAsPDF,
  exportNoteAsText
} from '@/utils/export';
import { 
  importFromJSON, 
  importFromMarkdown, 
  importFromMarkdownZip,
  importFromText 
} from '@/utils/import';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: 'recent' | 'alphabetical' | 'status';
  onSortChange: (sort: 'recent' | 'alphabetical' | 'status') => void;
  filterBy: 'all' | 'ideas' | 'drafts' | 'review' | 'done';
  onFilterChange: (filter: 'all' | 'ideas' | 'drafts' | 'review' | 'done') => void;
  onNewNote: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  isEditorMode?: boolean;
  noteId?: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  onNewNote,
  searchInputRef,
  isEditorMode = false,
  noteId,
  viewMode = 'grid',
  onViewModeChange
}) => {
  const { notes, addNote, getNoteById } = useNotesStore();
  const { 
    title: editorTitle,
    content: editorContent,
    status: editorStatus, 
    tags: editorTags, 
    fontFamily: editorFontFamily,
    setStatus: setEditorStatus,
    setTags: setEditorTags,
    setFontFamily: setEditorFontFamily,
    addTag: addEditorTag,
    removeTag: removeEditorTag
  } = useEditorStore();
  
  const [exportValue, setExportValue] = React.useState("export");
  const [newTag, setNewTag] = React.useState('');
  
  // Editor mode state
  const navigate = useNavigate();
  const currentNote = noteId ? getNoteById(noteId) : null;

  const handleBackToNotes = () => {
    navigate('/notes');
  };

  const handleAddTag = () => {
    if (newTag.trim()) {
      addEditorTag(newTag.trim());
      setNewTag('');
    }
  };

  const statusOptions = [
    { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400' },
    { value: 'research', label: 'Research', icon: Search, color: 'text-purple-600 dark:text-purple-400' },
    { value: 'outline', label: 'Outline', icon: ClipboardList, color: 'text-orange-600 dark:text-orange-400' },
    { value: 'draft', label: 'Draft', icon: Edit3, color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'review', label: 'Review', icon: Eye, color: 'text-indigo-600 dark:text-indigo-400' },
    { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
  ];

  // Export functions
  const handleExportJSON = () => {
    exportNotesAsJSON(notes);
  };

  const handleExportMarkdown = async () => {
    await exportAllNotesAsMarkdown(notes);
  };

  // Import functions
  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      for (const file of Array.from(files)) {
        if (file.name.endsWith('.json')) {
          const importedNotes = await importFromJSON(file);
          importedNotes.forEach(noteData => addNote(noteData));
        } else if (file.name.endsWith('.md')) {
          const noteData = await importFromMarkdown(file);
          addNote(noteData);
        } else if (file.name.endsWith('.zip')) {
          const importedNotes = await importFromMarkdownZip(file);
          importedNotes.forEach(noteData => addNote(noteData));
        } else if (file.name.endsWith('.txt')) {
          const noteData = await importFromText(file);
          addNote(noteData);
        }
      }
      alert(`Successfully imported ${files.length} file(s)!`);
    } catch (error) {
      console.error('Import error:', error);
      alert('Failed to import files. Please check the file format and try again.');
    }

    // Reset file input
    event.target.value = '';
  };

  const sortOptions = [
    { value: 'recent', label: 'Recent' },
    { value: 'alphabetical', label: 'Alphabetical' },
    { value: 'status', label: 'Status' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Notes' },
    { value: 'ideas', label: 'Ideas' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

  if (isEditorMode) {
    return (
      <header className="bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 px-6 py-3 transition-colors duration-200">
        <div className="flex items-center justify-between">
          {/* Left Side - Back and Note Info */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleBackToNotes}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Notes
            </button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            
            <div className="flex items-center gap-2">
              <Hash className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {currentNote ? 'Edit Note' : 'New Note'}
              </span>
            </div>
          </div>

          {/* Right Side - Editor Controls */}
          <div className="flex items-center gap-3">
            {/* Status */}
            <Select value={editorStatus} onValueChange={(value) => setEditorStatus(value as any)}>
              <SelectTrigger className="w-28 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <option.icon className={cn("w-3 h-3", option.color)} />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Removed workspace selector - simplified structure */}

            {/* Font */}
            <FontSelector 
              currentFont={editorFontFamily} 
              onFontChange={setEditorFontFamily}
            />

            {/* Tags */}
            <div className="flex items-center gap-2">
              {editorTags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button
                    onClick={() => removeEditorTag(tag)}
                    className="ml-1 hover:text-red-600"
                  >
                    <X className="w-2 h-2" />
                  </button>
                </Badge>
              ))}
              {editorTags.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{editorTags.length - 2}
                </Badge>
              )}
              <div className="flex items-center gap-1">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add tag..."
                  className="w-20 h-8 text-xs"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                />
                <button
                  onClick={handleAddTag}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Export */}
            {currentNote && (
              <Select value="export" onValueChange={(value) => {
                if (value === "pdf") {
                  exportNoteAsPDF(currentNote || { title: editorTitle, content: editorContent } as any, editorTitle, editorContent);
                } else if (value === "txt") {
                  exportNoteAsText(currentNote || { title: editorTitle, content: editorContent } as any, editorTitle, editorContent);
                }
              }}>
                <SelectTrigger className="w-20 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="export">
                    Export
                  </SelectItem>
                  <SelectItem value="txt">
                    Export as Text
                  </SelectItem>
                  <SelectItem value="pdf">
                    Export as PDF
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white dark:bg-[#171717] border-b border-gray-200 dark:border-gray-800 px-6 py-3 transition-colors duration-200">
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
          <Input
            ref={searchInputRef}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-9 text-sm"
          />
        </div>

        {/* Sort Dropdown */}
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="w-24 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Dropdown */}
        <Select value={filterBy} onValueChange={onFilterChange}>
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {filterOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Export Dropdown */}
        <Select value={exportValue} onValueChange={(value) => {
          if (value === "json") {
            handleExportJSON();
          } else if (value === "markdown") {
            handleExportMarkdown();
          } else if (value === "import") {
            // Import will be handled by the file input
            const fileInput = document.querySelector('#import-file-input') as HTMLInputElement;
            fileInput?.click();
          }
          // Reset to default value
          setExportValue("export");
        }}>
          <SelectTrigger className="w-24 h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="export">
              Export
            </SelectItem>
            <SelectItem value="json">
              Export as JSON
            </SelectItem>
            <SelectItem value="markdown">
              Export as Markdown (ZIP)
            </SelectItem>
            <SelectItem value="import">
              Import Files
            </SelectItem>
          </SelectContent>
        </Select>
        
        {/* Hidden file input for import */}
        <input
          id="import-file-input"
          type="file"
          multiple
          accept=".json,.md,.txt,.zip"
          onChange={handleFileImport}
          className="hidden"
        />

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-3">
          {/* View Toggle Buttons */}
          {onViewModeChange && (
            <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
              <Button
                onClick={() => onViewModeChange('grid')}
                size="sm"
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                className={cn(
                  "h-8 px-3 rounded-r-none border-r border-gray-200 dark:border-gray-700",
                  viewMode === 'grid' 
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                onClick={() => onViewModeChange('list')}
                size="sm"
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                className={cn(
                  "h-8 px-3 rounded-l-none",
                  viewMode === 'list' 
                    ? "bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900" 
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                )}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          )}
          
          {/* New Note Button */}
          <Button 
            onClick={onNewNote}
            size="sm"
            className="h-9 bg-[#333333] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>
    </header>
  );
};