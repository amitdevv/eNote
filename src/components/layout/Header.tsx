import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FontSelector } from '@/components/ui/font-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  ChevronDown, 
  Search,
  Download,
  Upload,
  FileText,
  Download as DownloadIcon
} from 'lucide-react';
import { useNotes } from '@/contexts/NotesContext';
import { 
  exportNotesAsJSON, 
  exportAllNotesAsMarkdown,
} from '@/utils/export';
import { 
  importFromJSON, 
  importFromMarkdown, 
  importFromMarkdownZip,
  importFromText 
} from '@/utils/import';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  sortBy: 'recent' | 'alphabetical' | 'status' | 'workspace';
  onSortChange: (sort: 'recent' | 'alphabetical' | 'status' | 'workspace') => void;
  filterBy: 'all' | 'ideas' | 'drafts' | 'review' | 'done';
  onFilterChange: (filter: 'all' | 'ideas' | 'drafts' | 'review' | 'done') => void;
  onNewNote: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterBy,
  onFilterChange,
  onNewNote,
  searchInputRef
}) => {
  const { notes, addNote } = useNotes();
  const [selectedFont, setSelectedFont] = React.useState('Inter');

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
    { value: 'workspace', label: 'Workspace' },
  ];

  const filterOptions = [
    { value: 'all', label: 'All Notes' },
    { value: 'ideas', label: 'Ideas' },
    { value: 'drafts', label: 'Drafts' },
    { value: 'review', label: 'Review' },
    { value: 'done', label: 'Done' },
  ];

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-9 text-sm">
              <DownloadIcon className="w-4 h-4 mr-1" />
              Export
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem onClick={handleExportJSON}>
              <FileText className="w-4 h-4 mr-2" />
              Export as JSON
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleExportMarkdown}>
              <Download className="w-4 h-4 mr-2" />
              Export as Markdown (ZIP)
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <label className="cursor-pointer flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Import Files
                <input
                  type="file"
                  multiple
                  accept=".json,.md,.txt,.zip"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Spacer */}
        <div className="flex-1"></div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-3">
          {/* Font Selector */}
          <div className="flex items-center gap-1">
            <FontSelector 
              currentFont={selectedFont} 
              onFontChange={setSelectedFont}
            />
           
          </div>

          {/* New Note Button */}
          <Button 
            onClick={onNewNote}
            size="sm"
            className="h-9 bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>
      </div>
    </header>
  );
};