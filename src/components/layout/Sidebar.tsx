import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
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
      "h-screen bg-gray-50 dark:bg-[#212121] flex flex-col transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className={cn("p-4", isCollapsed && "p-2" )}>
        <div className={cn(
          "flex items-center mb-4",
          isCollapsed ? "justify-center" : "justify-between"
        )}>
          {!isCollapsed && (
            <h1 className="text-base font-semibold text-gray-900 dark:text-white">Notes</h1>
          )}
          <div className={cn("flex items-center", isCollapsed ? "flex-col gap-2" : "gap-2")}>
            <Button
              onClick={toggleTheme}
              size="sm"
              variant="ghost"
              className={cn(
                "p-2 hover:bg-gray-100 dark:hover:bg-[#232323]",
                isCollapsed && "w-8 h-8"
              )}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-gray-600 dark:text-white" />
              ) : (
                <Moon className="w-4 h-4 text-gray-600 dark:text-white" />
              )}
            </Button>
            {onToggleCollapse && (
              <Button
                onClick={onToggleCollapse}
                size="sm"
                variant="ghost"
                className={cn(
                  "p-2 hover:bg-gray-100 dark:hover:bg-[#232323]",
                  isCollapsed && "w-8 h-8"
                )}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-gray-600 dark:text-white" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-white" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* New Note, Open Canvas Buttons */}
        <div className={cn("flex flex-col", "space-y-2")}> 
          <Button
            onClick={onNewNote}
            className={cn(
              "bg-[#e5ebfa] dark:bg-[#212b3f] text-[#3377FF] transition-all duration-300 hover:bg-[#e5ebfa] dark:hover:bg-[#212b3f]",
              isCollapsed 
                ? "w-8 h-8 p-0 rounded-md" 
                : "w-full"
            )}
            size="sm"
            title={isCollapsed ? 'New Note' : undefined}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6">
              <path d="M6.986 11.97c.24-.03.457-.044.649-.044.108 0 .216.004.325.013l.324.03V6.246c0-.315.088-.558.262-.73.174-.172.433-.258.776-.258h3.04v3.889c0 .454.118.797.356 1.027.237.23.59.345 1.06.345h3.914v5.968c0 .315-.087.558-.262.73-.174.172-.43.258-.766.258h-4.447a4.575 4.575 0 0 1-.514 1.258h5.024c.758 0 1.326-.186 1.705-.56.379-.372.568-.928.568-1.668v-6.091c0-.484-.045-.86-.135-1.132-.09-.27-.289-.56-.596-.87l-3.743-3.704c-.294-.291-.583-.482-.866-.573-.282-.09-.64-.135-1.073-.135H9.25c-.758 0-1.325.186-1.7.56-.377.372-.564.928-.564 1.668v5.741Zm6.584-2.98V5.494L17.45 9.34H13.93c-.24 0-.36-.116-.36-.35ZM7.635 20c.655 0 1.26-.16 1.813-.48.553-.321.997-.748 1.33-1.28.334-.534.501-1.12.501-1.762a3.29 3.29 0 0 0-.496-1.77 3.715 3.715 0 0 0-1.321-1.275 3.589 3.589 0 0 0-1.827-.476c-.661 0-1.267.159-1.817.476-.55.318-.991.743-1.322 1.276A3.29 3.29 0 0 0 4 16.479c0 .646.165 1.236.496 1.769.33.533.771.958 1.321 1.276.55.317 1.157.476 1.818.476Zm0-1.328a.463.463 0 0 1-.343-.127.444.444 0 0 1-.126-.328v-1.284H5.84a.462.462 0 0 1-.343-.127.444.444 0 0 1-.126-.328c0-.134.042-.243.126-.327a.463.463 0 0 1 .343-.127h1.326v-1.285c0-.134.042-.243.126-.327a.462.462 0 0 1 .343-.127.45.45 0 0 1 .334.127.444.444 0 0 1 .126.327v1.285h1.326c.144 0 .259.042.343.127a.444.444 0 0 1 .126.327.444.444 0 0 1-.126.328.462.462 0 0 1-.343.127H8.095v1.284a.444.444 0 0 1-.126.328.45.45 0 0 1-.334.127Z" fill="#3377FF"/>
            </svg>
            {!isCollapsed && <span className="ml-2 text-[#3377FF] text-base font-medium">New Note</span>}
          </Button>
          <Button
            onClick={() => { onWorkspaceChange('canvas'); }}
            className={cn(
              "bg-[#f4edf9] dark:bg-[#630ad3]/10 text-[#630ad3] dark:text-white transition-all duration-300 hover:bg-[#f4edf9] dark:hover:bg-[#630ad3]/10",
              isCollapsed 
                ? "w-8 h-8 p-0 rounded-md" 
                : "w-full"
            )}
            size="sm"
            title={isCollapsed ? 'Open Canvas' : undefined}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="#630ad3" viewBox="0 0 256 256" className="w-6 h-6">
              <path d="M104,44H56A12,12,0,0,0,44,56v48a12,12,0,0,0,12,12h48a12,12,0,0,0,12-12V56A12,12,0,0,0,104,44Zm4,60a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V56a4,4,0,0,1,4-4h48a4,4,0,0,1,4,4Zm92-60H152a12,12,0,0,0-12,12v48a12,12,0,0,0,12,12h48a12,12,0,0,0,12-12V56A12,12,0,0,0,200,44Zm4,60a4,4,0,0,1-4,4H152a4,4,0,0,1-4-4V56a4,4,0,0,1,4-4h48a4,4,0,0,1,4,4ZM104,140H56a12,12,0,0,0-12,12v48a12,12,0,0,0,12,12h48a12,12,0,0,0,12-12V152A12,12,0,0,0,104,140Zm4,60a4,4,0,0,1-4,4H56a4,4,0,0,1-4-4V152a4,4,0,0,1,4-4h48a4,4,0,0,1,4,4Zm92-60H152a12,12,0,0,0-12,12v48a12,12,0,0,0,12,12h48a12,12,0,0,0,12-12V152A12,12,0,0,0,200,140Zm4,60a4,4,0,0,1-4,4H152a4,4,0,0,1-4-4V152a4,4,0,0,1,4-4h48a4,4,0,0,1,4,4Z"></path>
            </svg>
            {!isCollapsed && <span className="ml-2 text-[#630ad3] dark:text-[#630ad3] text-base font-medium">Open Canvas</span>}
          </Button>
        </div>
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
                  "mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-white",
                  isCollapsed 
                    ? "w-8 h-8 p-0 mx-auto flex justify-center" 
                    : "w-full justify-between h-9 px-3",
                  selectedWorkspace === item.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]"
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
                      <span className="text-base font-medium">{item.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-base bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-white">
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
                  "mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-white",
                  isCollapsed 
                    ? "w-8 h-8 p-0 mx-auto flex justify-center" 
                    : "w-full justify-between h-9 px-3",
                  selectedWorkspace === item.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]"
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
                      <span className="text-base font-medium">{item.label}</span>
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
                    <span className="text-base font-semibold text-gray-500 dark:text-white">
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
                    "mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-[#333333] text-gray-700 dark:text-white",
                    isCollapsed 
                      ? "w-8 h-8 p-0 mx-auto flex justify-center" 
                      : "w-full justify-between h-9 px-3",
                    selectedWorkspace === tag.id && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]"
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
                        <span className="text-base font-medium">{tag.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-base bg-gray-100 dark:bg-[#333333] text-gray-600 dark:text-white">
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
            "text-gray-600 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#333333] transition-all duration-200",
            isCollapsed 
              ? "w-8 h-8 p-0 mx-auto flex justify-center" 
              : "w-full justify-start h-9 px-3",
            selectedWorkspace === 'settings' && "bg-gray-100 dark:bg-[#333333] text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-[#333333]"
          )}
          title={isCollapsed ? 'Settings' : undefined}
        >
          {isCollapsed ? (
            <Settings className="w-4 h-4" />
          ) : (
            <>
              <Settings className="w-4 h-4 mr-3" />
              <span className="text-base">Settings</span>
            </>
          )}
        </Button>
      </div>
    </div>
  );
};