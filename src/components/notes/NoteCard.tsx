import React from 'react';
import { cn } from '@/lib/utils';
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { CodeBlock } from '@/components/notes/CodeBlock';
import { 
  MoreHorizontal, Edit3, Trash2, Star, FileText, Hash, Code, CheckSquare,
  Lightbulb, Search, ClipboardList, Eye, CheckCircle, Download
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  exportNoteAsMarkdown, 
  exportNoteAsPDF 
} from '@/utils/export';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDelete: () => void;
  onToggleStarred: () => void;
}

const statusConfig = {
  idea: { label: 'Idea', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: Lightbulb, iconColor: 'text-blue-600 dark:text-blue-400' },
  research: { label: 'Research', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: Search, iconColor: 'text-purple-600 dark:text-purple-400' },
  outline: { label: 'Outline', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800', icon: ClipboardList, iconColor: 'text-orange-600 dark:text-orange-400' },
  draft: { label: 'Draft', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800', icon: Edit3, iconColor: 'text-yellow-600 dark:text-yellow-400' },
  review: { label: 'Review', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', icon: Eye, iconColor: 'text-indigo-600 dark:text-indigo-400' },
  done: { label: 'Done', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800', icon: CheckCircle, iconColor: 'text-green-600 dark:text-green-400' },
};

const typeConfig = {
  markdown: { icon: Hash, label: 'Markdown', color: 'text-blue-600 dark:text-blue-400' },
  code: { icon: Code, label: 'Code', color: 'text-purple-600 dark:text-purple-400' },
  todo: { icon: CheckSquare, label: 'To-do', color: 'text-green-600 dark:text-green-400' },
  // Fallback for legacy notes
  text: { icon: FileText, label: 'Text', color: 'text-gray-600 dark:text-gray-400' },
};

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onClick, 
  onDelete,
  onToggleStarred
}) => {
  const statusInfo = statusConfig[note.status];
  const typeInfo = typeConfig[note.type as keyof typeof typeConfig] || typeConfig.markdown;

  const renderContent = () => {
    if (note.type === 'todo' && note.todos) {
      const completedCount = note.todos.filter(todo => todo.completed).length;
      const totalCount = note.todos.length;
      
      return (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {completedCount} of {totalCount} completed
            </span>
            <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 dark:bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {note.todos.slice(0, 4).map((todo) => (
              <div key={todo.id} className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={todo.completed}
                  onCheckedChange={() => {}}
                  className="h-4 w-4"
                />
                <span className={cn(
                  "flex-1 truncate text-gray-700 dark:text-gray-300",
                  todo.completed && "line-through text-gray-500 dark:text-gray-500"
                )}>
                  {todo.text}
                </span>
                {todo.priority && (
                  <Badge 
                    variant="outline" 
                    className={cn(
                      "text-xs px-1 py-0",
                      todo.priority === 'high' && "border-red-200 dark:border-red-800 text-red-600 dark:text-red-400",
                      todo.priority === 'medium' && "border-yellow-200 dark:border-yellow-800 text-yellow-600 dark:text-yellow-400",
                      todo.priority === 'low' && "border-green-200 dark:border-green-800 text-green-600 dark:text-green-400"
                    )}
                  >
                    {todo.priority}
                  </Badge>
                )}
              </div>
            ))}
            {note.todos.length > 4 && (
              <div className="text-xs text-gray-500 dark:text-gray-500 text-center pt-1">
                +{note.todos.length - 4} more tasks
              </div>
            )}
          </div>
        </div>
      );
    }

    if (note.type === 'code') {
      return (
        <div className="space-y-2">
          <CodeBlock
            code={note.content}
            language={note.language || 'javascript'}
            theme="light"
            maxLines={4}
            className="text-xs"
          />
        </div>
      );
    }

    if (note.type === 'markdown') {
      return (
        <div className="space-y-2">
          <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-4 font-mono">
            {note.content.split('\n').slice(0, 4).map((line, index) => (
              <div key={index} className={cn(
                line.startsWith('#') && "font-semibold text-gray-900 dark:text-gray-100",
                line.startsWith('##') && "text-sm",
                line.startsWith('###') && "text-xs",
                line.startsWith('-') && "ml-2",
                line.startsWith('*') && "ml-2"
              )}>
                {line || '\u00A0'}
              </div>
            ))}
          </div>
        </div>
      );
    }

    // Handle legacy text notes and any other types
    return (
      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed line-clamp-3">
        {note.content}
      </p>
    );
  };

  return (
    <Card 
      className="group hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all duration-200 border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 relative overflow-visible cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-2">
              {note.title}
            </h3>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge 
                variant="outline" 
                className={cn("text-xs font-medium border", statusInfo.color)}
              >
                <statusInfo.icon className={cn("w-3 h-3 mr-1.5", statusInfo.iconColor)} />
                {statusInfo.label}
              </Badge>
              <Badge 
                variant="outline" 
                className={cn("text-xs font-medium border-gray-200 dark:border-gray-700", typeInfo.color)}
              >
                <typeInfo.icon className="w-3 h-3 mr-1" />
                {typeInfo.label}
              </Badge>
              <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                {note.workspace}
              </Badge>
            </div>
          </div>
          
          <div className="flex-shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700" sideOffset={5}>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }} 
                  className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit note
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarred();
                  }} 
                  className="cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Star className={`w-4 h-4 mr-2 ${note.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {note.starred ? 'Remove from starred' : 'Add to starred'}
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    exportNoteAsMarkdown(note);
                  }}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export as Markdown
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    exportNoteAsPDF(note);
                  }}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200 dark:bg-gray-700" />
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete note
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div style={{ fontFamily: note.fontFamily || 'Inter' }}>
          {renderContent()}
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-wrap gap-1">
            {note.tags.slice(0, 3).map((tag) => (
              <Badge 
                key={tag} 
                variant="secondary" 
                className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
          
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {note.updatedAt ? note.updatedAt.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }) : 'No date'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};