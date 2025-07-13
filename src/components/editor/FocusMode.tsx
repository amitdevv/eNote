import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import TipTapEditor from './TipTapEditor';

interface FocusModeProps {
  content: string;
  onChange: (content: string) => void;
  fontFamily?: string;
  fontSize?: number;
  onExit: () => void;
  isActive: boolean;
}



const FocusMode: React.FC<FocusModeProps> = ({
  content,
  onChange,
  fontFamily = 'Fira Code',
  fontSize = 20,
  onExit,
  isActive
}) => {
  // Auto-enter fullscreen when focus mode is activated
  useEffect(() => {
    const enterFullscreen = async () => {
      if (isActive && document.documentElement.requestFullscreen) {
        try {
          await document.documentElement.requestFullscreen();
        } catch (error) {
          console.log('Could not enter fullscreen:', error);
        }
      }
    };

    const exitFullscreen = async () => {
      if (!isActive && document.fullscreenElement) {
        try {
          await document.exitFullscreen();
        } catch (error) {
          console.log('Could not exit fullscreen:', error);
        }
      }
    };

    // Listen for fullscreen changes
    const handleFullscreenChange = () => {
      // If user exits fullscreen manually (F11, Esc, etc.), exit focus mode
      if (isActive && !document.fullscreenElement) {
        onExit();
      }
    };

    if (isActive) {
      enterFullscreen();
      document.addEventListener('fullscreenchange', handleFullscreenChange);
    } else {
      exitFullscreen();
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isActive, onExit]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape - Exit focus mode and fullscreen
      if (e.key === 'Escape') {
        e.preventDefault();
        onExit();
      }
    };

    if (isActive) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isActive, onExit]);



  if (!isActive) return null;

  return (
    <div className="fixed inset-0 z-50 bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100">
      {/* Small Exit Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="h-8 w-8 p-0 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full opacity-50 hover:opacity-100 transition-opacity"
          title="Exit Focus Mode (Esc)"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Scrollable Content Area */}
      <div className="h-full overflow-y-auto">
        <div className="min-h-full flex justify-center">
          <div className="w-full max-w-6xl px-8 py-16">
            <TipTapEditor
              content={content}
              onChange={onChange}
              fontFamily={fontFamily}
              fontSize={fontSize}
              placeholder="Start writing... Press Escape to exit focus mode."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FocusMode; 