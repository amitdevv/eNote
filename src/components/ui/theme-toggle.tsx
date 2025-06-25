import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  className,
  size = 'default'
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size={size}
      onClick={toggleTheme}
      className={cn(
        "border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800",
        className
      )}
    >
      {theme === 'light' ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}; 