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
  Camera,
  Plus,
  Grid3X3,
} from '@/lib/icons';
import { useImageToTextStore } from '@/stores/imageToTextStore';

type IconType = React.ElementType;

interface SidebarCounts {
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
}

interface SidebarProps {
  selectedWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
  onNewNote: () => void;
  noteCount: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  sidebarCounts?: SidebarCounts;
}

const quickItems: { icon: IconType; label: string; id: keyof SidebarCounts }[] = [
  { icon: FileText, label: 'All Notes', id: 'all' },
  { icon: Calendar, label: 'Today', id: 'today' },
  { icon: Star, label: 'Starred', id: 'starred' },
];

const predefinedTags: { id: keyof SidebarCounts; label: string; icon: IconType; color: string }[] = [
  { id: 'project', label: 'Project', icon: Rocket, color: 'text-blue-600 dark:text-blue-400' },
  { id: 'coding', label: 'Coding', icon: Code, color: 'text-purple-600 dark:text-purple-400' },
  { id: 'college', label: 'College', icon: GraduationCap, color: 'text-green-600 dark:text-green-400' },
  { id: 'personal', label: 'Personal', icon: User, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'ideas', label: 'Ideas', icon: Lightbulb, color: 'text-yellow-600 dark:text-yellow-400' },
  { id: 'done', label: 'Done', icon: CheckCircle, color: 'text-green-600 dark:text-green-400' },
  { id: 'ongoing', label: 'Ongoing', icon: ClipboardList, color: 'text-orange-600 dark:text-orange-400' },
  { id: 'future', label: 'Future', icon: Eye, color: 'text-indigo-600 dark:text-indigo-400' },
];

type SidebarButtonProps = {
  icon: IconType;
  label: string;
  count?: number;
  iconColor?: string;
  isCollapsed: boolean;
  isSelected: boolean;
  onClick: () => void;
};

const SidebarButton: React.FC<SidebarButtonProps> = ({
  icon: Icon,
  label,
  count,
  iconColor,
  isCollapsed,
  isSelected,
  onClick,
}) => (
  <Button
    variant="ghost"
    className={cn(
      'mb-1 transition-all duration-200 hover-muted text-muted-inv',
      isCollapsed ? 'w-8 h-8 p-0 mx-auto flex justify-center' : 'w-full justify-between h-9 px-3',
      isSelected && 'bg-gray-100 dark:bg-[#333333] text-primary-inv'
    )}
    onClick={onClick}
    title={isCollapsed ? label : undefined}
  >
    {isCollapsed ? (
      <Icon className={cn('w-4 h-4', iconColor)} />
    ) : (
      <>
        <div className="flex items-center">
          <Icon className={cn('w-4 h-4 mr-3', iconColor)} />
          <span className="text-base font-medium">{label}</span>
        </div>
        {count !== undefined && (
          <Badge variant="secondary" className="text-base bg-gray-100 dark:bg-[#333333] text-muted-inv">
            {count}
          </Badge>
        )}
      </>
    )}
  </Button>
);

