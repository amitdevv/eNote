import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { createWorker } from 'tesseract.js';
import confetti from 'canvas-confetti';

interface ImageToTextModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageToTextModal: React.FC<ImageToTextModalProps> = ({ isOpen, onClose }) => {
  const [image, setImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'upload' | 'processing' | 'result'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setExtractedText('');
      setCurrentStep('upload');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setExtractedText('');
      setCurrentStep('upload');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const extractTextFromImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep('processing');

    const startTime = Date.now();
    const minLoadingTime = 2000; // 2 seconds minimum

    try {
      const worker = await createWorker('eng', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(m.progress * 100);
          }
        },
      });

      const { data: { text } } = await worker.recognize(image);
      setExtractedText(text);
      await worker.terminate();
      
      // Ensure minimum 2 seconds loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime));
      }
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
          '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#F7DC6F',
        ],
        startVelocity: 30,
        gravity: 0.8,
        ticks: 200,
      });

      setCurrentStep('result');
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractedText('Error extracting text from image. Please try again.');
      setCurrentStep('result');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const handleCopyText = async () => {
    if (extractedText) {
      try {
        await navigator.clipboard.writeText(extractedText);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy text:', error);
      }
    }
  };

  const handleDownloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'extracted-text.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    setImage(null);
    setExtractedText('');
    setCurrentStep('upload');
    setIsProcessing(false);
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg overflow-hidden p-0 bg-[#171717] border-0">
        <div className="flex-1 overflow-hidden">
          {currentStep === 'upload' && (
            <div className="p-8 text-center">
              <div className="w-full max-w-md mx-auto mb-8">
                <img src="/startpreview.svg" alt="Upload" className="w-full h-auto" />
              </div>
              {!image ? (
                <div 
                  className="border-2 border-dashed border-gray-600 rounded-lg p-6"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                >
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full bg-gray-200 text-black"
                  >
                    upload image
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={extractTextFromImage}
                  disabled={isProcessing}
                  className="w-full bg-gray-200 text-black"
                >
                  Extract Text
                </Button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          )}

          {currentStep === 'processing' && (
            <div className="p-8 text-center">
              <div className="w-full max-w-md mx-auto mb-8">
                <img src="/loading-conversion.svg" alt="Processing" className="w-full h-auto" />
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {currentStep === 'result' && extractedText && (
            <div className="p-8">
              <div className="flex gap-2 mb-4">
                <Button
                  onClick={handleCopyText}
                  className="flex-1 bg-gray-200 text-black"
                >
                  {isCopied ? 'Copied!' : 'copy'}
                </Button>
                <Button
                  onClick={handleDownloadText}
                  className="flex-1 bg-gray-200 text-black"
                >
                  download
                </Button>
              </div>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[200px] resize-none border border-gray-700 bg-transparent focus:ring-0 text-sm text-gray-100"
                placeholder="Extracted text will appear here..."
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 