import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { CommandMenu } from './CommandMenu';
import { PageTransition } from './PageTransition';
import { useGlobalShortcuts } from '@/shared/hooks/useGlobalShortcuts';
import { useApplyDensity } from '@/features/settings/hooks';

export function AppShell({ children }: { children: ReactNode }) {
  useGlobalShortcuts();
  useApplyDensity();
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen bg-surface-app text-ink-default font-inter overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-2">
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
