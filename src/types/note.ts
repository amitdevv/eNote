export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
  starred?: boolean;
  priority?: 'low' | 'medium' | 'high';
  fontFamily?: string;
  fontSize?: number;
}
