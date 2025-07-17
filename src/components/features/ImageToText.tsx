import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Upload, 
  FileImage, 
  Copy, 
  Check, 
  Loader2, 
  X,
  Image as ImageIcon,
  Download
} from 'lucide-react';
import { createWorker } from 'tesseract.js';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';

interface ImageToTextProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageToText: React.FC<ImageToTextProps> = ({ isOpen, onClose }) => {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [extractedText, setExtractedText] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedText('');
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      setExtractedText('');
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const extractTextFromImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);

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
      
      // Trigger confetti animation when text extraction is successful
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [
          '#FF6B6B', // Red
          '#4ECDC4', // Teal
          '#45B7D1', // Blue
          '#96CEB4', // Mint
          '#FFEAA7', // Yellow
          '#DDA0DD', // Plum
          '#98D8C8', // Sea Green
          '#F7DC6F', // Golden Yellow
          '#BB8FCE', // Purple
          '#85C1E9', // Sky Blue
          '#F8C471', // Orange
          '#82E0AA', // Light Green
          '#F1948A', // Salmon
          '#85C1E9', // Light Blue
          '#F7DC6F', // Gold
        ],
        startVelocity: 30,
        gravity: 0.8,
        ticks: 200,
      });
    } catch (error) {
      console.error('Error extracting text:', error);
      setExtractedText('Error extracting text from image. Please try again.');
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

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    setExtractedText('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-50 dark:bg-[#171717] border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-2xl">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-white dark:bg-[#171717] backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <ImageIcon className="w-4 h-4" />
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Image to Text</h2>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
          title="Close"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#171717] min-h-0">
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-4">
            {/* Upload Section */}
            <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-[#171717]">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload Image
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {!imagePreview ? (
                  <div 
                    className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-green-400 dark:hover:border-green-500 transition-colors bg-gray-50 dark:bg-[#171717]"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                  >
                    <FileImage className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      Drop an image here or click to browse
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      size="sm"
                      className="mt-2"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Image
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Uploaded"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                      <Button
                        onClick={handleRemoveImage}
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2 h-8 w-8 p-0 bg-white dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={extractTextFromImage}
                        disabled={isProcessing}
                        className="flex-1  text-white"
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Extract Text
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Processing image...</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-green-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </CardContent>
            </Card>

            {/* Results Section */}
            {extractedText && (
              <Card className="border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-[#171717]">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    <span>Extracted Text</span>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleCopyText}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3 h-3 mr-1" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3 mr-1" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={handleDownloadText}
                        size="sm"
                        variant="outline"
                        className="h-8 px-3"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Download
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <Textarea
                      value={extractedText}
                      readOnly
                      className="min-h-[180px] resize-none border-0 bg-transparent focus:ring-0 text-sm"
                      placeholder="Extracted text will appear here..."
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}; 