const ActionButton: React.FC<{
  isCollapsed: boolean;
  icon: IconType;
  label: string;
  onClick: () => void;
  colorClass: string;
}> = ({ isCollapsed, icon: Icon, label, onClick, colorClass }) => (
  <Button
    onClick={onClick}
    className={cn(
      'transition-all duration-300',
      colorClass,
      isCollapsed ? 'w-8 h-8 p-0 rounded-md' : 'w-full'
    )}
    size="sm"
    title={isCollapsed ? label : undefined}
  >
    <Icon className="w-5 h-5" />
    {!isCollapsed && <span className="ml-2 text-base font-medium">{label}</span>}
  </Button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  selectedWorkspace,
  onWorkspaceChange,
  onNewNote,
  noteCount,
  isCollapsed = false,
  onToggleCollapse,
  sidebarCounts,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { openModal: openImageToText } = useImageToTextStore();

  const visibleTags = predefinedTags.filter(tag => (sidebarCounts?.[tag.id] ?? 0) > 0);

  return (
    <div
      className={cn(
        'h-screen surface-panel flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-16' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn('p-4', isCollapsed && 'p-2')}>
        <div
          className={cn(
            'flex items-center mb-4',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {!isCollapsed && <h1 className="text-base font-semibold text-primary-inv">Notes</h1>}
          <div className={cn('flex items-center', isCollapsed ? 'flex-col gap-2' : 'gap-2')}>
            <Button
              onClick={toggleTheme}
              size="sm"
              variant="ghost"
              className={cn('p-2 hover-panel', isCollapsed && 'w-8 h-8')}
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-muted-inv" />
              ) : (
                <Moon className="w-4 h-4 text-muted-inv" />
              )}
            </Button>
            {onToggleCollapse && (
              <Button
                onClick={onToggleCollapse}
                size="sm"
                variant="ghost"
                className={cn('p-2 hover-panel', isCollapsed && 'w-8 h-8')}
                title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {isCollapsed ? (
                  <ChevronRight className="w-4 h-4 text-muted-inv" />
                ) : (
                  <ChevronLeft className="w-4 h-4 text-muted-inv" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* Primary actions */}
        <div className="flex flex-col space-y-2">
          <ActionButton
            isCollapsed={isCollapsed}
            icon={Plus}
            label="New Note"
            onClick={onNewNote}
            colorClass="bg-[#e5ebfa] dark:bg-[#212b3f] text-[#3377FF] hover:bg-[#e5ebfa] dark:hover:bg-[#212b3f]"
          />
          <ActionButton
            isCollapsed={isCollapsed}
            icon={Grid3X3}
            label="Open Canvas"
            onClick={() => onWorkspaceChange('canvas')}
            colorClass="bg-[#f4edf9] dark:bg-[#630ad3]/10 text-[#630ad3] dark:text-white hover:bg-[#f4edf9] dark:hover:bg-[#630ad3]/10"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className={cn('p-2', isCollapsed && 'px-1')}>
          {/* Quick access */}
          <div className="mb-6">
            {quickItems.map(item => (
              <SidebarButton
                key={item.id}
                icon={item.icon}
                label={item.label}
                count={sidebarCounts?.[item.id] ?? (item.id === 'all' ? noteCount : 0)}
                isCollapsed={isCollapsed}
                isSelected={selectedWorkspace === item.id}
                onClick={() => onWorkspaceChange(item.id)}
              />
            ))}
          </div>

          {/* Tools */}
          <div className="mb-6">
            <SidebarButton
              icon={Camera}
              label="Image to Text"
              isCollapsed={isCollapsed}
              isSelected={selectedWorkspace === 'image-to-text'}
              onClick={openImageToText}
            />
          </div>

          {/* Tags */}
          {visibleTags.length > 0 && (
            <div className="mb-4">
              {!isCollapsed && (
                <div className="flex items-center justify-between px-3 mb-2">
                  <span className="text-base font-semibold text-subtle-inv">TAGS</span>
                </div>
              )}
              <div className="space-y-1">
                {visibleTags.map(tag => (
                  <SidebarButton
                    key={tag.id}
                    icon={tag.icon}
                    label={tag.label}
                    count={sidebarCounts?.[tag.id] ?? 0}
                    iconColor={tag.color}
                    isCollapsed={isCollapsed}
                    isSelected={selectedWorkspace === tag.id}
                    onClick={() => onWorkspaceChange(tag.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={cn('border-t border-panel', isCollapsed ? 'p-2' : 'p-4')}>
        <SidebarButton
          icon={Settings}
          label="Settings"
          isCollapsed={isCollapsed}
          isSelected={selectedWorkspace === 'settings'}
          onClick={() => onWorkspaceChange('settings')}
        />
      </div>
    </div>
  );
};
