import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Palette } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  currentColor?: string;
  onColorChange: (color: string) => void;
  disabled?: boolean;
}

const predefinedColors = [
  { name: 'Black', value: '#000000' },
  { name: 'Dark Gray', value: '#374151' },
  { name: 'Gray', value: '#6B7280' },
  { name: 'Light Gray', value: '#9CA3AF' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Orange', value: '#F97316' },
  { name: 'Yellow', value: '#EAB308' },
  { name: 'Green', value: '#22C55E' },
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Indigo', value: '#6366F1' },
  { name: 'Purple', value: '#A855F7' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Teal', value: '#14B8A6' },
  { name: 'Cyan', value: '#06B6D4' },
  { name: 'Lime', value: '#84CC16' },
  { name: 'Emerald', value: '#10B981' },
];

export const ColorPicker: React.FC<ColorPickerProps> = ({
  currentColor,
  onColorChange,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleColorSelect = (color: string) => {
    onColorChange(color);
    setOpen(false);
  };

  const clearColor = () => {
    onColorChange('');
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled}
          className="h-8 w-8 p-0 relative"
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
          {currentColor && (
            <div 
              className="absolute bottom-0 left-0 right-0 h-1 rounded-b"
              style={{ backgroundColor: currentColor }}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Text Color</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearColor}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            {predefinedColors.map((color) => (
              <button
                key={color.value}
                onClick={() => handleColorSelect(color.value)}
                className={cn(
                  "w-8 h-8 rounded border-2 transition-all hover:scale-110",
                  currentColor === color.value 
                    ? "border-gray-900 dark:border-gray-100 ring-2 ring-offset-2 ring-gray-400" 
                    : "border-gray-300 dark:border-gray-600 hover:border-gray-400"
                )}
                style={{ backgroundColor: color.value }}
                title={color.name}
              />
            ))}
          </div>
          
          <div className="border-t pt-3">
            <div className="flex items-center gap-2">
              <label htmlFor="custom-color" className="text-xs font-medium">
                Custom:
              </label>
              <input
                id="custom-color"
                type="color"
                value={currentColor || '#000000'}
                onChange={(e) => handleColorSelect(e.target.value)}
                className="w-8 h-8 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}; 