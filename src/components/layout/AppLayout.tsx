import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { NoteCard } from '@/components/notes/NoteCard';
import { SearchResults } from '@/components/notes/SearchResults';
import { EditorPage } from '@/components/notes/EditorPage';
import { useNotesStore } from '@/stores/notesStore';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, Loader2 } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { searchNotes } from '@/utils/search';
import { SettingsPage } from '@/components/settings/SettingsPage';

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
    loading: notesLoading
  } = useNotesStore();
  
  // No folders - simplified notes app

  const { user } = useAuth();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { noteId } = useParams();
  
  // Get URL search parameters for navigation
  const searchParams = new URLSearchParams(location.search);
  const workspaceParam = searchParams.get('workspace');
  
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Navigation type state
  const [navType, setNavType] = useState<'workspace' | 'special' | 'type' | 'folder'>('workspace');
  const [navValue, setNavValue] = useState('all');

  // Check if we're in editor mode or settings mode
  const isEditorMode = location.pathname.startsWith('/editor');
  const isSettingsMode = location.pathname === '/settings';

  // Expose debugging functions globally (temporary) - after state declarations
  React.useEffect(() => {
    (window as any).debugNotes = () => {
      console.log('=== DEBUG INFO ===');
      console.log('Notes count:', notes.length);
      console.log('Current navigation:', { navType, selectedFolder });
      console.log('==================');
    };
    return () => {
      delete (window as any).debugNotes;
    };
  }, [notes, navType, selectedFolder]);

  // Fetch data when component mounts or user changes
  useEffect(() => {
    const loadData = async () => {
      if (user && !initialDataLoaded) {
        console.log('AppLayout - Starting data fetch for user:', user.email);
        try {
          await fetchNotes();
          console.log('AppLayout - Notes fetched:', notes.length);
          setInitialDataLoaded(true);
        } catch (error) {
          console.error('Error loading initial data:', error);
        }
      } else if (!user) {
        console.log('AppLayout - No user, skipping data fetch');
      } else if (initialDataLoaded) {
        console.log('AppLayout - Data already loaded, skipping fetch');
      }
    };

    loadData();
  }, [user, fetchNotes, initialDataLoaded]);

  // Debug: Log current data state
  useEffect(() => {
    console.log('AppLayout - Current notes count:', notes.length);
    console.log('AppLayout - Notes loading:', notesLoading);
    console.log('AppLayout - Initial data loaded:', initialDataLoaded);
  }, [notes, notesLoading, initialDataLoaded]);

  // Reset initial data loaded when user changes
  useEffect(() => {
    setInitialDataLoaded(false);
  }, [user]);

  // Enhanced search functionality
  const searchResults = searchQuery.trim() ? searchNotes(notes, searchQuery) : [];

  // Simplified navigation - no folders
  useEffect(() => {
    if (isSettingsMode) {
      setNavType('special');
      setNavValue('settings');
      setSelectedFolder('');
    } else if (workspaceParam) {
      setNavType('special');
      setNavValue(workspaceParam);
      setSelectedFolder('');
    } else {
      setNavType('special');
      setNavValue('all');
      setSelectedFolder('');
    }
  }, [workspaceParam, isSettingsMode]);

  // Predefined tags for filtering - unified system
  const predefinedTags = ['project', 'coding', 'college', 'personal', 'ideas', 'done', 'ongoing', 'future'];

  // Filter and sort notes for normal view
  const getFilteredNotes = () => {
    let filtered = notes;

    // Apply navigation-based filtering - simplified
    switch (navValue) {
      case 'all':
        // Show all notes - no filtering needed
        break;
      case 'today':
        // Show notes updated today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        filtered = filtered.filter(note => note.updatedAt >= today);
        break;
      case 'starred':
        filtered = filtered.filter(note => note.starred);
        break;
      default:
        // Check if it's a tag filter
        if (predefinedTags.includes(navValue)) {
          filtered = filtered.filter(note => 
            note.tags && note.tags.includes(navValue)
          );
        }
        break;
    }

    // Apply additional filter from header
    if (filterBy === 'starred') {
      filtered = filtered.filter(note => note.starred);
    }

    const sortedNotes = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'priority':
          // Sort by priority (high, medium, low, none)
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          const aPriority = priorityOrder[a.priority || 'low'] || 0;
          const bPriority = priorityOrder[b.priority || 'low'] || 0;
          return bPriority - aPriority;
        case 'recent':
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime();
      }
    });

    return sortedNotes;
  };

  const filteredNotes = getFilteredNotes();

  // Calculate note counts for sidebar
  const getSidebarCounts = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return {
      all: notes.length,
      today: notes.filter(note => note.updatedAt >= today).length,
      starred: notes.filter(note => note.starred).length,
      project: notes.filter(note => note.tags && note.tags.includes('project')).length,
      coding: notes.filter(note => note.tags && note.tags.includes('coding')).length,
      college: notes.filter(note => note.tags && note.tags.includes('college')).length,
      personal: notes.filter(note => note.tags && note.tags.includes('personal')).length,
      ideas: notes.filter(note => note.tags && note.tags.includes('ideas')).length,
      done: notes.filter(note => note.tags && note.tags.includes('done')).length,
      ongoing: notes.filter(note => note.tags && note.tags.includes('ongoing')).length,
      future: notes.filter(note => note.tags && note.tags.includes('future')).length,
    };
  };

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
    
    // Navigate to notes view when other sidebar items are clicked
    if (location.pathname.startsWith('/editor') || location.pathname === '/settings') {
      navigate('/notes');
    }

    // Clear folder selection when changing navigation
    setSelectedFolder('');

    // Determine navigation type and value
    if (['all', 'today', 'starred'].includes(workspace)) {
      setNavType('special');
      setNavValue(workspace);
    } else if (predefinedTags.includes(workspace)) {
      setNavType('special');
      setNavValue(workspace);
    } else {
      setNavType('special');
      setNavValue('all');
    }
  };

  const handleNewNote = () => {
    console.log('handleNewNote - Creating new note');
    navigate('/editor');
  };

  const handleEditNote = (noteId: string) => {
    navigate(`/editor/${noteId}`);
  };

  const handleDeleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      deleteNote(noteId);
    }
  };

  const handleToggleStarred = (noteId: string) => {
    toggleStarred(noteId);
  };

  useKeyboardShortcuts({
    onNewNote: handleNewNote,
    onSearch: () => searchInputRef.current?.focus(),
  });

  const renderMainContent = () => {
    // Show loading state while initial data is being fetched
    if (!initialDataLoaded && notesLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 dark:text-gray-400">Loading your notes...</p>
          </div>
        </div>
      );
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
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
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
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {navValue !== 'all' 
                  ? `No ${navValue} notes` 
                  : "No notes yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {navValue !== 'all'
                  ? `You don't have any notes in this section yet.`
                  : "Get started by creating your first note. Use markdown to format your content, add tags, and organize your thoughts."}
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleNewNote}
                  className="inline-flex items-center px-6 py-3 bg-[#333333] hover:bg-[#404040] text-white rounded-lg font-medium transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create your first note
                </button>
                {navValue !== 'all' && (
                  <div className="text-sm">
                    <button
                      onClick={() => {
                        setNavType('special');
                        setNavValue('all');
                        setSelectedFolder('');
                      }}
                      className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
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
    <div className="flex h-screen bg-gray-50 dark:bg-[#171717] transition-colors duration-200 overflow-hidden">
      <div className="flex-shrink-0 sticky top-0 h-screen">
        <Sidebar
          selectedWorkspace={navValue}
          onWorkspaceChange={handleWorkspaceChange}
          onNewNote={handleNewNote}
          noteCount={filteredNotes.length}
          sidebarCounts={getSidebarCounts()}
        />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
        />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#171717] transition-colors duration-200 w-full max-w-full">
          <div className={isEditorMode ? "w-full max-w-full h-full" : ""}>
            {renderMainContent()}
          </div>
        </main>
      </div>
    </div>
  );
}; 