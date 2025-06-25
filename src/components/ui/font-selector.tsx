import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FontSelectorProps {
  currentFont: string;
  onFontChange: (font: string) => void;
}

const fonts = [
  { value: 'Inter', label: 'Inter', style: 'font-sans' },
  { value: 'Roboto', label: 'Roboto', style: 'font-sans' },
  { value: 'Open Sans', label: 'Open Sans', style: 'font-sans' },
  { value: 'Lato', label: 'Lato', style: 'font-sans' },
  { value: 'Poppins', label: 'Poppins', style: 'font-sans' },
  { value: 'Nunito', label: 'Nunito', style: 'font-sans' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', style: 'font-sans' },
  { value: 'Montserrat', label: 'Montserrat', style: 'font-sans' },
  { value: 'Georgia', label: 'Georgia', style: 'font-serif' },
  { value: 'Times New Roman', label: 'Times New Roman', style: 'font-serif' },
  { value: 'Merriweather', label: 'Merriweather', style: 'font-serif' },
  { value: 'JetBrains Mono', label: 'JetBrains Mono', style: 'font-mono' },
  { value: 'System Default', label: 'System Default', style: 'font-sans' },
];

export const FontSelector: React.FC<FontSelectorProps> = ({ 
  currentFont, 
  onFontChange 
}) => {
  return (
    <Select value={currentFont} onValueChange={onFontChange}>
      <SelectTrigger className="w-40 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100">
        <SelectValue placeholder="Select font" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        {fonts.map((font) => (
          <SelectItem 
            key={font.value} 
            value={font.value}
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <div 
              style={{ fontFamily: font.value === 'System Default' ? 'system-ui' : font.value }}
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