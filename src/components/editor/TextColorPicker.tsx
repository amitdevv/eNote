import React from 'react';
import { Editor } from '@tiptap/react';

interface TextColorPickerProps {
  editor: Editor;
  range: any;
  onClose: () => void;
}

const colors = [
  { name: 'Black', value: '#000000' },
  { name: 'Red', value: '#dc2626' },
  { name: 'Orange', value: '#ea580c' },
  { name: 'Yellow', value: '#ca8a04' },
  { name: 'Green', value: '#16a34a' },
  { name: 'Blue', value: '#2563eb' },
  { name: 'Purple', value: '#9333ea' },
  { name: 'Pink', value: '#db2777' },
  { name: 'Gray', value: '#6b7280' },
];

export const TextColorPicker: React.FC<TextColorPickerProps> = ({ editor, range, onClose }) => {
  const handleColorSelect = (color: string) => {
    try {
      editor.chain().focus().deleteRange(range).setColor(color).run();
    } catch {
      // Fallback: insert colored text
      editor.chain()
        .focus()
        .deleteRange(range)
        .insertContent(`<span style="color: ${color}">colored text</span>`)
        .run();
    }
    onClose();
  };

  const handleCustomColor = () => {
    const customColor = prompt('Enter custom color (e.g., #ff0000, rgb(255,0,0)):');
    if (customColor) {
      handleColorSelect(customColor);
    }
  };

  return (
    <div className="z-50 p-3 bg-white dark:bg-[#333333] border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
      <div className="mb-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
        Text Colors
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {colors.map((color) => (
          <button
            key={color.value}
            onClick={() => handleColorSelect(color.value)}
            className="flex items-center space-x-2 p-2 rounded hover:bg-gray-100 dark:hover:bg-[#1e1e1e] transition-colors"
            title={color.name}
          >
            <div
              className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600"
              style={{ backgroundColor: color.value }}
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">{color.name}</span>
          </button>
        ))}
      </div>
      <div className="border-t border-gray-200 dark:border-gray-600 pt-2">
        <button
          onClick={handleCustomColor}
          className="w-full text-left p-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#1e1e1e] rounded transition-colors"
        >
          Custom color...
        </button>
      </div>
    </div>
  );
};

export default TextColorPicker; 