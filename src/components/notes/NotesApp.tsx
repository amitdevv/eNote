import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Sidebar } from '@/components/layout/Sidebar';
import { NoteCard } from '@/components/notes/NoteCard';
import { SearchResults } from '@/components/notes/SearchResults';

import { useNotes } from '@/contexts/NotesContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { searchNotes } from '@/utils/search';

export const NotesApp: React.FC = () => {
  const { notes, deleteNote, toggleStarred } = useNotes();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWorkspace, setSelectedWorkspace] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'alphabetical' | 'status' | 'workspace'>('recent');
  const [filterBy, setFilterBy] = useState<'all' | 'ideas' | 'drafts' | 'review' | 'done'>('all');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Enhanced search functionality
  const searchResults = searchQuery.trim() ? searchNotes(notes, searchQuery) : [];

  // Filter and sort notes for normal view
  const getFilteredNotes = () => {
    let filtered = notes;

    // Apply workspace filter
    if (selectedWorkspace !== 'all') {
      if (selectedWorkspace === 'starred') {
        filtered = filtered.filter(note => note.starred);
      } else {
        filtered = filtered.filter(note => note.workspace === selectedWorkspace);
      }
    }

    // Apply status filter
    if (filterBy !== 'all') {
      const statusMap = {
        'ideas': 'idea',
        'drafts': 'draft',
        'review': 'review',
        'done': 'done'
      };
      filtered = filtered.filter(note => note.status === statusMap[filterBy]);
    }

    // Apply sorting
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

  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
    setIsSearchMode(query.trim().length > 0);
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

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onNewNote: handleNewNote,
    onSearch: () => searchInputRef.current?.focus(),
  });

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-[#171717] transition-colors duration-200">
      <Sidebar
        selectedWorkspace={selectedWorkspace}
        onWorkspaceChange={setSelectedWorkspace}
        onNewNote={handleNewNote}
        noteCount={filteredNotes.length}
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
        />
        
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-[#171717] transition-colors duration-200">
          {isSearchMode ? (
            <SearchResults
              results={searchResults}
              onSelectNote={handleEditNote}
              query={searchQuery}
            />
          ) : (
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
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No notes found</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    {selectedWorkspace === 'all' 
                      ? "You haven't created any notes yet." 
                      : `No notes found in ${selectedWorkspace}.`}
                  </p>
                  <button
                    onClick={handleNewNote}
                    className="inline-flex items-center px-4 py-2 bg-[#333333]  text-white rounded-md "
                  >
                    Create your first note
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};