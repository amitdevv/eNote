import React from 'react';
import { cn } from '@/lib/utils';
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, Edit3, Trash2, Star,
  Lightbulb, Search, ClipboardList, Eye, CheckCircle, Download, FileText
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { 
  exportNoteAsMarkdown, 
  exportNoteAsPDF,
  exportNoteAsText
} from '@/utils/export';

interface NoteCardProps {
  note: Note;
  onClick: () => void;
  onDelete: () => void;
  onToggleStarred: () => void;
  viewMode?: 'grid' | 'list';
}

const statusConfig = {
  idea: { label: 'Idea', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800', icon: Lightbulb, iconColor: 'text-blue-600 dark:text-blue-400' },
  research: { label: 'Research', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800', icon: Search, iconColor: 'text-purple-600 dark:text-purple-400' },
  outline: { label: 'Outline', color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800', icon: ClipboardList, iconColor: 'text-orange-600 dark:text-orange-400' },
  draft: { label: 'Draft', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800', icon: Edit3, iconColor: 'text-yellow-600 dark:text-yellow-400' },
  review: { label: 'Review', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800', icon: Eye, iconColor: 'text-indigo-600 dark:text-indigo-400' },
  done: { label: 'Done', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800', icon: CheckCircle, iconColor: 'text-green-600 dark:text-green-400' },
};

// Helper function to convert HTML content to plain text
const htmlToPlainText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<li[^>]*>/gi, '• ')
    .replace(/<\/li>/gi, '\n')
    .replace(/<blockquote[^>]*>/gi, '')
    .replace(/<\/blockquote>/gi, '')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

export const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onClick, 
  onDelete,
  onToggleStarred,
  viewMode = 'grid'
}) => {
  const statusInfo = statusConfig[note.status];

  const renderContent = () => {
    const plainTextContent = htmlToPlainText(note.content);
    const lines = plainTextContent.split('\n').filter(line => line.trim() !== '').slice(0, 3);
    
    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {lines.length > 0 ? (
            lines.map((line, index) => (
              <div key={index} className="line-clamp-1">
                {line.trim() || '\u00A0'}
              </div>
            ))
          ) : (
            <div className="text-gray-400 dark:text-gray-500 italic">No content</div>
          )}
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {
    return (
      <Card 
        className="group transition-all duration-200 border-none bg-white dark:bg-[#1e1e1e] cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Left side - Title and content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight truncate">
                  {note.title}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge 
                    variant="outline" 
                    className={cn("text-xs font-medium border", statusInfo.color)}
                  >
                    <statusInfo.icon className={cn("w-3 h-3 mr-1", statusInfo.iconColor)} />
                    {statusInfo.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700">
                    {note.workspace}
                  </Badge>
                </div>
              </div>
              <div style={{ fontFamily: note.fontFamily || 'Inter' }}>
                <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {(() => {
                    const plainTextContent = htmlToPlainText(note.content);
                    const firstLine = plainTextContent.split('\n').find(line => line.trim() !== '') || 'No content';
                    return (
                      <div className="truncate">
                        {firstLine.trim() || '\u00A0'}
                      </div>
                    );
                  })()}
                </div>
              </div>
            </div>
            
            {/* Right side - Tags, date, and actions */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                {note.tags.slice(0, 2).map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="secondary" 
                    className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                  >
                    {tag}
                  </Badge>
                ))}
                {note.tags.length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    +{note.tags.length - 2}
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                {note.updatedAt ? (() => {
                  const date = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt);
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                })() : 'No date'}
              </span>
              
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-[#333333]"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-[#333333] border-gray-200 dark:border-gray-700" sideOffset={5}>
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
                        exportNoteAsText(note);
                      }}
                      className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Export as Text
                    </DropdownMenuItem>
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
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card 
      className="group transition-all duration-200 border-none bg-white dark:bg-[#1e1e1e] cursor-pointer"
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
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-[#333333]"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-[#333333] border-gray-200 dark:border-gray-700" sideOffset={5}>
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
                    exportNoteAsText(note);
                  }}
                  className="text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Export as Text
                </DropdownMenuItem>
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
            {note.updatedAt ? (() => {
              const date = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt);
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric' 
              });
            })() : 'No date'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};