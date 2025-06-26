import { Folder, Note } from '@/types/note';

// Sample folders to demonstrate the structure
export const sampleFolders: Folder[] = [
  {
    id: 'folder-1',
    name: 'Personal',
    color: 'bg-blue-500',
    createdAt: new Date(),
    updatedAt: new Date(),
    noteCount: 2
  },
  {
    id: 'folder-2', 
    name: 'Work',
    color: 'bg-green-500',
    createdAt: new Date(),
    updatedAt: new Date(),
    noteCount: 1
  },
  {
    id: 'folder-3',
    name: 'Projects',
    color: 'bg-purple-500',
    parentId: 'folder-2', // Subfolder under Work
    createdAt: new Date(),
    updatedAt: new Date(),
    noteCount: 1
  }
];

// Sample notes to demonstrate the structure
export const sampleNotes: Note[] = [
  {
    id: 'note-1',
    title: 'Shopping List',
    content: '# Shopping List\n\n- Milk\n- Bread\n- Eggs\n- Coffee',
    type: 'markdown',
    status: 'idea',
    folderId: 'folder-1', // In Personal folder
    tags: ['personal', 'list'],
    createdAt: new Date(),
    updatedAt: new Date(),
    fontFamily: 'Inter'
  },
  {
    id: 'note-2', 
    title: 'Dream Journal',
    content: '# Dream Journal\n\nLast night I dreamed about...',
    type: 'markdown',
    status: 'draft',
    folderId: 'folder-1', // In Personal folder
    tags: ['personal', 'journal'],
    starred: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    fontFamily: 'Inter'
  },
  {
    id: 'note-3',
    title: 'Meeting Notes',
    content: '# Team Meeting\n\n## Agenda\n- Project updates\n- Next sprint planning',
    type: 'markdown',
    status: 'done',
    folderId: 'folder-2', // In Work folder
    tags: ['work', 'meeting'],
    createdAt: new Date(),
    updatedAt: new Date(),
    fontFamily: 'Inter'
  },
  {
    id: 'note-4',
    title: 'Project Alpha',
    content: '# Project Alpha\n\n## Overview\nThis is our new project...',
    type: 'markdown',
    status: 'review',
    folderId: 'folder-3', // In Projects subfolder
    tags: ['work', 'project'],
    createdAt: new Date(),
    updatedAt: new Date(),
    fontFamily: 'Inter'
  }
];