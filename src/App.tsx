import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { FocusModeProvider } from '@/contexts/FocusModeContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import LoginPage from '@/components/auth/LoginPage';
import { Toaster } from '@/components/ui/toaster';
import { Loader2 } from 'lucide-react';
import RoomCanvas from './components/layout/MemoryPalace';
import './App.css';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <>{children}</>;
};

// Main app content
const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white dark:bg-[#171717] text-gray-900 dark:text-gray-100 transition-colors duration-200">
      <Router>
        <Routes>
          {/* Public landing page - only show if not authenticated */}
          <Route 
            path="/" 
            element={user ? <Navigate to="/notes" replace /> : <LandingPage />} 
          />
          
          {/* Protected routes - require authentication */}
          <Route 
            path="/notes" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/editor/:noteId" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/memory-palace" 
            element={
              <ProtectedRoute>
                <RoomCanvas/>
              </ProtectedRoute>
            } 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
      <Toaster />
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FocusModeProvider>
          <AppContent />
        </FocusModeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;