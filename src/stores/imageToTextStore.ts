import { create } from 'zustand';

interface ImageToTextStore {
  isOpen: boolean;
  extractedText: string;
  isProcessing: boolean;
  currentStep: 'upload' | 'processing' | 'result';
  openModal: () => void;
  closeModal: () => void;
  setExtractedText: (text: string) => void;
  clearExtractedText: () => void;
  setProcessing: (processing: boolean) => void;
  setCurrentStep: (step: 'upload' | 'processing' | 'result') => void;
}

export const useImageToTextStore = create<ImageToTextStore>((set) => ({
  isOpen: false,
  extractedText: '',
  isProcessing: false,
  currentStep: 'upload',
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, currentStep: 'upload', extractedText: '', isProcessing: false }),
  setExtractedText: (text: string) => set({ extractedText: text }),
  clearExtractedText: () => set({ extractedText: '' }),
  setProcessing: (processing: boolean) => set({ isProcessing: processing }),
  setCurrentStep: (step: 'upload' | 'processing' | 'result') => set({ currentStep: step }),
}));