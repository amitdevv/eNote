import React from 'react';
import { cn } from '@/lib/utils';
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MoreHorizontal, Edit3, Trash2, Star,
  Lightbulb, ClipboardList, Eye, CheckCircle, Download, FileText,
  Rocket, Code, GraduationCap, User
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

// Unified tag configuration
const tagConfig = {
  // Category tags
  project: { icon: Rocket, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  coding: { icon: Code, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  college: { icon: GraduationCap, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  personal: { icon: User, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  ideas: { icon: Lightbulb, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
  // Status tags
  done: { icon: CheckCircle, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-50 dark:bg-green-900/20' },
  ongoing: { icon: ClipboardList, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-50 dark:bg-orange-900/20' },
  future: { icon: Eye, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-50 dark:bg-indigo-900/20' },
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
  
  // Debug: Log note tags
  console.log('NoteCard rendering for note:', note.title, 'with tags:', note.tags, 'type:', typeof note.tags);
  
  // Helper to render a tag with icon if it's a predefined tag
  const renderTag = (tag: string) => {
    console.log('Rendering tag:', tag, 'type:', typeof tag);
    const tagInfo = tagConfig[tag as keyof typeof tagConfig];
    
    if (tagInfo) {
      const IconComponent = tagInfo.icon;
      return (
        <Badge 
          key={tag} 
          variant="secondary" 
          className={cn(
            "text-xs flex items-center gap-1 border-0",
            tagInfo.bgColor,
            tagInfo.color
          )}
        >
          <IconComponent className="w-3 h-3" />
          {tag}
        </Badge>
      );
    }
    
    // Regular tag without icon
    return (
      <Badge 
        key={tag} 
        variant="secondary" 
        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
      >
        {tag}
      </Badge>
    );
  };

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
    // Debug: Check tags in list view
    console.log('List view - note.tags:', note.tags, 'Array.isArray:', Array.isArray(note.tags));
    
    return (
      <Card 
        className="group transition-all duration-200 border-none bg-white dark:bg-[#1e1e1e] cursor-pointer"
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-base leading-tight truncate">
                  {note.title}
                </h3>
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
            
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                {(note.tags && Array.isArray(note.tags) ? note.tags : []).slice(0, 2).map((tag) => renderTag(tag))}
                {(note.tags && Array.isArray(note.tags) ? note.tags : []).length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    +{(note.tags && Array.isArray(note.tags) ? note.tags : []).length - 2}
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
  // Debug: Check tags in grid view
  console.log('Grid view - note.tags:', note.tags, 'Array.isArray:', Array.isArray(note.tags));
  
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
            {(note.tags && Array.isArray(note.tags) ? note.tags : []).slice(0, 3).map((tag) => renderTag(tag))}
            {(note.tags && Array.isArray(note.tags) ? note.tags : []).length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                +{(note.tags && Array.isArray(note.tags) ? note.tags : []).length - 3}
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