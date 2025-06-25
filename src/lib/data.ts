import { Note, Workspace, TodoItem } from '@/types/note';

export const workspaces: Workspace[] = [
  { id: '1', name: 'Marketing', color: 'bg-blue-500', noteCount: 8 },
  { id: '2', name: 'Product', color: 'bg-green-500', noteCount: 5 },
  { id: '3', name: 'Research', color: 'bg-purple-500', noteCount: 12 },
  { id: '4', name: 'Personal', color: 'bg-orange-500', noteCount: 3 },
];

export const sampleTodos: TodoItem[] = [
  {
    id: '1',
    text: 'Review brand guidelines document',
    completed: false,
    createdAt: new Date('2024-03-22'),
    priority: 'high'
  },
  {
    id: '2',
    text: 'Schedule team meeting for next week',
    completed: true,
    createdAt: new Date('2024-03-21'),
    priority: 'medium'
  },
  {
    id: '3',
    text: 'Update social media calendar',
    completed: false,
    createdAt: new Date('2024-03-20'),
    priority: 'low'
  }
];

export const sampleNotes: Note[] = [
  {
    id: '1',
    title: 'Brand Storytelling Strategy',
    content: 'Exploring how to differentiate our brand in a crowded market through authentic storytelling that resonates with our target audience.',
    type: 'markdown',
    status: 'idea',
    workspace: 'Marketing',
    createdAt: new Date('2024-03-20'),
    updatedAt: new Date('2024-03-20'),
    tags: ['branding', 'strategy', 'storytelling']
  },
  {
    id: '2',
    title: 'SEO Content Calendar',
    content: `# SEO Content Calendar Q2

## Keyword Research
- **Primary Keywords**: content marketing, SEO strategy, digital marketing
- **Long-tail Keywords**: how to improve SEO ranking, content marketing tips

## Content Schedule
### April
- Week 1: Introduction to SEO
- Week 2: Keyword Research Guide
- Week 3: On-page Optimization
- Week 4: Link Building Strategies

### May
- Week 1: Technical SEO
- Week 2: Content Optimization
- Week 3: Local SEO
- Week 4: SEO Analytics

## Success Metrics
- Organic traffic increase: **25%**
- Keyword rankings: Top 10 for primary keywords
- Backlinks: 50+ quality backlinks`,
    type: 'markdown',
    status: 'draft',
    workspace: 'Marketing',
    createdAt: new Date('2024-03-21'),
    updatedAt: new Date('2024-03-22'),
    tags: ['seo', 'content', 'planning']
  },
  {
    id: '3',
    title: 'User Research Findings',
    content: 'Key insights from our latest user interviews revealing pain points in the onboarding process.',
    type: 'markdown',
    status: 'review',
    workspace: 'Research',
    createdAt: new Date('2024-03-19'),
    updatedAt: new Date('2024-03-21'),
    tags: ['user-research', 'insights', 'onboarding']
  },
  {
    id: '4',
    title: 'API Integration Code',
    content: `// User authentication API integration
const authenticateUser = async (credentials) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok) {
      throw new Error('Authentication failed');
    }
    
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  } catch (error) {
    console.error('Auth error:', error);
    throw error;
  }
};

// Usage example
const handleLogin = async (email, password) => {
  try {
    const user = await authenticateUser({ email, password });
    console.log('User logged in:', user);
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
};`,
    type: 'code',
    language: 'javascript',
    status: 'outline',
    workspace: 'Product',
    createdAt: new Date('2024-03-18'),
    updatedAt: new Date('2024-03-20'),
    tags: ['api', 'authentication', 'javascript']
  },
  {
    id: '5',
    title: 'Shopping List',
    content: 'A simple shopping list for the weekend.',
    type: 'markdown',
    workspace: 'Personal',
    tags: ['shopping', 'weekend'],
    status: 'idea',
    priority: 'low',
    createdAt: new Date(Date.now() - 259200000), // 3 days ago
    updatedAt: new Date(Date.now() - 172800000), // 2 days ago
    starred: false
  },
  {
    id: '6',
    title: 'Competitive Analysis',
    content: 'Detailed analysis of top 5 competitors, their strengths, weaknesses, and market positioning.',
    type: 'markdown',
    status: 'done',
    workspace: 'Research',
    createdAt: new Date('2024-03-15'),
    updatedAt: new Date('2024-03-17'),
    tags: ['competitive', 'analysis', 'market']
  },
  {
    id: '7',
    title: 'My First Note',
    content: 'This is a simple text note to get started.',
    type: 'markdown',
    workspace: 'Personal',
    tags: ['getting started'],
    status: 'idea',
    priority: 'medium',
    createdAt: new Date(Date.now() - 86400000), // Yesterday
    updatedAt: new Date(Date.now() - 43200000), // 12 hours ago
    starred: false
  },
  {
    id: '9',
    title: 'Random Thoughts',
    content: 'Just some random thoughts and ideas.',
    type: 'markdown',
    workspace: 'Personal',
    tags: ['thoughts', 'random'],
    status: 'idea',
    priority: 'low',
    createdAt: new Date(Date.now() - 604800000), // 7 days ago
    updatedAt: new Date(Date.now() - 518400000), // 6 days ago
    starred: false
  },
];