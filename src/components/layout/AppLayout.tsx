import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { NoteCard } from '@/components/notes/NoteCard';
import { SearchResults } from '@/components/notes/SearchResults';
import { EditorPage } from '@/components/notes/EditorPage';
import { useNotesStore } from '@/stores/notesStore';
import { useAuth } from '@/contexts/AuthContext';
import { ImageToTextModal } from '@/components/features/ImageToTextModal';
import { useImageToTextStore } from '@/stores/imageToTextStore';
import { FileText, Plus, Loader2, Trash2 } from 'lucide-react';
import { searchNotes } from '@/utils/search';
import { SettingsPage } from '@/components/settings/SettingsPage';
import { ExcelDraw } from '../notes/exceldraw';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export const AppLayout: React.FC = () => {
  const {
    notes,
    deleteNote,
    toggleStarred,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterBy,
    setFilterBy,
    fetchNotes,
    loading: notesLoading,
    reset: resetNotes,
  } = useNotesStore();
  
  const { user } = useAuth();
  const { isOpen: isImageToTextOpen, closeModal: closeImageToText } = useImageToTextStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { noteId } = useParams();
  
  // Get URL search parameters for navigation
  const searchParams = new URLSearchParams(location.search);
  const workspaceParam = searchParams.get('workspace');
  
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Navigation state
  const [navValue, setNavValue] = useState('all');

  // Check if we're in editor mode or settings mode
  const isEditorMode = location.pathname.startsWith('/editor');
  const isSettingsMode = location.pathname === '/settings';
  const isCanvasMode = navValue === 'canvas';

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileSidebarOpen(false);
  }, [location.pathname]);


  // Handle mobile sidebar toggle
  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');
      
      if (isMobileSidebarOpen && 
          sidebar && 
          !sidebar.contains(event.target as Node) &&
          menuButton &&
          !menuButton.contains(event.target as Node)) {
        setIsMobileSidebarOpen(false);
      }
    };

    if (isMobileSidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMobileSidebarOpen]);

  // Toggle sidebar collapse
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };


  useEffect(() => {
    if (!user?.id) {
      resetNotes();
      setInitialDataLoaded(false);
      return;
    }

    fetchNotes(user.id).finally(() => setInitialDataLoaded(true));
  }, [user?.id, fetchNotes, resetNotes]);

  const searchResults = useMemo(
    () => (searchQuery.trim() ? searchNotes(notes, searchQuery) : []),
    [notes, searchQuery]
  );

  // Simplified navigation - no folders
  useEffect(() => {
    if (isSettingsMode) {
      setNavValue('settings');
    }else if(isCanvasMode){
      setNavValue('canvas');
      return;
    }
     else if (workspaceParam) {
      setNavValue(workspaceParam);
    } else {
      setNavValue('all');
    }
  }, [workspaceParam, isSettingsMode,isCanvasMode]);

  const predefinedTags = ['project', 'coding', 'college', 'personal', 'ideas', 'done', 'ongoing', 'future'];

  const filteredNotes = useMemo(() => {
    let filtered = notes;

    switch (navValue) {
      case 'all':
        break;
      case 'today': {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(note => note.updatedAt >= today);
        break;
      }
      case 'starred':
        filtered = filtered.filter(note => note.starred);
        break;
      default:
        if (predefinedTags.includes(navValue)) {
          filtered = filtered.filter(note => note.tags?.includes(navValue));
        }
        break;
    }

    if (filterBy === 'starred') {
      filtered = filtered.filter(note => note.starred);
    }

    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'priority': {
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority || 'low'] || 0;
          const bPriority = priorityOrder[b.priority || 'low'] || 0;
          return bPriority - aPriority;
        }
        case 'recent':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });
  }, [notes, navValue, filterBy, sortBy]);

  const sidebarCounts = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const counts: Record<string, number> = {
      all: notes.length,
      today: 0,
      starred: 0,
    };
    for (const tag of predefinedTags) counts[tag] = 0;

    for (const note of notes) {
      if (note.updatedAt >= today) counts.today++;
      if (note.starred) counts.starred++;
      if (note.tags) {
        for (const tag of note.tags) {
          if (tag in counts) counts[tag]++;
        }
      }
    }

    return counts;
  }, [notes]);

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.trim().length > 0);
  };

  const handleWorkspaceChange = (workspace: string) => {
    // Navigate to appropriate page when sidebar item is clicked
    if (workspace === 'settings') {
      navigate('/settings');
      return;
    }

    if (workspace === 'canvas') {
  setNavValue('canvas');
  return;
}

    
    
    // Navigate to notes view when other sidebar items are clicked
    if (location.pathname.startsWith('/editor') || location.pathname === '/settings') {
      navigate('/notes');
    }

    // Set navigation value
    if (['all', 'today', 'starred','open-canvas'].includes(workspace)) {
      setNavValue(workspace);
    } else if (predefinedTags.includes(workspace)) {
      setNavValue(workspace);
    } else {
      setNavValue('all');
    }

    // Close mobile sidebar after selection
    setIsMobileSidebarOpen(false);
  };

  const handleNewNote = () => {
    navigate('/editor');
    setIsMobileSidebarOpen(false);
  };

  const handleEditNote = (noteId: string) => {
    navigate(`/editor/${noteId}`);
  };

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteNote = () => {
    if (noteToDelete && user?.id) {
      deleteNote(noteToDelete, user.id);
      setDeleteDialogOpen(false);
      setNoteToDelete(null);
    }
  };

  const cancelDeleteNote = () => {
    setDeleteDialogOpen(false);
    setNoteToDelete(null);
  };

  const handleToggleStarred = (noteId: string) => {
    if (user?.id) {
      toggleStarred(noteId, user.id);
    }
  };


  const renderMainContent = () => {
    // Show loading state only if we don't have any data and we're loading
    if (!initialDataLoaded && notesLoading && notes.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-white">Loading your notes...</p>
          </div>
        </div>
      );
    }

    if(isCanvasMode){
      return <ExcelDraw></ExcelDraw>
    }

    if (isSettingsMode) {
      return <SettingsPage />;
    }

    if (isEditorMode) {
      return <EditorPage />;
    }

    if (isSearchMode) {
      return (
        <SearchResults
          results={searchResults}
          onSelectNote={handleEditNote}
          query={searchQuery}
        />
      );
    }

    return (
      <div className="max-w-7xl mx-auto">
        {filteredNotes.length > 0 ? (
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
              : "space-y-4"
          }>
            {filteredNotes.map((note) => (
              <div 
                key={note.id}
                className={viewMode === 'list' ? "max-w-full" : ""}
              >
                <NoteCard
                  note={note}
                  onClick={() => handleEditNote(note.id)}
                  onDelete={() => handleDeleteNote(note.id)}
                  onToggleStarred={() => handleToggleStarred(note.id)}
                  viewMode={viewMode}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16">
            <div className="max-w-md mx-auto px-4">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                {navValue !== 'all' 
                  ? `No ${navValue} notes` 
                  : "No notes yet"}
              </h3>
              <p className="text-gray-500 dark:text-white mb-6 text-sm sm:text-base">
                {navValue !== 'all'
                  ? `You don't have any notes in this section yet.`
                  : "Get started by creating your first note. Use markdown to format your content, add tags, and organize your thoughts."}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleNewNote}
                  className="inline-flex items-center px-6 py-3 bg-[#333333] hover:bg-[#232323] text-white rounded-lg font-medium transition-colors w-full sm:w-auto"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first note
                </button>
                {navValue !== 'all' && (
                  <div className="text-sm">
                    <button
                      onClick={() => {
                        setNavValue('all');
                      }}
                      className="text-gray-500 dark:text-white hover:text-gray-700 dark:hover:text-gray-200"
                    >
                      or view all notes
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-[#fafafa] dark:bg-[#212121] transition-colors duration-200 relative">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" />
      )}

      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          selectedWorkspace={navValue}
          onWorkspaceChange={handleWorkspaceChange}
          onNewNote={handleNewNote}
          noteCount={filteredNotes.length}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={toggleSidebarCollapse}
          sidebarCounts={sidebarCounts}
        />
      </div>

      {/* Mobile Sidebar */}
      <div 
        id="mobile-sidebar"
        className={`fixed left-0 top-0 h-full z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar
          selectedWorkspace={navValue}
          onWorkspaceChange={handleWorkspaceChange}
          onNewNote={handleNewNote}
          noteCount={filteredNotes.length}
          sidebarCounts={sidebarCounts}
        />
      </div>
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterBy={filterBy}
          onFilterChange={setFilterBy}
          onNewNote={handleNewNote}
          searchInputRef={searchInputRef}
          isEditorMode={isEditorMode}
          noteId={noteId}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          currentWorkspace={navValue}
          onMobileMenuToggle={toggleMobileSidebar}
        />
        
        <main className={`flex-1 overflow-y-auto bg-[#fafafa] dark:bg-[#212121] transition-colors duration-200 w-full ${isEditorMode ? 'p-0' : 'p-4 sm:p-6'}`}>
          <div className={isEditorMode ? "w-full h-full" : ""}>
            {renderMainContent()}
          </div>
        </main>
      </div>


      {/* Image to Text Sidebar */}
      <ImageToTextModal
        isOpen={isImageToTextOpen}
        onClose={closeImageToText}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={cancelDeleteNote}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-red-600" />
              Delete Note
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>"{noteToDelete ? notes.find(n => n.id === noteToDelete)?.title || 'this note' : 'this note'}"</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDeleteNote}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteNote}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}; 