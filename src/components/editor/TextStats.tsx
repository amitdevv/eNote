import React from 'react';
import { getTextStats, TextStats as ITextStats } from '@/utils/textAnalysis';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock } from 'lucide-react';

interface TextStatsProps {
  content: string;
  title: string;
}

export const TextStats: React.FC<TextStatsProps> = ({ content, title }) => {
  const stats = getTextStats(content + ' ' + title); // Include title in word count
  
  if (stats.words === 0) {
    return null; // Don't show stats for empty notes
  }

  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white dark:bg-[#1e1e1e] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 print:static print:mt-6 print:mr-0 print:ml-auto print:w-fit print:shadow-none print:border-gray-400 print:bg-white">
      <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400 print:text-gray-700">
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3 print:text-gray-600" />
          <span className="font-medium">{stats.words.toLocaleString()}</span>
          <span>words</span>
        </div>
        
        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 print:bg-gray-400" />
        
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 print:text-gray-600" />
          <span>{stats.readingTimeText}</span>
        </div>
        
        <div className="w-px h-3 bg-gray-300 dark:bg-gray-600 print:bg-gray-400" />
        
        <div className="flex items-center gap-1">
          <span className="font-medium">{stats.characters.toLocaleString()}</span>
          <span>chars</span>
        </div>
      </div>
    </div>
  );
}; 