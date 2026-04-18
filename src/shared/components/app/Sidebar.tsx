import { Link, NavLink } from 'react-router-dom';
import type { IconSvgElement } from '@hugeicons/react';
import {
  HugeiconsIcon,
  Archive02Icon,
  Note01Icon,
  CheckmarkSquare01Icon,
  Settings01Icon,
  Logout01Icon,
  PlusSignIcon,
} from '@/shared/lib/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '@/features/auth/hooks';
import { useProfile } from '@/features/account/hooks';
import { cn } from '@/shared/lib/cn';
import { Button } from '@/shared/components/ui/button';
import { Tooltip } from '@/shared/components/ui/tooltip';
import { useNotesUI } from '@/features/notes/store';

function Item({
  to,
  icon,
  children,
  disabled,
  onClick,
}: {
  to: string;
  icon: IconSvgElement;
  children: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}) {
  if (disabled) {
    return (
      <div className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-nav text-ink-placeholder cursor-not-allowed select-none">
        <HugeiconsIcon icon={icon} size={16} />
        <span>{children}</span>
        <span className="ml-auto text-micro uppercase tracking-wider text-ink-placeholder">
          soon
        </span>
      </div>
    );
  }
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-nav font-medium transition-colors duration-150 ease-out',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30',
          isActive
            ? 'bg-surface-active text-ink-strong'
            : 'text-ink-muted hover:bg-surface-muted hover:text-ink-strong'
        )
      }
    >
      <HugeiconsIcon icon={icon} size={16} />
      <span>{children}</span>
    </NavLink>
  );
}

export function Sidebar() {
  const { user, signOut } = useAuth();
  const { data: profile } = useProfile();
  const setSidebarOpen = useNotesUI((s) => s.setSidebarOpen);
  const setQuickCaptureOpen = useNotesUI((s) => s.setQuickCaptureOpen);

  const displayName =
    profile?.display_name?.trim() || user?.email?.split('@')[0] || 'eNote';
  const initials = (profile?.display_name || user?.email || '?')
    .slice(0, 2)
    .toUpperCase();
  const avatarUrl = profile?.avatar_url ?? null;
  const [avatarBroken, setAvatarBroken] = useState(false);
  useEffect(() => setAvatarBroken(false), [avatarUrl]);

  function handleCreate() {
    setSidebarOpen(false);
    setQuickCaptureOpen(true);
  }

  const closeDrawer = () => setSidebarOpen(false);

  return (
    <aside className="flex h-full w-[252px] flex-col bg-surface-app">
      <div className="flex h-[60px] items-center gap-2 px-4 pt-3">
        <Link
          to="/notes"
          onClick={closeDrawer}
          className="flex flex-1 items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-surface-muted transition-colors"
        >
          {avatarUrl && !avatarBroken ? (
            <img
              src={avatarUrl}
              onError={() => setAvatarBroken(true)}
              alt=""
              className="size-6 rounded-md object-cover"
            />
          ) : (
            <div className="size-6 rounded-md bg-brand flex items-center justify-center text-micro font-medium text-white">
              {initials}
            </div>
          )}
          <span className="text-nav text-ink-default truncate">{displayName}</span>
        </Link>
        <Tooltip content="New note">
          <Button
            size="icon"
            variant="ghost"
            onClick={handleCreate}
            aria-label="Create note"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={14} />
          </Button>
        </Tooltip>
      </div>

      <nav className="flex flex-col gap-0.5 px-3 mt-2">
        <Item to="/notes" icon={Note01Icon} onClick={closeDrawer}>
          Notes
        </Item>
        <Item to="/archived" icon={Archive02Icon} onClick={closeDrawer}>
          Archived
        </Item>
      </nav>

      <nav className="flex flex-col gap-0.5 px-3 mt-4">
        <Item to="/tasks" icon={CheckmarkSquare01Icon} onClick={closeDrawer}>
          Tasks
        </Item>
      </nav>

      <div className="flex-1" />

      <div className="flex flex-col gap-0.5 px-3 pb-4">
        <Item to="/settings" icon={Settings01Icon} onClick={closeDrawer}>
          Settings
        </Item>
        <button
          onClick={() => signOut()}
          className="flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-nav font-medium text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
        >
          <HugeiconsIcon icon={Logout01Icon} size={16} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
