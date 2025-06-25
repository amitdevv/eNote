import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Note, TodoItem } from '@/types/note';
import { useNotes } from '@/contexts/NotesContext';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import TipTapEditor from '@/components/editor/TipTapEditor';
import { CodeEditor } from '@/components/editor/CodeEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { 
  X, Plus, Trash2, FileText, Hash, Code, CheckSquare, 
  ArrowLeft, Save, Calendar, Tag, Folder, Flag,
  Lightbulb, Search, ClipboardList, Edit3, CheckCircle, Eye,
  Download, FileText as FileTextIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

import { FontSelector } from '@/components/ui/font-selector';
import { 
  exportNoteAsMarkdown, 
  exportNoteAsPDF 
} from '@/utils/export';

export const EditorPage: React.FC = () => {
  const navigate = useNavigate();
  const { noteId } = useParams();
  const { addNote, updateNote, getNoteById } = useNotes();
  
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<Note['type']>('markdown');
  const [status, setStatus] = useState<Note['status']>('idea');
  const [workspace, setWorkspace] = useState('Personal');
  const [language, setLanguage] = useState('javascript');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);

  const handleSave = (silent = false) => {
    if (!title.trim() && !content.trim()) return;

    const noteData: Partial<Note> = {
      title: title.trim() || 'Untitled',
      content,
      type,
      status,
      workspace,
      tags,
      fontFamily,
    };

    if (type === 'code') {
      noteData.language = language;
    }

    if (type === 'todo') {
      noteData.todos = todos;
    }

    if (note) {
      updateNote(note.id, noteData);
      if (!silent) {
        navigate('/notes');
      }
    } else {
      const newNoteId = addNote(noteData);
      if (!silent) {
        navigate('/notes');
      } else {
        navigate(`/editor/${newNoteId}`, { replace: true });
      }
    }
  };

  useKeyboardShortcuts({
    onSave: () => handleSave()
  });

  // Load note if editing existing note
  useEffect(() => {
    if (noteId) {
      const existingNote = getNoteById(noteId);
      if (existingNote) {
        setNote(existingNote);
        setTitle(existingNote.title);
        setContent(existingNote.content);
        setType(existingNote.type);
        setStatus(existingNote.status);
        setWorkspace(existingNote.workspace);
        setLanguage(existingNote.language || 'javascript');
        setTags(existingNote.tags);
        setTodos(existingNote.todos || []);
        setFontFamily(existingNote.fontFamily || 'Inter');
      } else {
        // Note not found, redirect to new note
        navigate('/editor', { replace: true });
      }
    } else {
      // Reset form for new note
      setNote(null);
      setTitle('');
      setContent('');
      setType('markdown');
      setStatus('idea');
      setWorkspace('Personal');
      setLanguage('javascript');
      setTags([]);
      setTodos([]);
      setFontFamily('Inter');
    }
  }, [noteId, getNoteById, navigate]);

  // Auto-save functionality
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    if (title.trim() || content.trim()) {
      const timer = setTimeout(() => {
        handleSave(true); // silent save
      }, 2000);
      setAutoSaveTimer(timer);
    }

    return () => {
      if (autoSaveTimer) {
        clearTimeout(autoSaveTimer);
      }
    };
  }, [title, content, type, status, workspace, language, tags, todos, fontFamily]);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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

  const handleFontChange = (font: string) => {
    setFontFamily(font);
  };

  const typeOptions = [
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
    { value: 'idea', label: 'Idea', icon: Lightbulb, color: 'text-blue-600 dark:text-blue-400' },
    { value: 'research', label: 'Research', icon: Search, color: 'text-purple-600 dark:text-purple-400' },
    { value: 'outline', label: 'Outline', icon: ClipboardList, color: 'text-orange-600 dark:text-orange-400' },
    { value: 'draft', label: 'Draft', icon: Edit3, color: 'text-yellow-600 dark:text-yellow-400' },
    { value: 'review', label: 'Review', icon: Eye, color: 'text-indigo-600 dark:text-indigo-400' },
    { value: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#171717] transition-colors duration-200">
      {/* Header */}
      <header className="bg-white dark:bg-[#1a1a1a] border-b border-gray-200 dark:border-gray-800 px-6 py-4 transition-colors duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notes')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Notes
            </Button>
            
            <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
            
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="w-4 h-4" />
              {note ? `Last updated: ${note.updatedAt.toLocaleDateString()}` : 'New note'}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => handleSave()}
              className="bg-black hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-2 text-white transition-colors duration-200"
            >
              <Save className="w-4 h-4" />
              Save Note
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="w-80 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 p-6 space-y-6 transition-colors duration-200">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Note Type
            </label>
            <Select value={type} onValueChange={(value) => setType(value as Note['type'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {typeOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                  >
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
              <Flag className="w-4 h-4" />
              Status
            </label>
            <Select value={status} onValueChange={(value) => setStatus(value as Note['status'])}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem 
                    key={option.value} 
                    value={option.value}
                  >
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
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
              <Folder className="w-4 h-4" />
              Workspace
            </label>
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

          {type === 'code' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Programming Language
              </label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languageOptions.map((lang) => (
                    <SelectItem 
                      key={lang.value} 
                      value={lang.value}
                    >
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
              Font Family
            </label>
            <FontSelector 
              currentFont={fontFamily} 
              onFontChange={handleFontChange}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block flex items-center gap-2">
              <Tag className="w-4 h-4" />
              Tags
            </label>
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 hover:text-red-600 dark:hover:text-red-400 transition-colors"
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

          {/* Export Section */}
          <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Export Note
            </label>
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => note && exportNoteAsMarkdown(note)}
                disabled={!note}
                className="w-full justify-start"
              >
                <Download className="w-4 h-4 mr-2" />
                Export as Markdown
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => note && exportNoteAsPDF(note)}
                disabled={!note}
                className="w-full justify-start"
              >
                <FileTextIcon className="w-4 h-4 mr-2" />
                Export as PDF
              </Button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Card className="h-full border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] transition-colors duration-200">
            <CardHeader className="pb-4">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title..."
                className="text-2xl font-bold border-none px-0 py-2 focus-visible:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 bg-transparent text-gray-900 dark:text-gray-100"
              />
            </CardHeader>
            
            <CardContent className="pt-0 h-full" style={{ fontFamily }}>
              {type === 'todo' ? (
                <div className="space-y-4">
                  <div className="space-y-3">
                    {todos.map((todo) => (
                      <div key={todo.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <Checkbox
                          checked={todo.completed}
                          onCheckedChange={() => toggleTodo(todo.id)}
                        />
                        <span className={cn(
                          "flex-1 text-gray-900 dark:text-gray-100",
                          todo.completed && "line-through text-gray-500 dark:text-gray-500"
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
                          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
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
              ) : type === 'markdown' ? (
                <div className="h-full">
                  <TipTapEditor
                    content={content}
                    onChange={setContent}
                    placeholder="# Start writing in Markdown...\n\nUse the toolbar above for rich formatting!"
                    fontFamily={fontFamily}
                  />
                </div>
              ) : (
                <div className="h-full">
                  <CodeEditor
                    value={content}
                    onChange={setContent}
                    language={language}
                    placeholder={`// Start writing your ${language} code here...\nfunction example() {\n  return 'Hello, World!';\n}`}
                    className="h-full"
                    fontFamily={fontFamily}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}; 