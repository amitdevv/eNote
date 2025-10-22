import React from 'react';
import { cn } from '@/lib/utils';
import { Note } from '@/types/note';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getDisplayTitle } from '@/utils/titleUtils';
import { 
  MoreHorizontal, Edit3, Trash2, Star,
  Lightbulb, ClipboardList, Eye, CheckCircle,
  Rocket, Code, GraduationCap, User
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';


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
  
  // Helper to render a tag with icon if it's a predefined tag
  const renderTag = (tag: string) => {
    const tagInfo = tagConfig[tag as keyof typeof tagConfig];
    
    if (tagInfo) {
      const IconComponent = tagInfo.icon;
      return (
        <Badge 
          key={tag} 
          variant="secondary" 
          className={cn(
            "text-xs flex items-center gap-1 border-0 px-2 py-1",
            tagInfo.bgColor,
            tagInfo.color
          )}
        >
          <IconComponent className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">{tag}</span>
        </Badge>
      );
    }
    
    // Regular tag without icon
    return (
      <Badge 
        key={tag} 
        variant="secondary" 
        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white px-2 py-1"
      >
        <span className="truncate">{tag}</span>
      </Badge>
    );
  };

  const renderContent = () => {
    const plainTextContent = htmlToPlainText(note.content);
    const lines = plainTextContent.split('\n').filter(line => line.trim() !== '').slice(0, 3);
    
    return (
      <div className="space-y-1">
        <div className="text-sm text-gray-600 dark:text-white leading-relaxed">
          {lines.length > 0 ? (
            lines.map((line, index) => (
              <div key={index} className="line-clamp-1">
                {line.trim() || '\u00A0'}
              </div>
            ))
          ) : (
            <div className="text-gray-400 dark:text-gray-300 italic">No content</div>
          )}
        </div>
      </div>
    );
  };

  if (viewMode === 'list') {

    
    return (
      <Card 
        className="group transition-all duration-200 border-none bg-white dark:bg-[#1e1e1e] cursor-pointer active:scale-[0.995] touch-manipulation"
        onClick={onClick}
      >
        <CardContent className="p-3 sm:p-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base leading-tight line-clamp-2 flex-1">
                  {getDisplayTitle(note.content)}
                </h3>
                {/* Mobile-friendly star button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarred();
                  }}
                  className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:hidden min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label={note.starred ? 'Remove from starred' : 'Add to starred'}
                >
                  <Star className={cn(
                    "w-4 h-4 transition-colors",
                    note.starred 
                      ? "fill-yellow-400 text-yellow-400" 
                      : "text-gray-400 hover:text-yellow-400"
                  )} />
                </button>
              </div>
              <div style={{ fontFamily: note.fontFamily || 'Inter' }}>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-white leading-relaxed">
                  {(() => {
                    const plainTextContent = htmlToPlainText(note.content);
                    const firstLine = plainTextContent.split('\n').find(line => line.trim() !== '') || 'No content';
                    return (
                      <div className="line-clamp-2 sm:line-clamp-1">
                        {firstLine.trim() || '\u00A0'}
                      </div>
                    );
                  })()}
                </div>
              </div>
              
              {/* Mobile: Tags below content */}
              <div className="flex flex-wrap gap-1 mt-2 sm:hidden">
                {(note.tags && Array.isArray(note.tags) ? note.tags : []).slice(0, 2).map((tag) => renderTag(tag))}
                {(note.tags && Array.isArray(note.tags) ? note.tags : []).length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white px-2 py-1">
                    +{(note.tags && Array.isArray(note.tags) ? note.tags : []).length - 2}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Desktop: Tags and controls on the right */}
            <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
              <div className="flex flex-wrap gap-1">
                {(note.tags && Array.isArray(note.tags) ? note.tags : []).slice(0, 2).map((tag) => renderTag(tag))}
                {(note.tags && Array.isArray(note.tags) ? note.tags : []).length > 2 && (
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white px-2 py-1">
                    +{(note.tags && Array.isArray(note.tags) ? note.tags : []).length - 2}
                  </Badge>
                )}
              </div>
              
              <span className="text-xs text-gray-400 dark:text-gray-300 whitespace-nowrap">
                {note.updatedAt ? (() => {
                  const date = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt);
                  return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  });
                })() : 'No date'}
              </span>
            </div>
            
            {/* Mobile: Date and menu at bottom */}
            <div className="sm:hidden self-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-[#333333] min-h-[32px] min-w-[32px]"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-[#333333] border-gray-200 dark:border-gray-700" sideOffset={5}>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }} 
                    className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[40px]"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit note
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStarred();
                    }} 
                    className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[40px]"
                  >
                    <Star className={`w-4 h-4 mr-2 ${note.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    {note.starred ? 'Remove from starred' : 'Add to starred'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[40px]"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop: Menu button */}
            <div className="hidden sm:block flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-[#333333]"
                    >
                      <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-[#333333] border-gray-200 dark:border-gray-700" sideOffset={5}>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onClick();
                      }} 
                      className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit note
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStarred();
                      }} 
                      className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      <Star className={`w-4 h-4 mr-2 ${note.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                      {note.starred ? 'Remove from starred' : 'Add to starred'}
                    </DropdownMenuItem>
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
          
          {/* Mobile: Date at bottom */}
          <div className="sm:hidden mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-400 dark:text-gray-300">
              {note.updatedAt ? (() => {
                const date = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt);
                return date.toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric',
                  year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
                });
              })() : 'No date'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default) - Mobile optimized
  
  return (
    <Card 
      className="group transition-all duration-200 border-none bg-white dark:bg-[#1e1e1e] cursor-pointer active:scale-[0.98] touch-manipulation min-h-[200px] flex flex-col"
      onClick={onClick}
    >
      <CardHeader className="pb-2 sm:pb-3 flex-shrink-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white text-base sm:text-lg leading-tight line-clamp-2 mb-1 sm:mb-2">
              {getDisplayTitle(note.content)}
            </h3>
          </div>
          
          {/* Mobile: Star button always visible */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleStarred();
              }}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors sm:hidden min-h-[32px] min-w-[32px] flex items-center justify-center"
              aria-label={note.starred ? 'Remove from starred' : 'Add to starred'}
            >
              <Star className={cn(
                "w-4 h-4 transition-colors",
                note.starred 
                  ? "fill-yellow-400 text-yellow-400" 
                  : "text-gray-400 hover:text-yellow-400"
              )} />
            </button>
            
            {/* Desktop: Menu button with hover */}
            <div className="hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-[#333333]"
                >
                  <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-[#333333] border-gray-200 dark:border-gray-700" sideOffset={5}>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onClick();
                  }} 
                  className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit note
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleStarred();
                  }} 
                  className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Star className={`w-4 h-4 mr-2 ${note.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {note.starred ? 'Remove from starred' : 'Add to starred'}
                </DropdownMenuItem>
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

            {/* Mobile: Menu button always visible */}
            <div className="sm:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-[#333333] min-h-[32px] min-w-[32px]"
                  >
                    <MoreHorizontal className="w-4 h-4 text-gray-600 dark:text-white" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 z-50 bg-white dark:bg-[#333333] border-gray-200 dark:border-gray-700" sideOffset={5}>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onClick();
                    }} 
                    className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[40px]"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    Edit note
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleStarred();
                    }} 
                    className="cursor-pointer text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[40px]"
                  >
                    <Star className={`w-4 h-4 mr-2 ${note.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    {note.starred ? 'Remove from starred' : 'Add to starred'}
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete();
                    }}
                    className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 min-h-[40px]"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete note
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 flex-1 flex flex-col">
        <div style={{ fontFamily: note.fontFamily || 'Inter' }} className="flex-1">
          {renderContent()}
        </div>
        
        <div className="flex items-center justify-between mt-3 sm:mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {(note.tags && Array.isArray(note.tags) ? note.tags : []).slice(0, 2).map((tag) => renderTag(tag))}
            {(note.tags && Array.isArray(note.tags) ? note.tags : []).length > 2 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-white px-2 py-1">
                +{(note.tags && Array.isArray(note.tags) ? note.tags : []).length - 2}
              </Badge>
            )}
          </div>
          
          <span className="text-xs text-gray-400 dark:text-gray-300 flex-shrink-0 ml-2">
            {note.updatedAt ? (() => {
              const date = note.updatedAt instanceof Date ? note.updatedAt : new Date(note.updatedAt);
              return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
              });
            })() : 'No date'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};