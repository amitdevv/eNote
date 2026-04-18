import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { CommandMenu } from './CommandMenu';
import { PageTransition } from './PageTransition';
import { useGlobalShortcuts } from '@/shared/hooks/useGlobalShortcuts';
import { useApplyDensity } from '@/features/settings/hooks';
import { useMediaQuery } from '@/shared/hooks/useMediaQuery';
import { useNotesUI } from '@/features/notes/store';
import { HugeiconsIcon, MoreHorizontalIcon } from '@/shared/lib/icons';

export function AppShell({ children }: { children: ReactNode }) {
  useGlobalShortcuts();
  useApplyDensity();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const sidebarOpen = useNotesUI((s) => s.sidebarOpen);
  const setSidebarOpen = useNotesUI((s) => s.setSidebarOpen);

  return (
    <div className="flex h-screen w-screen bg-surface-app text-ink-default font-inter overflow-hidden">
      {/* Desktop sidebar */}
      {!isMobile && <Sidebar />}

      {/* Mobile drawer */}
      {isMobile && (
        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/25"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                className="fixed left-0 top-0 bottom-0 z-50 shadow-lg"
                initial={{ x: -260 }}
                animate={{ x: 0 }}
                exit={{ x: -260 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <Sidebar />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      )}

      <main className="flex-1 min-w-0 p-2">
        {isMobile && (
          <div className="flex items-center gap-2 h-10 px-2">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink-strong transition-colors"
            >
              <HugeiconsIcon icon={MoreHorizontalIcon} size={18} />
            </button>
          </div>
        )}
        <div className="h-full rounded-xl border border-line-subtle bg-surface-panel shadow-sm overflow-hidden flex flex-col">
          <AnimatePresence mode="wait" initial={false}>
            <PageTransition keyId={location.pathname}>{children}</PageTransition>
          </AnimatePresence>
        </div>
      </main>

      <CommandMenu />
    </div>
  );
}
