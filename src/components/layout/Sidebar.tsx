import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Plus,
  FileText,
  Star,
  Home,
  ChevronRight,
  Settings,
  Sun,
  Moon
} from 'lucide-react';
import { workspaces } from '@/lib/data';

interface SidebarProps {
  selectedWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
  onNewNote: () => void;
  noteCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  selectedWorkspace,
  onWorkspaceChange,
  onNewNote,
  noteCount
}) => {
  const [expandedSections, setExpandedSections] = React.useState<string[]>(['workspaces', 'note-types']);
  const { theme, toggleTheme } = useTheme();

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const sidebarItems = [
    { icon: Home, label: 'Inbox', count: 12, id: 'inbox' },
    { icon: Home, label: 'Today', count: 5, id: 'today' },
    { icon: Star, label: 'Starred', count: 3, id: 'starred' },
  ];

  const noteTypes = [
    { icon: FileText, label: 'All Notes', count: noteCount, id: 'all', color: 'text-gray-600 dark:text-gray-400' },
    { icon: Home, label: 'To-dos', count: 3, id: 'todo', color: 'text-green-600 dark:text-green-400' },
    { icon: Home, label: 'Markdown', count: 4, id: 'markdown', color: 'text-blue-600 dark:text-blue-400' },
    { icon: Home, label: 'Code', count: 2, id: 'code', color: 'text-purple-600 dark:text-purple-400' },
  ];

  return (
    <div className="w-64 h-screen bg-gray-50 dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors duration-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
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
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {/* Quick Access */}
          <div className="mb-6">
            {sidebarItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  "w-full justify-between h-9 px-3 mb-1 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                  selectedWorkspace === item.id && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                )}
                onClick={() => onWorkspaceChange(item.id)}
              >
                <div className="flex items-center">
                  <item.icon className="w-4 h-4 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                  {item.count}
                </Badge>
              </Button>
            ))}
          </div>

          {/* Note Types */}
          <div className="mb-6">
            <Button
              variant="ghost"
              onClick={() => toggleSection('note-types')}
              className="w-full justify-between h-8 px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <span>NOTE TYPES</span>
              <ChevronRight 
                className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  expandedSections.includes('note-types') && "rotate-90"
                )}
              />
            </Button>
            
            {expandedSections.includes('note-types') && (
              <div className="space-y-1 ml-2">
                {noteTypes.map((type) => (
                  <Button
                    key={type.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-between h-9 px-3 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                      selectedWorkspace === type.id && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                    onClick={() => onWorkspaceChange(type.id)}
                  >
                    <div className="flex items-center">
                      <type.icon className={cn("w-4 h-4 mr-3", type.color)} />
                      <span className="text-sm font-medium">{type.label}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {type.count}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* Workspaces */}
          <div className="mb-4">
            <Button
              variant="ghost"
              onClick={() => toggleSection('workspaces')}
              className="w-full justify-between h-8 px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200"
            >
              <span>WORKSPACES</span>
              <ChevronRight 
                className={cn(
                  "w-3 h-3 transition-transform duration-200",
                  expandedSections.includes('workspaces') && "rotate-90"
                )}
              />
            </Button>
            
            {expandedSections.includes('workspaces') && (
              <div className="space-y-1 ml-2">
                {workspaces.map((workspace) => (
                  <Button
                    key={workspace.id}
                    variant="ghost"
                    className={cn(
                      "w-full justify-between h-9 px-3 transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300",
                      selectedWorkspace === workspace.name && "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
                    )}
                    onClick={() => onWorkspaceChange(workspace.name)}
                  >
                    <div className="flex items-center">
                      <div className={cn("w-2 h-2 rounded-full mr-3", workspace.color)} />
                      <span className="text-sm font-medium">{workspace.name}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                      {workspace.noteCount}
                    </Badge>
                  </Button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <Button variant="ghost" className="w-full justify-start h-9 px-3 text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
          <Settings className="w-4 h-4 mr-3" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
};