export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'markdown'; // Only markdown now
  folderId?: string; // Optional folder assignment
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  starred?: boolean; // For starred notes
  priority?: 'low' | 'medium' | 'high'; // For note priority
  fontFamily?: string; // Font family for note content
  fontSize?: number; // Font size for note content
}

export interface Folder {
  id: string;
  name: string;
  color: string;
  parentId?: string; // For nested folders
  createdAt: Date;
  updatedAt: Date;
  noteCount?: number; // Computed property
}

