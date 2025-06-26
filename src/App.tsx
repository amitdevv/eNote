
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LandingPage } from '@/components/landing/LandingPage';
import { AppLayout } from '@/components/layout/AppLayout';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-white dark:bg-[#171717] text-gray-900 dark:text-gray-100 transition-colors duration-200">
        <Router>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/notes" element={<AppLayout />} />
            <Route path="/editor" element={<AppLayout />} />
            <Route path="/editor/:noteId" element={<AppLayout />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;