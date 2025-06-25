export interface Note {
  id: string;
  title: string;
  content: string;
  type: 'markdown' | 'code' | 'todo';
  status: 'idea' | 'research' | 'outline' | 'draft' | 'review' | 'done';
  workspace: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  starred?: boolean; // For starred notes
  language?: string; // For code snippets
  todos?: TodoItem[]; // For todo notes
  priority?: 'low' | 'medium' | 'high'; // For note priority
  fontFamily?: string; // Font family for note content
}

export interface TodoItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: Date;
  priority?: 'low' | 'medium' | 'high';
}

export interface Workspace {
  id: string;
  name: string;
  color: string;
  noteCount: number;
}