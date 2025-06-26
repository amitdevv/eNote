import React from 'react';
import { SearchResult } from '@/utils/search';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Search,
  Clock,
  Tag,
  Rocket,
  Code,
  GraduationCap,
  User,
  Lightbulb,
  CheckCircle,
  ClipboardList,
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';


interface SearchResultsProps {
  results: SearchResult[];
  onSelectNote: (noteId: string) => void;
  query: string;
}

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

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  onSelectNote,
  query
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
  
  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Search className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No results found</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Try adjusting your search terms or check for typos. You can search in note titles, content, and tags.
        </p>
      </div>
    );
  }

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



  // Get content preview
  const getContentPreview = (note: any) => {
    const content = htmlToPlainText(note.content);
    return content.length > 150 ? content.substring(0, 150) + '...' : content;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
        </h2>
      </div>

      <div className="space-y-3">
        {results.map((result) => {
          return (
            <Card 
              key={result.note.id} 
              className="transition-all duration-200 cursor-pointer border-none bg-white dark:bg-[#1e1e1e]"
              onClick={() => onSelectNote(result.note.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Title */}
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg leading-tight mb-2">
                      {result.note.title}
                    </h3>
                    
                    {/* Metadata */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                        <Clock className="w-3 h-3" />
                        {result.note.updatedAt.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  
                  <Badge variant="secondary" className="text-xs ml-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                    Score: {result.score}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {/* Content preview */}
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">
                  {getContentPreview(result.note)}
                </p>
                
                {/* Tags */}
                {result.note.tags.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <Tag className="w-3 h-3 text-gray-400 dark:text-gray-500" />
                    <div className="flex flex-wrap gap-1">
                      {result.note.tags.map((tag: string) => renderTag(tag))}
                    </div>
                  </div>
                )}
                
                {/* Action */}
                <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <Button variant="ghost" size="sm" className="text-xs text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">
                    View Note →
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}; 