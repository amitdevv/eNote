import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { NoteCard } from '@/components/notes/NoteCard';
import { SearchResults } from '@/components/notes/SearchResults';
import { EditorPage } from '@/components/notes/EditorPage';
import { useNotesStore } from '@/stores/notesStore';
import { useFoldersStore } from '@/stores/foldersStore';
import { FileText, Plus } from 'lucide-react';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { searchNotes } from '@/utils/search';

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
    setFilterBy
  } = useNotesStore();
  
  const { folders, updateFolderNoteCounts, getFolderById } = useFoldersStore();
  
  const navigate = useNavigate();
  const location = useLocation();
  const { noteId } = useParams();
  
  // Get URL search parameters for navigation
  const searchParams = new URLSearchParams(location.search);
  const workspaceParam = searchParams.get('workspace');
  const folderParam = searchParams.get('folder');
  
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Navigation type state
  const [navType, setNavType] = useState<'workspace' | 'special' | 'type' | 'folder'>('workspace');
  const [navValue, setNavValue] = useState('all');

  // Check if we're in editor mode
  const isEditorMode = location.pathname.startsWith('/editor');

  // Enhanced search functionality
  const searchResults = searchQuery.trim() ? searchNotes(notes, searchQuery) : [];

  // Update folder note counts when notes change
  useEffect(() => {
    const folderNoteCounts: Record<string, number> = {};
    
    notes.forEach(note => {
      if (note.folderId) {
        folderNoteCounts[note.folderId] = (folderNoteCounts[note.folderId] || 0) + 1;
      }
    });
    
    updateFolderNoteCounts(folderNoteCounts);
  }, [notes, updateFolderNoteCounts]);

  // Handle URL parameters for navigation
  useEffect(() => {
    if (folderParam) {
      // Navigate to specific folder
      const folder = getFolderById(folderParam);
      if (folder) {
        setNavType('folder');
        setSelectedFolder(folderParam);
        setSelectedWorkspace(folder.workspace);
        setNavValue(folder.workspace);
      }
    } else if (workspaceParam) {
      // Navigate to specific workspace
      setNavType('workspace');
      setNavValue(workspaceParam);
      setSelectedWorkspace(workspaceParam);
      setSelectedFolder('');
    }
  }, [folderParam, workspaceParam, getFolderById]);

  // Filter and sort notes for normal view
  const getFilteredNotes = () => {
    let filtered = notes;

    // Apply navigation-based filtering
    if (navType === 'folder') {
      // Filter by selected folder
      filtered = filtered.filter(note => note.folderId === selectedFolder);
    } else if (navType === 'special') {
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
      }
    }

    // Apply additional status filter from header
    if (filterBy !== 'all') {
      const statusMap = {
        'ideas': 'idea',
        'drafts': 'draft', 
        'review': 'review',
        'done': 'done'
      };
      filtered = filtered.filter(note => note.status === statusMap[filterBy]);
    }

    const sortedNotes = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'status':
          return a.status.localeCompare(b.status);
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
      todo: 0, // Legacy - no todo notes anymore
      markdown: notes.filter(note => note.type === 'markdown').length,
      code: 0, // Legacy - no code notes anymore
    };
  };

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.trim().length > 0);
  };

  const handleWorkspaceChange = (workspace: string) => {
    // Navigate to notes view when sidebar item is clicked
    if (location.pathname.startsWith('/editor')) {
      navigate('/notes');
    }

    // Clear folder selection when changing navigation
    setSelectedFolder('');

    // Determine navigation type and value
    if (['all', 'today', 'starred'].includes(workspace)) {
      setNavType('special');
      setNavValue(workspace);
      setSelectedWorkspace('all');
    } else {
      setNavType('special');
      setNavValue('all');
      setSelectedWorkspace('all');
    }
  };

  const handleFolderSelect = (folderId: string) => {
    // Navigate to notes view when folder is selected
    if (location.pathname.startsWith('/editor')) {
      navigate('/notes');
    }

    setNavType('folder');
    setSelectedFolder(folderId);
    
    // Set workspace based on folder's workspace
    const folder = getFolderById(folderId);
    if (folder) {
      setSelectedWorkspace(folder.workspace);
      setNavValue(folder.workspace);
    }
  };

  const handleNewNote = () => {
    // Build URL with current context for auto-assigning folder
    let url = '/editor';
    const params = new URLSearchParams();
    
    if (navType === 'folder' && selectedFolder) {
      params.set('folderId', selectedFolder);
    }
    
    if (params.toString()) {
      url += '?' + params.toString();
    }
    
    navigate(url);
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
                {navType === 'folder' 
                  ? `No notes in "${getFolderById(selectedFolder)?.name || 'Unknown Folder'}"` 
                  : navType === 'special' && navValue !== 'all' 
                  ? `No ${navValue} notes` 
                  : "No notes yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {navType === 'folder' || (navType === 'special' && navValue !== 'all')
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
                {(navType === 'folder' || (navType === 'special' && navValue !== 'all')) && (
                  <div className="text-sm">
                    <button
                      onClick={() => {
                        setNavType('special');
                        setNavValue('all');
                        setSelectedWorkspace('all');
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
    <div className="flex h-screen bg-gray-50 dark:bg-[#171717] transition-colors duration-200">
      <Sidebar
        selectedWorkspace={navValue}
        onWorkspaceChange={handleWorkspaceChange}
        onNewNote={handleNewNote}
        noteCount={filteredNotes.length}
        sidebarCounts={getSidebarCounts()}
        onFolderSelect={handleFolderSelect}
        selectedFolder={selectedFolder}
        onNoteSelect={handleEditNote}
      />
      
      <div className="flex-1 flex flex-col">
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