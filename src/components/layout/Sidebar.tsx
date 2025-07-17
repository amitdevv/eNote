import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
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
  Eye,
  ChevronLeft,
  ChevronRight,
  Brain,
  Camera
} from 'lucide-react';
import { useImageToTextStore } from '@/stores/imageToTextStore';
// Removed workspaces import - we'll show folders directly

interface SidebarProps {
  selectedWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
  onNewNote: () => void;
  noteCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
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
  isCollapsed = false,
  onToggleCollapse,
  sidebarCounts
}) => {
  const { theme, toggleTheme } = useTheme();
  const { openModal: openImageToText } = useImageToTextStore();
  const navigate=useNavigate();

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

  const toolsItems = [
    { icon: Camera, label: 'Image to Text', id: 'image-to-text', action: openImageToText },
  ];

  return (
    <div className={cn(
      "h-screen bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn("p-4", isCollapsed && "p-2")}>
        <div className={cn(
          "flex items-center mb-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Notes</h1>
          )}
          <div className={cn("flex items-center", isCollapsed ? "flex-col gap-2" : "gap-2")}>
            <Button
              onClick={toggleTheme}
              size="sm"
              variant="ghost"
              className={cn(
                "p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                isCollapsed && "w-8 h-8"
              )}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              )}
            </Button>
            {onToggleCollapse && (
              <Button
                onClick={onToggleCollapse}
                size="sm"
                variant="ghost"
                className={cn(
                  "p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                  isCollapsed && "w-8 h-8"
                )}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* New Note Button */}
        <Button
          onClick={onNewNote}
          className={cn(
            "bg-[#333333] hover:bg-[#404040] text-white mb-4 transition-all duration-300",
            isCollapsed 
              ? "w-8 h-8 p-0 rounded-md" 
              : "w-full"
          )}
          size="sm"
          title={isCollapsed ? 'New Note' : undefined}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">New Note</span>}
        </Button>
        <Button className='w-full flex' onClick={()=>{
            navigate('/memory-palace')
        }}><Brain className='h-4 mr-1'/>Memory Palace</Button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className={cn("p-2", isCollapsed && "px-1")}>
          {/* Quick Access Items */}
          <div className="mb-6">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300",
                  isCollapsed 
                    ? "w-8 h-8 p-0 mx-auto flex justify-center" 
                    : "w-full justify-between h-9 px-3",
                  selectedWorkspace === item.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
                )}
                onClick={() => onWorkspaceChange(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                {isCollapsed ? (
                  <item.icon className="w-4 h-4" />
                ) : (
                  <>
                    <div className="flex items-center">
                      <item.icon className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-400">
                      {item.count}
                    </Badge>
                  </>
                )}
              </Button>
            ))}
          </div>

          {/* Tools Items */}
          <div className="mb-6">
            {toolsItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300",
                  isCollapsed 
                    ? "w-8 h-8 p-0 mx-auto flex justify-center" 
                    : "w-full justify-between h-9 px-3",
                  selectedWorkspace === item.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
                )}
                onClick={item.action}
                title={isCollapsed ? item.label : undefined}
              >
                {isCollapsed ? (
                  <item.icon className="w-4 h-4" />
                ) : (
                  <>
                    <div className="flex items-center">
                      <item.icon className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </div>
                  </>
                )}
              </Button>
            ))}
          </div>

          {/* Tags Section */}
          {(() => {
            const visibleTags = predefinedTags.filter((tag) => {
              const count = sidebarCounts?.[tag.id as keyof typeof sidebarCounts] || 0;
              return count > 0;
            });
            
            if (visibleTags.length === 0) return null;
            
            return (
              <div className="mb-4">
                {!isCollapsed && (
                  <div className="flex items-center justify-between px-3 mb-2">
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                      TAGS
                    </span>
                  </div>
                )}
                
                <div className="space-y-1">
                  {visibleTags.map((tag) => (
                <Button
                  key={tag.id}
                  variant="ghost"
                  className={cn(
                    "mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-gray-300",
                    isCollapsed 
                      ? "w-8 h-8 p-0 mx-auto flex justify-center" 
                      : "w-full justify-between h-9 px-3",
                    selectedWorkspace === tag.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
                  )}
                  onClick={() => onWorkspaceChange(tag.id)}
                  title={isCollapsed ? tag.label : undefined}
                >
                  {isCollapsed ? (
                    <tag.icon className={cn("w-4 h-4", tag.color)} />
                  ) : (
                    <>
                      <div className="flex items-center">
                        <tag.icon className={cn("w-4 h-4 mr-3", tag.color)} />
                        <span className="text-sm font-medium">{tag.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-gray-400">
                        {sidebarCounts?.[tag.id as keyof typeof sidebarCounts] || 0}
                      </Badge>
                    </>
                  )}
                </Button>
              ))}
            </div>
          </div>
            );
          })()}
        </div>
      </div>

      {/* Footer - Settings */}
      <div className={cn(
        "border-t border-gray-200 dark:border-gray-800",
        isCollapsed ? "p-2" : "p-4"
      )}>
      
        <Button 
          variant="ghost" 
          onClick={() => onWorkspaceChange('settings')}
          className={cn(
            "text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-all duration-200",
            isCollapsed 
              ? "w-8 h-8 p-0 mx-auto flex justify-center" 
              : "w-full justify-start h-9 px-3",
            selectedWorkspace === 'settings' && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-[#333333]"
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          {isCollapsed ? (
            <Settings className="w-4 h-4" />
          ) : (
            <>
              <Settings className="w-4 h-4 mr-3" />
              <span className="text-sm">Settings</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};