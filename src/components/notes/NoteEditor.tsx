import React from 'react';
import { Note, TodoItem } from '@/types/note';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  X, Plus, Trash2, FileText, Hash, Code, CheckSquare,
  Lightbulb, Search, ClipboardList, Edit3, Eye, CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NoteEditorProps {
  isOpen: boolean;
  onClose: () => void;
  note: Note | null;
  onSave: (note: Partial<Note>) => void;
}

export const NoteEditor: React.FC<NoteEditorProps> = ({ isOpen, onClose, note, onSave }) => {
  const [title, setTitle] = React.useState('');
  const [content, setContent] = React.useState('');
  const [type, setType] = React.useState<Note['type']>('markdown');
  const [status, setStatus] = React.useState<Note['status']>('idea');
  const [workspace, setWorkspace] = React.useState('Personal');
  const [language, setLanguage] = React.useState('javascript');
  const [tags, setTags] = React.useState('');
  const [newTag, setNewTag] = React.useState('');
  const [todos, setTodos] = React.useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = React.useState('');
  const [priority, setPriority] = React.useState<'low' | 'medium' | 'high'>('medium');

  React.useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setType(note.type);
      setWorkspace(note.workspace);
      setTags(note.tags.join(', '));
      setStatus(note.status);
      if (note.type === 'todo' && note.priority) {
        setPriority(note.priority);
      }
      setLanguage(note.language || 'javascript');
      setTodos(note.todos || []);
    } else {
      setTitle('');
      setContent('');
      setType('markdown');
      setWorkspace('Personal');
      setTags('');
      setStatus('idea');
      setPriority('medium');
      setLanguage('javascript');
      setTodos([]);
    }
  }, [note]);

  const handleSave = () => {
    const noteData: Partial<Note> = {
      title,
      content,
      type,
      status,
      workspace,
      tags: tags.split(', ').filter(tag => tag.trim() !== ''),
      updatedAt: new Date(),
    };

    if (type === 'code') {
      noteData.language = language;
    }

    if (type === 'todo') {
      noteData.todos = todos;
      noteData.priority = priority;
    }

    if (!note) {
      noteData.id = Date.now().toString();
      noteData.createdAt = new Date();
    }

    onSave(noteData);
    onClose();
  };

  const addTag = () => {
    if (newTag.trim() && !tags.split(', ').includes(newTag.trim())) {
      setTags(tags + ', ' + newTag.trim());
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.split(', ').filter(tag => tag !== tagToRemove).join(', '));
  };

  const addTodo = () => {
    if (newTodo.trim()) {
      const todo: TodoItem = {
        id: Date.now().toString(),
        text: newTodo.trim(),
        completed: false,
        createdAt: new Date(),
        priority: 'medium'
      };
      setTodos([...todos, todo]);
      setNewTodo('');
    }
  };

  const toggleTodo = (todoId: string) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? { ...todo, completed: !todo.completed } : todo
    ));
  };

  const removeTodo = (todoId: string) => {
    setTodos(todos.filter(todo => todo.id !== todoId));
  };

  const updateTodoPriority = (todoId: string, priority: TodoItem['priority']) => {
    setTodos(todos.map(todo =>
      todo.id === todoId ? { ...todo, priority } : todo
    ));
  };

  const typeOptions = [
    { value: 'text', label: 'Text', icon: FileText },
    { value: 'markdown', label: 'Markdown', icon: Hash },
    { value: 'code', label: 'Code', icon: Code },
    { value: 'todo', label: 'To-do List', icon: CheckSquare },
  ];

  const languageOptions = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'sql', label: 'SQL' },
    { value: 'json', label: 'JSON' },
    { value: 'yaml', label: 'YAML' },
  ];

  const statusOptions = [
    { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'text-blue-600' },
    { value: 'research', label: 'Research', icon: Search, color: 'text-purple-600' },
    { value: 'outline', label: 'Outline', icon: ClipboardList, color: 'text-orange-600' },
    { value: 'draft', label: 'Draft', icon: Edit3, color: 'text-gray-600' },
    { value: 'review', label: 'Review', icon: Eye, color: 'text-indigo-600' },
    { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-600' },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{note ? 'Edit Note' : 'Create New Note'}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter note title..."
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Type</label>
              <Select value={type} onValueChange={(value) => setType(value as Note['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {typeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Status</label>
              <Select value={status} onValueChange={(value) => setStatus(value as Note['status'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className={cn("w-4 h-4", option.color)} />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Workspace</label>
              <Select value={workspace} onValueChange={setWorkspace}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Product">Product</SelectItem>
                  <SelectItem value="Research">Research</SelectItem>
                  <SelectItem value="Personal">Personal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {type === 'code' && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Language</label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {type === 'todo' ? (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Tasks</label>
              <div className="space-y-3">
                {todos.map((todo) => (
                  <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <Checkbox
                      checked={todo.completed}
                      onCheckedChange={() => toggleTodo(todo.id)}
                    />
                    <span className={cn(
                      "flex-1",
                      todo.completed && "line-through text-gray-500"
                    )}>
                      {todo.text}
                    </span>
                    <Select 
                      value={todo.priority} 
                      onValueChange={(value) => updateTodoPriority(todo.id, value as TodoItem['priority'])}
                    >
                      <SelectTrigger className="w-24">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTodo(todo.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
                
                <div className="flex gap-2">
                  <Input
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    placeholder="Add a new task..."
                    onKeyPress={(e) => e.key === 'Enter' && addTodo()}
                    className="flex-1"
                  />
                  <Button onClick={addTodo} size="sm" variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  type === 'markdown' 
                    ? "# Start writing in Markdown...\n\n## Use headers, **bold**, *italic*, and more!"
                    : type === 'code'
                    ? "// Start writing your code here...\nfunction example() {\n  return 'Hello, World!';\n}"
                    : "Start writing your note..."
                }
                className={cn(
                  "min-h-[300px] resize-none",
                  type === 'code' && "font-mono text-sm"
                )}
              />
              {type === 'markdown' && (
                <p className="text-xs text-gray-500 mt-1">
                  Supports Markdown syntax: **bold**, *italic*, # headers, - lists, etc.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Tags</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.split(', ').map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 text-gray-700">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add a tag..."
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1"
              />
              <Button onClick={addTag} size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-black hover:bg-gray-800">
              {note ? 'Update Note' : 'Create Note'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};