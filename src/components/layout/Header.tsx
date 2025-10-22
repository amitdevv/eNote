import React from 'react';
import { Button } from '@/components/ui/button';


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
  User,
  Rocket,
  Code,
  GraduationCap,
  Menu,
  Grid3X3,
  List,
  Filter,
  SortDesc,
} from 'lucide-react';
import { FontSelector } from '@/components/ui/font-selector';
import { FontSizeSelector } from '@/components/ui/font-size-selector';

import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '@/stores/editorStore';
import { cn } from '@/lib/utils';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: "recent" | "alphabetical" | "priority";
  onSortChange: (sortBy: "recent" | "alphabetical" | "priority") => void;
  filterBy: "all" | "starred";
  onFilterChange: (filterBy: "all" | "starred") => void;
  onNewNote: () => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  isEditorMode: boolean;
  noteId?: string;
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
  currentWorkspace: string;
  onMobileMenuToggle?: () => void;
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
  isEditorMode,
  noteId,
  viewMode,
  onViewModeChange,
  currentWorkspace,
  onMobileMenuToggle,
}) => {
  const { 
    tags: editorTags, 
    fontFamily: editorFontFamily,
    fontSize: editorFontSize,
    setFontFamily: setEditorFontFamily,
    setFontSize: setEditorFontSize,
    addTag: addEditorTag,
    removeTag: removeEditorTag
  } = useEditorStore();
  
  const [isMobileSearchOpen, setIsMobileSearchOpen] = React.useState(false);
  
  // Close mobile search when switching to editor mode
  React.useEffect(() => {
    if (isEditorMode) {
      setIsMobileSearchOpen(false);
    }
  }, [isEditorMode]);
  
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



  if (isEditorMode) {
    return (
      <header className="bg-transparent dark:bg-[#212121] px-6 py-3 transition-colors duration-200">
        <div className="flex items-center justify-between">
          {/* Left Side - Logo, Back and Note Info */}
          <div className="flex items-center gap-4">
            
            
            <button
              type="button"
              onClick={handleBackToNotes}
              className="flex items-center gap-2 text-gray-600 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>

          {/* Right Side - Editor Controls */}
          <div className="flex items-center gap-3">
           

            {/* Tags System - Select Multiple from 8 Predefined Tags */}
            <div className="flex items-center gap-2">
              {/* Tags Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="w-40 h-8 text-xs justify-between bg-white dark:bg-[#333333] text-gray-900 dark:text-white border-0 focus:outline-none focus:ring-0">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3 h-3 text-gray-500 dark:text-white" />
                      Add Tags
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-300">
                      {editorTags.length > 0 ? `(${editorTags.length})` : ''}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48 bg-white dark:bg-[#333333] border-0">
                  <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600">
                    Click to add/remove tags:
                  </div>
                  {predefinedTags.map((tag) => (
                    <DropdownMenuItem 
                      key={tag.id} 
                      onClick={() => handlePredefinedTagClick(tag.id)}
                      className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none focus:ring-0"
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
              

            </div>
             {/* Font Controls */}
             <FontSelector 
              currentFont={editorFontFamily} 
              onFontChange={setEditorFontFamily}
            />
            
            <FontSizeSelector 
              currentSize={editorFontSize} 
              onSizeChange={setEditorFontSize}
            />

          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-transparent dark:bg-[#212121] px-4 sm:px-6 py-3 sm:py-4 transition-colors duration-200 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left Section - Mobile Menu + Title */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {/* Mobile Menu Button */}
          {onMobileMenuToggle && (
            <button
              type="button"
              id="mobile-menu-button"
              onClick={onMobileMenuToggle}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none"
              aria-label="Toggle menu"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-white" />
            </button>
          )}
          
          {/* Logo and Title/Breadcrumb - Responsive */}
          <div className="flex items-center space-x-3">
            
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
              {isEditorMode ? (
                <span className="hidden sm:inline">
                  {noteId ? 'Edit Note' : 'New Note'}
                </span>
              ) : (
                <span className="capitalize">
                  {currentWorkspace === 'all' ? 'All Notes' : currentWorkspace}
                </span>
              )}
            </h1>
          </div>
        </div>

        {/* Center Section - Search (Hidden on small mobile) */}
        {!isEditorMode && (
          <div className="hidden sm:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="search-input w-full pl-10 pr-4 py-2 text-sm border-0 rounded-lg bg-[#f5f5f5] dark:bg-[#333333] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:ring-0 focus:border-none"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right Section - Actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Mobile Search Toggle */}
          {!isEditorMode && (
            <button 
              type="button"
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="sm:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none"
            >
              {isMobileSearchOpen ? (
                <X className="w-5 h-5 text-gray-600 dark:text-white" />
              ) : (
                <Search className="w-5 h-5 text-gray-600 dark:text-white" />
              )}
            </button>
          )}

          {/* Mobile View Mode Toggle */}
          {!isEditorMode && (
            <div className="sm:hidden flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1">
              <button
                type="button"
                onClick={() => onViewModeChange('grid')}
                className={cn(
                  "p-1 rounded focus:outline-none",
                  viewMode === 'grid' 
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" 
                    : "text-gray-500 dark:text-white"
                )}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onViewModeChange('list')}
                className={cn(
                  "p-1 rounded focus:outline-none",
                  viewMode === 'list' 
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" 
                    : "text-gray-500 dark:text-white"
                )}
                title="List view"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
          

          {/* New Note Button - Always visible, different sizes */}
          <Button 
            onClick={onNewNote}
            size="sm"
            className="bg-[#333333] hover:bg-[#232323] text-white px-3 sm:px-4 py-2 text-sm font-medium min-h-[36px] sm:min-h-[40px]"
          >
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">New Note</span>
          </Button>

          {/* Additional controls for larger screens */}
          {!isEditorMode && (
            <div className="hidden md:flex items-center space-x-2">
              {/* View Mode Toggle */}
              <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-lg p-1">
                <button
                  type="button"
                  onClick={() => onViewModeChange('grid')}
                  className={cn(
                    "p-1.5 rounded focus:outline-none",
                    viewMode === 'grid' 
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                  )}
                  title="Grid view"
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onViewModeChange('list')}
                  className={cn(
                    "p-1.5 rounded focus:outline-none",
                    viewMode === 'list' 
                      ? "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white" 
                      : "text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                  )}
                  title="List view"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="w-32 h-9 focus:outline-none focus:ring-0 border-0 bg-white dark:bg-[#333333] text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <SortDesc className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#333333] border-0">
                  <SelectItem value="recent" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none focus:ring-0">Recent</SelectItem>
                  <SelectItem value="alphabetical" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none focus:ring-0">A-Z</SelectItem>
                  <SelectItem value="priority" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none focus:ring-0">Priority</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Dropdown */}
              <Select value={filterBy} onValueChange={onFilterChange}>
                <SelectTrigger className="w-28 h-9 focus:outline-none focus:ring-0 border-0 bg-white dark:bg-[#333333] text-gray-900 dark:text-white">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    <SelectValue />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-[#333333] border-0">
                  <SelectItem value="all" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none focus:ring-0">All</SelectItem>
                  <SelectItem value="starred" className="text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-[#232323] focus:outline-none focus:ring-0">Starred</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar (when toggled) */}
      {!isEditorMode && isMobileSearchOpen && (
        <div className="sm:hidden mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="search-input w-full pl-10 pr-4 py-2.5 text-sm border-none rounded-lg bg-gray-50 dark:bg-[#171717] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-300 focus:outline-none focus:ring-0 focus:border-none"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};