import React from 'react';
import { cn } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Star,
  FileText,
  Calendar,
  Settings,
  Sun,
  Moon,
  ChevronLeft,
  ChevronRight,
  Camera,
  Plus,
  Grid3X3,
  Hash,
} from '@/lib/icons';
import { useImageToTextStore } from '@/stores/imageToTextStore';

type IconType = React.ElementType;

interface SidebarProps {
  selectedWorkspace: string;
  onWorkspaceChange: (workspace: string) => void;
  onNewNote: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  usedTags?: string[];
}

const navItems: { icon: IconType; label: string; id: string }[] = [
  { icon: FileText, label: 'All notes', id: 'all' },
  { icon: Star, label: 'Starred', id: 'starred' },
  { icon: Calendar, label: 'Today', id: 'today' },
  { icon: Grid3X3, label: 'Canvas', id: 'canvas' },
];

const predefinedTags = [
  { id: 'project', label: 'Project' },
  { id: 'coding', label: 'Coding' },
  { id: 'college', label: 'College' },
  { id: 'personal', label: 'Personal' },
  { id: 'ideas', label: 'Ideas' },
  { id: 'done', label: 'Done' },
  { id: 'ongoing', label: 'Ongoing' },
  { id: 'future', label: 'Future' },
];

type RowProps = {
  icon: IconType;
  label: string;
  isCollapsed: boolean;
  isSelected?: boolean;
  onClick: () => void;
};

const Row: React.FC<RowProps> = ({ icon: Icon, label, isCollapsed, isSelected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    title={isCollapsed ? label : undefined}
    className={cn(
      'group flex items-center rounded-md transition-colors text-sm',
      'text-muted-inv hover-muted',
      isCollapsed ? 'w-10 h-10 justify-center mx-auto' : 'w-full h-9 px-3 gap-3',
      isSelected && 'bg-gray-100 dark:bg-[#2a2a2a] text-primary-inv'
    )}
  >
    <Icon className="w-[18px] h-[18px] shrink-0" />
    {!isCollapsed && <span className="truncate">{label}</span>}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  selectedWorkspace,
  onWorkspaceChange,
  onNewNote,
  isCollapsed = false,
  onToggleCollapse,
  usedTags = [],
}) => {
  const { theme, toggleTheme } = useTheme();
  const { openModal: openImageToText } = useImageToTextStore();

  const tagsInUse = predefinedTags.filter(t => usedTags.includes(t.id));

  return (
    <div
      className={cn(
        'h-screen surface-panel flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-14' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center h-14 px-3', isCollapsed && 'justify-center px-0')}>
        {!isCollapsed && (
          <span className="flex-1 text-[15px] font-semibold text-primary-inv">eNote</span>
        )}
        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="w-8 h-8 flex items-center justify-center rounded-md hover-muted text-muted-inv"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Primary action */}
      <div className={cn('px-2', isCollapsed && 'px-0')}>
        <Row
          icon={Plus}
          label="New note"
          isCollapsed={isCollapsed}
          onClick={onNewNote}
        />
      </div>

      {/* Main navigation */}
      <nav className={cn('flex-1 overflow-y-auto scrollbar-hide px-2 py-2', isCollapsed && 'px-0')}>
        <div className="flex flex-col gap-0.5">
          {navItems.map(item => (
            <Row
              key={item.id}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
              isSelected={selectedWorkspace === item.id}
              onClick={() => onWorkspaceChange(item.id)}
            />
          ))}
          <Row
            icon={Camera}
            label="Image to text"
            isCollapsed={isCollapsed}
            onClick={openImageToText}
          />
        </div>

        {/* Tags */}
        {tagsInUse.length > 0 && (
          <div className="mt-6">
            {!isCollapsed && (
              <div className="px-3 mb-1.5 text-xs font-medium uppercase tracking-wide text-subtle-inv">
                Tags
              </div>
            )}
            <div className="flex flex-col gap-0.5">
              {tagsInUse.map(tag => (
                <Row
                  key={tag.id}
                  icon={Hash}
                  label={tag.label}
                  isCollapsed={isCollapsed}
                  isSelected={selectedWorkspace === tag.id}
                  onClick={() => onWorkspaceChange(tag.id)}
                />
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className={cn('px-2 py-2 border-t border-panel flex flex-col gap-0.5', isCollapsed && 'px-0')}>
        <Row
          icon={theme === 'dark' ? Sun : Moon}
          label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          isCollapsed={isCollapsed}
          onClick={toggleTheme}
        />
        <Row
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
