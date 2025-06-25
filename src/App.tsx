
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { NotesProvider } from '@/contexts/NotesContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { NotesApp } from '@/components/notes/NotesApp';
import { EditorPage } from '@/components/notes/EditorPage';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <NotesProvider>
        <div className="min-h-screen bg-white dark:bg-[#171717] text-gray-900 dark:text-gray-100 transition-colors duration-200">
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/notes" element={<NotesApp />} />
              <Route path="/editor" element={<EditorPage />} />
              <Route path="/editor/:noteId" element={<EditorPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
          <Toaster />
        </div>
      </NotesProvider>
    </ThemeProvider>
  );
}

export default App;