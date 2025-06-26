import React, { useState, useRef } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { NoteCard } from '@/components/notes/NoteCard';
import { SearchResults } from '@/components/notes/SearchResults';
import { EditorPage } from '@/components/notes/EditorPage';
import { useNotesStore } from '@/stores/notesStore';
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
  
  const navigate = useNavigate();
  const location = useLocation();
  const { noteId } = useParams();
  
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Navigation type state
  const [navType, setNavType] = useState<'workspace' | 'special' | 'type'>('workspace');
  const [navValue, setNavValue] = useState('all');

  // Check if we're in editor mode
  const isEditorMode = location.pathname.startsWith('/editor');

  // Enhanced search functionality
  const searchResults = searchQuery.trim() ? searchNotes(notes, searchQuery) : [];

  // Filter and sort notes for normal view
  const getFilteredNotes = () => {
    let filtered = notes;

    // Apply navigation-based filtering
    if (navType === 'special') {
      switch (navValue) {
        case 'inbox':
          // Show recent notes or unprocessed notes
          filtered = filtered.filter(note => note.status === 'idea');
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
    } else if (navType === 'type') {
      switch (navValue) {
        case 'all':
          // Show all notes
          break;
        case 'todo':
          // For legacy support - show all notes since we removed todo type
          break;
        case 'markdown':
          filtered = filtered.filter(note => note.type === 'markdown');
          break;
        case 'code':
          // For legacy support - show all notes since we removed code type
          break;
      }
    } else if (navType === 'workspace' && navValue !== 'all') {
      filtered = filtered.filter(note => note.workspace === navValue);
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
        case 'workspace':
          return a.workspace.localeCompare(b.workspace);
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
      inbox: notes.filter(note => note.status === 'idea').length,
      today: notes.filter(note => note.updatedAt >= today).length,
      starred: notes.filter(note => note.starred).length,
      all: notes.length,
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

    // Determine navigation type and value
    if (['inbox', 'today', 'starred'].includes(workspace)) {
      setNavType('special');
      setNavValue(workspace);
      setSelectedWorkspace('all'); // Reset workspace filter
    } else if (['all', 'todo', 'markdown', 'code'].includes(workspace)) {
      setNavType('type');
      setNavValue(workspace);
      setSelectedWorkspace('all'); // Reset workspace filter
    } else {
      setNavType('workspace');
      setNavValue(workspace);
      setSelectedWorkspace(workspace);
    }
  };

  const handleNewNote = () => {
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNotes.map((note) => (
              <NoteCard
                key={note.id}
                note={note}
                onClick={() => handleEditNote(note.id)}
                onDelete={() => handleDeleteNote(note.id)}
                onToggleStarred={() => handleToggleStarred(note.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <FileText className="w-8 h-8 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {navType === 'special' && navValue !== 'all' 
                  ? `No ${navValue} notes` 
                  : navType === 'workspace' && navValue !== 'all'
                  ? `No notes in ${navValue}`
                  : "No notes yet"}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {navType === 'special' || (navType === 'workspace' && navValue !== 'all')
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
                {(navType === 'special' || (navType === 'workspace' && navValue !== 'all')) && (
                  <div className="text-sm">
                    <button
                      onClick={() => {
                        setNavType('workspace');
                        setNavValue('all');
                        setSelectedWorkspace('all');
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
        />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#171717] transition-colors duration-200">
          {renderMainContent()}
        </main>
      </div>
    </div>
  );
}; 