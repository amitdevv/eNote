import React, { createContext, useContext, useState, useCallback } from 'react';

interface FocusModeContextType {
  focusMode: boolean;
  toggleFocusMode: () => void;
  setFocusMode: (value: boolean) => void;
}

const FocusModeContext = createContext<FocusModeContextType | undefined>(undefined);

export const useFocusMode = () => {
  const context = useContext(FocusModeContext);
  if (context === undefined) {
    throw new Error('useFocusMode must be used within a FocusModeProvider');
  }
  return context;
};

interface FocusModeProviderProps {
  children: React.ReactNode;
}

export const FocusModeProvider: React.FC<FocusModeProviderProps> = ({ children }) => {
  const [focusMode, setFocusMode] = useState(false);

  const toggleFocusMode = useCallback(() => {
    setFocusMode(prev => !prev);
  }, []);

  const value = {
    focusMode,
    toggleFocusMode,
    setFocusMode
  };

  return (
    <FocusModeContext.Provider value={value}>
      {children}
    </FocusModeContext.Provider>
  );
}; 