export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'markdown'; // Only markdown now
  status: 'idea' | 'research' | 'outline' | 'draft' | 'review' | 'done';
  workspace: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  starred?: boolean; // For starred notes
  priority?: 'low' | 'medium' | 'high'; // For note priority
  fontFamily?: string; // Font family for note content
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}