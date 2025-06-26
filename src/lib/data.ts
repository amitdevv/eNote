import { Workspace } from '@/types/note';

// Default workspaces - users can add more dynamically
export const workspaces: Workspace[] = [
  { id: '1', name: 'Personal', color: 'bg-blue-500', noteCount: 0 },
  { id: '2', name: 'Work', color: 'bg-green-500', noteCount: 0 },
  { id: '3', name: 'Projects', color: 'bg-purple-500', noteCount: 0 },
];