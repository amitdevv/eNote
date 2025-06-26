import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';


import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

import { 
  Plus, 
  Search,
  ArrowLeft,
  Hash,
  X,
  Lightbulb, 
  ClipboardList, 
  Eye, 
  CheckCircle,
  Grid3X3,
  List,
  LogOut,
  User,
  Rocket,
  Code,
  GraduationCap,
  Settings
} from 'lucide-react';
import { FontSelector } from '@/components/ui/font-selector';
import { Badge } from '@/components/ui/badge';
import { useNotesStore } from '@/stores/notesStore';
import { useEditorStore } from '@/stores/editorStore';
import { useAuth } from '@/contexts/AuthContext';
import { 
  exportNotesAsJSON, 
  exportAllNotesAsMarkdown,
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
  sortBy: 'recent' | 'alphabetical' | 'priority';
  onSortChange: (sort: 'recent' | 'alphabetical' | 'priority') => void;
  filterBy: 'all' | 'starred';
  onFilterChange: (filter: 'all' | 'starred') => void;
  onNewNote: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  isEditorMode?: boolean;
  noteId?: string;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  currentWorkspace?: string;
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
  onViewModeChange,
  currentWorkspace = 'all'
}) => {
  const { notes, addNote, getNoteById } = useNotesStore();
  const { 
    title: editorTitle,
    content: editorContent,
    tags: editorTags, 
    fontFamily: editorFontFamily,
    setFontFamily: setEditorFontFamily,
    addTag: addEditorTag,
    removeTag: removeEditorTag
  } = useEditorStore();
  
  const { user, signOut } = useAuth();
  
  const [exportValue, setExportValue] = React.useState("export");
  
  // Unified tags system - 8 predefined tags only
  const predefinedTags = [
    // Category tags
    { id: 'project', label: 'Project', icon: Rocket, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'coding', label: 'Coding', icon: Code, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'college', label: 'College', icon: GraduationCap, color: 'text-green-600 dark:text-green-400' },
    { id: 'personal', label: 'Personal', icon: User, color: 'text-orange-600 dark:text-orange-400' },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-600 dark:text-yellow-400' },
    // Status tags
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
    { id: 'ongoing', label: 'Ongoing', icon: ClipboardList, color: 'text-orange-600 dark:text-orange-400' },
    { id: 'future', label: 'Future', icon: Eye, color: 'text-indigo-600 dark:text-indigo-400' },
  ];
  
  // Editor mode state
  const navigate = useNavigate();
  const currentNote = noteId ? getNoteById(noteId) : null;

  const handleBackToNotes = () => {
    navigate('/notes');
  };

  const handlePredefinedTagClick = (tagId: string) => {
    if (editorTags.includes(tagId)) {
      removeEditorTag(tagId);
    } else {
      addEditorTag(tagId);
    }
  };

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
    { value: 'priority', label: 'Priority' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Notes' },
    { value: 'starred', label: 'Starred' },
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
            {/* Font */}
            <FontSelector 
              currentFont={editorFontFamily} 
              onFontChange={setEditorFontFamily}
            />

            {/* Tags System - Select Multiple from 8 Predefined Tags */}
            <div className="flex items-center gap-2">
              {/* Tags Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40 h-8 text-xs justify-between">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                      Add Tags
                    </div>
                    <span className="text-xs text-gray-400">
                      {editorTags.length > 0 ? `(${editorTags.length})` : ''}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  <div className="px-2 py-1 text-xs text-gray-500 border-b">
                    Click to add/remove tags:
                  </div>
                  {predefinedTags.map((tag) => (
                    <DropdownMenuItem 
                      key={tag.id} 
                      onClick={() => handlePredefinedTagClick(tag.id)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-center gap-2 w-full">
                        <tag.icon className={cn("w-3 h-3", tag.color)} />
                        <span>{tag.label}</span>
                        {editorTags.includes(tag.id) && (
                          <CheckCircle className="w-3 h-3 text-green-500 ml-auto" />
                        )}
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* Current Tags Display */}
              {editorTags.length > 0 && (
                <div className="flex items-center gap-1 max-w-sm overflow-x-auto">
                  {editorTags.map((tag) => {
                    const predefinedTag = predefinedTags.find(pt => pt.id === tag);
                    return (
                      <Badge key={tag} variant="secondary" className="text-xs flex items-center gap-1 flex-shrink-0">
                        {predefinedTag && <predefinedTag.icon className="w-2 h-2" />}
                        {tag}
                        <button
                          onClick={() => removeEditorTag(tag)}
                          className="ml-1 hover:text-red-600"
                        >
                          <X className="w-2 h-2" />
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              )}
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

            {/* User Profile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || user?.email} />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem className="flex flex-col items-start p-3">
                  <div className="font-medium text-sm">
                    {user?.user_metadata?.full_name || 'User'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

        {/* Tags Filter Dropdown */}
        <Select 
          value={predefinedTags.some(tag => tag.id === currentWorkspace) ? currentWorkspace : "tags"} 
          onValueChange={(value) => {
            if (value !== "tags") {
              // Navigate to tag filter
              window.location.href = `/notes?workspace=${value}`;
            }
          }}
        >
          <SelectTrigger className="w-28 h-9 text-sm">
            <SelectValue placeholder="Tags" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tags">
              <div className="flex items-center gap-2">
                <Hash className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                All Tags
              </div>
            </SelectItem>
            {predefinedTags.map((tag) => (
              <SelectItem key={tag.id} value={tag.id}>
                <div className="flex items-center gap-2">
                  <tag.icon className={cn("w-3 h-3", tag.color)} />
                  {tag.label}
                </div>
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

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 rounded-full">
                <Avatar className="h-7 w-7">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name || user?.email} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem className="flex flex-col items-start p-3">
                <div className="font-medium text-sm">
                  {user?.user_metadata?.full_name || 'User'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {user?.email}
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => navigate('/settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={() => signOut()}
                className="text-red-600 dark:text-red-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};