import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Plus,
  Star,
  FileText,
  Calendar,
  Settings,
  Sun,
  Moon,
  Rocket,
  Code,
  GraduationCap,
  User,
  Lightbulb,
  CheckCircle,
  ClipboardList,
  Eye
} from 'lucide-react';
// Removed workspaces import - we'll show folders directly

interface SidebarProps {
  selectedWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
  onNewNote: () => void;
  noteCount: number;
  sidebarCounts?: {
    all: number;
    today: number;
    starred: number;
    project: number;
    coding: number;
    college: number;
    personal: number;
    ideas: number;
    done: number;
    ongoing: number;
    future: number;
  };

}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedWorkspace,
  onWorkspaceChange,
  onNewNote,
  noteCount,
  sidebarCounts
}) => {
  const { theme, toggleTheme } = useTheme();

  // Unified tags system - replaces both status and tags
  const predefinedTags = [
    // Category tags
    { id: 'project', label: 'Project', icon: Rocket, color: 'text-blue-600 dark:text-blue-400' },
    { id: 'coding', label: 'Coding', icon: Code, color: 'text-purple-600 dark:text-purple-400' },
    { id: 'college', label: 'College', icon: GraduationCap, color: 'text-green-600 dark:text-green-400' },
    { id: 'personal', label: 'Personal', icon: User, color: 'text-orange-600 dark:text-orange-400' },
    { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-600 dark:text-yellow-400' },
    // Status tags
    { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
    { id: 'ongoing', label: 'Ongoing', icon: ClipboardList, color: 'text-orange-600 dark:text-orange-400' },
    { id: 'future', label: 'Future', icon: Eye, color: 'text-indigo-600 dark:text-indigo-400' },
  ];

  const sidebarItems = [
    { icon: FileText, label: 'All Notes', count: sidebarCounts?.all || noteCount, id: 'all' },
    { icon: Calendar, label: 'Today', count: sidebarCounts?.today || 0, id: 'today' },
    { icon: Star, label: 'Starred', count: sidebarCounts?.starred || 0, id: 'starred' },
  ];

  return (
    <>
      <div className="w-64 h-screen bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-200">
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notes</h1>
            <Button
              onClick={toggleTheme}
              size="sm"
              variant="ghost"
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
          </div>
          
          {/* New Note Button */}
          <Button
            onClick={onNewNote}
            className="w-full bg-[#333333] hover:bg-[#404040] text-white mb-4"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Note
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-2">
            {/* Quick Access Items */}
            <div className="mb-6">
              {sidebarItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={cn(
                    "w-full justify-between h-9 px-3 mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300",
                    selectedWorkspace === item.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
                  )}
                  onClick={() => onWorkspaceChange(item.id)}
                >
                  <div className="flex items-center">
                    <item.icon className="w-4 h-4 mr-3" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-400">
                    {item.count}
                  </Badge>
                </Button>
              ))}
            </div>

            {/* Tags Section */}
            <div className="mb-4">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  TAGS
                </span>
              </div>
              
              <div className="space-y-1">
                {predefinedTags.map((tag) => (
                  <Button
                    key={tag.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-between h-9 px-3 mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300",
                      selectedWorkspace === tag.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
                    )}
                    onClick={() => onWorkspaceChange(tag.id)}
                  >
                    <div className="flex items-center">
                      <tag.icon className={cn("w-4 h-4 mr-3", tag.color)} />
                      <span className="text-sm font-medium">{tag.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-400">
                      {sidebarCounts?.[tag.id as keyof typeof sidebarCounts] || 0}
                    </Badge>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Settings */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <Button 
            variant="ghost" 
            onClick={() => onWorkspaceChange('settings')}
            className={cn(
              "w-full justify-start h-9 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-all duration-200",
              selectedWorkspace === 'settings' && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
            )}
          >
            <Settings className="w-4 h-4 mr-3" />
            <span className="text-sm">Settings</span>
          </Button>
        </div>
      </div>


    </>
  );
};