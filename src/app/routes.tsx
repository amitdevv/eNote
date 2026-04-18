import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from '@/features/auth/hooks';
import { Spinner } from '@/shared/components/ui/spinner';
import { LoginPage } from '@/features/auth/components/LoginPage';
import { AppShell } from '@/shared/components/app/AppShell';
import { ErrorBoundary } from '@/shared/components/app/ErrorBoundary';
import { NotesListPage } from '@/features/notes/components/NotesListPage';
import { NoteDetailPage } from '@/features/notes/components/NoteDetailPage';
import { ArchivedPage } from '@/features/notes/components/ArchivedPage';
import { SettingsPage } from '@/features/settings/components/SettingsPage';

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
      <AppShell>{children}</AppShell>
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
