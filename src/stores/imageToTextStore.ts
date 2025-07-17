import { create } from 'zustand';

interface ImageToTextStore {
  isOpen: boolean;
  extractedText: string;
  openModal: () => void;
  closeModal: () => void;
  setExtractedText: (text: string) => void;
  clearExtractedText: () => void;
}

export const useImageToTextStore = create<ImageToTextStore>((set) => ({
  isOpen: false,
  extractedText: '',
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  setExtractedText: (text: string) => set({ extractedText: text }),
  clearExtractedText: () => set({ extractedText: '' }),
})); 