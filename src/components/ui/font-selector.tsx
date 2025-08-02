import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FontSelectorProps {
  currentFont: string;
  onFontChange: (font: string) => void;
}

const fonts = [
  { value: 'Inter', label: 'Inter', style: 'font-sans' },
  { value: 'Manrope', label: 'Manrope', style: 'font-sans' },
  { value: 'Fira Code', label: 'Fira Code', style: 'font-mono' },
  { value: 'Recursive', label: 'Recursive', style: 'font-sans' },
  { value: 'Open Sans', label: 'Open Sans', style: 'font-sans' },
  { value: 'Lato', label: 'Lato', style: 'font-sans' },
  { value: 'PT Sans', label: 'PT Sans', style: 'font-sans' },
  { value: 'Kalam', label: 'Kalam', style: 'font-sans' },
  { value: 'Inconsolata', label: 'Inconsolata', style: 'font-mono' },
  { value: 'Patrick Hand', label: 'Patrick Hand', style: 'font-sans' },
  { value: 'Handlee', label: 'Handlee', style: 'font-sans' },
  { value: 'Comfortaa', label: 'Comfortaa', style: 'font-sans' },
];

export const FontSelector: React.FC<FontSelectorProps> = ({ 
  currentFont, 
  onFontChange 
}) => {
  return (
    <Select value={currentFont} onValueChange={onFontChange}>
      <SelectTrigger className="w-40 bg-white dark:bg-[#333333]   text-gray-900 dark:text-gray-100">
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-[#333333]  ">
        {fonts.map((font) => (
          <SelectItem 
            key={font.value} 
            value={font.value}
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
          >
            <div 
              style={{ fontFamily: `"${font.value}", ${font.style === 'font-mono' ? 'monospace' : 'sans-serif'}` }}
              className="flex items-center"
            >
              <span>{font.label}</span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">Aa</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}; 