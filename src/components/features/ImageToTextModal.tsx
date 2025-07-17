import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { createWorker } from "tesseract.js";
import confetti from "canvas-confetti";
import { useImageToTextStore } from "@/stores/imageToTextStore";

interface ImageToTextModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ImageToTextModal: React.FC<ImageToTextModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<
    "upload" | "processing" | "result"
  >("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setExtractedText: setStoreExtractedText } = useImageToTextStore();

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setExtractedText("");
      setCurrentStep("upload");
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
      setExtractedText("");
      setCurrentStep("upload");
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const extractTextFromImage = async () => {
    if (!image) return;

    setIsProcessing(true);
    setProgress(0);
    setCurrentStep("processing");

    const startTime = Date.now();
    const minLoadingTime = 2000; // 2 seconds minimum

    try {
      const worker = await createWorker("eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(m.progress * 100);
          }
        },
      });

      const {
        data: { text },
      } = await worker.recognize(image);
      setExtractedText(text);
      setStoreExtractedText(text);
      await worker.terminate();

      // Ensure minimum 2 seconds loading time
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime < minLoadingTime) {
        await new Promise((resolve) =>
          setTimeout(resolve, minLoadingTime - elapsedTime)
        );
      }

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: [
          "#FF6B6B",
          "#4ECDC4",
          "#45B7D1",
          "#96CEB4",
          "#FFEAA7",
          "#DDA0DD",
          "#98D8C8",
          "#F7DC6F",
          "#BB8FCE",
          "#85C1E9",
          "#F8C471",
          "#82E0AA",
          "#F1948A",
          "#85C1E9",
          "#F7DC6F",
        ],
        startVelocity: 30,
        gravity: 0.8,
        ticks: 200,
      });

      setCurrentStep("result");
    } catch (error) {
      console.error("Error extracting text:", error);
      setExtractedText("Error extracting text from image. Please try again.");
      setCurrentStep("result");
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
        console.error("Failed to copy text:", error);
      }
    }
  };

  const handleDownloadText = () => {
    if (extractedText) {
      const blob = new Blob([extractedText], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "extracted-text.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleClose = () => {
    setImage(null);
    setExtractedText("");
    setCurrentStep("upload");
    setIsProcessing(false);
    setProgress(0);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-xl overflow-hidden p-0 bg-background border border-border shadow-2xl">
        <div className="flex-1 overflow-hidden">
          {/* Header */}
          <div className="px-5 py-3 border-b border-border bg-muted/50">
            <h2 className="text-lg font-semibold text-foreground">
              Image to Text Converter
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Extract text from your images using OCR technology
            </p>
          </div>

          {currentStep === "upload" && (
            <div className="p-6 text-center">
              <div className="w-full max-w-xs mx-auto mb-4">
                <img
                  src="/startpreview.svg"
                  alt="Upload"
                  className="w-full h-auto"
                />
              </div>
              {!image ? (
                <div
                  className="border-2 border-dashed border-muted-foreground/30 hover:border-muted-foreground/50 rounded-lg p-6 transition-all duration-200 bg-muted/30 hover:bg-muted/50 group cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="flex flex-col items-center space-y-3">
                    <div className="p-2 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors dark:bg-green-900/30 dark:group-hover:bg-green-900/50">
                      <svg
                        className="w-5 h-5 text-green-600 dark:text-green-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Drop your image here
                      </p>
                      <p className="text-xs text-muted-foreground">
                        or click to browse files
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-muted/50 rounded-lg p-3 border border-border">
                    <p className="text-xs text-muted-foreground mb-1">
                      Selected file:
                    </p>
                    <p className="text-foreground font-medium text-sm">
                      {image.name}
                    </p>
                  </div>
                  <Button
                    onClick={extractTextFromImage}
                    disabled={isProcessing}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-2 rounded-lg font-medium transition-all duration-200"
                  >
                    <svg
                      className="w-5 h-5 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Extract Text from Image
                  </Button>
                </div>
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

          {currentStep === "processing" && (
            <div className="p-6 text-center">
              <div className="w-full max-w-xs mx-auto mb-4">
                <img
                  src="/loading-conversion.svg"
                  alt="Processing"
                  className="w-full h-auto"
                />
              </div>
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-foreground">
                  Processing your image...
                </h3>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300 relative overflow-hidden"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  {Math.round(progress)}% complete
                </p>
              </div>
            </div>
          )}

          {currentStep === "result" && extractedText && (
            <div className="p-5">
              <div className="mb-3">
                <h3 className="text-sm font-medium text-foreground mb-2">
                  Extracted Text
                </h3>
                <div className="flex gap-2">
                  <Button
                    onClick={handleCopyText}
                    className="flex-1 bg-muted hover:bg-muted/80 text-foreground border border-border rounded-lg py-2 text-sm font-medium transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    {isCopied ? "Copied!" : "Copy"}
                  </Button>
                  <Button
                    onClick={handleDownloadText}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg py-2 text-sm font-medium transition-all duration-200"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                value={extractedText}
                readOnly
                className="min-h-[180px] resize-none border border-border bg-background focus:border-ring focus:ring-1 focus:ring-ring text-xs text-foreground rounded-lg p-3 transition-all duration-200"
                placeholder="Extracted text will appear here..."
              />
              <div className="mt-3 flex justify-center">
                <Button
                  onClick={() => {
                    setImage(null);
                    setExtractedText("");
                    setCurrentStep("upload");
                  }}
                  variant="outline"
                  className="text-xs"
                >
                  Process Another Image
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
