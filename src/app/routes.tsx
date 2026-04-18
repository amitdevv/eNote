import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';
import { Spinner } from '@/shared/components/ui/spinner';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { AppShell } from '@/shared/components/app/AppShell';
import { ErrorBoundary } from '@/shared/components/app/ErrorBoundary';
import { NotesListPage } from '@/features/notes/components/NotesListPage';

// Heavy routes — loaded on demand. NoteDetailPage pulls in TipTap + ProseMirror,
// ArchivedPage and SettingsPage are visited less often.
const NoteDetailPage = lazy(() =>
  import('@/features/notes/components/NoteDetailPage').then((m) => ({ default: m.NoteDetailPage }))
);
const ArchivedPage = lazy(() =>
  import('@/features/notes/components/ArchivedPage').then((m) => ({ default: m.ArchivedPage }))
);
const SettingsPage = lazy(() =>
  import('@/features/settings/components/SettingsPage').then((m) => ({ default: m.SettingsPage }))
);
const TasksPage = lazy(() =>
  import('@/features/tasks/components/TasksPage').then((m) => ({ default: m.TasksPage }))
);

function LoadingFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <Spinner />
    </div>
  );
}

function ProtectedShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-app">
        <Spinner />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return (
    <ErrorBoundary>
      <AppShell>
        <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
      </AppShell>
    </ErrorBoundary>
  );
}

export function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-app">
        <Spinner />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/notes" replace /> : <LoginPage />} />
      <Route
        path="/notes"
        element={
          <ProtectedShell>
            <NotesListPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/notes/:noteId"
        element={
          <ProtectedShell>
            <NoteDetailPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/archived"
        element={
          <ProtectedShell>
            <ArchivedPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedShell>
            <TasksPage />
          </ProtectedShell>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedShell>
            <SettingsPage />
          </ProtectedShell>
        }
      />
      <Route path="/" element={<Navigate to={user ? '/notes' : '/login'} replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
