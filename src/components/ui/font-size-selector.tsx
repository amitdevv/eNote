import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface FontSizeSelectorProps {
  currentSize: number;
  onSizeChange: (size: number) => void;
}

const fontSizes = [
  { value: 12, label: '12px', description: 'sm' },
  { value: 16, label: '16px', description: 'base' },
  { value: 20, label: '20px', description: 'lg' },
  { value: 24, label: '24px', description: 'xl' },
  { value: 28, label: '28px', description: '2xl' },
  { value: 32, label: '32px', description: '3xl' },
  { value: 36, label: '36px', description: '4xl' },
];

export const FontSizeSelector: React.FC<FontSizeSelectorProps> = ({ 
  currentSize, 
  onSizeChange 
}) => {
  return (
    <Select value={currentSize.toString()} onValueChange={(value) => onSizeChange(Number(value))}>
      <SelectTrigger className="w-28 bg-white dark:bg-[#333333] text-gray-900 dark:text-gray-100">
        <SelectValue placeholder="Size" />
      </SelectTrigger>
      <SelectContent className="bg-white dark:bg-[#333333]">
        {fontSizes.map((size) => (
          <SelectItem 
            key={size.value} 
            value={size.value.toString()}
            className="text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-[#1e1e1e]"
          >
            <div className="flex items-center justify-between w-full">
              <span style={{ fontSize: `${Math.min(size.value, 16)}px` }}>{size.label}</span>
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">{size.description}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}; 