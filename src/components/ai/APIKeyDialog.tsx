import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { saveApiKey, initializeGemini, checkAPIConfiguration, hasUserApiKey, hasFallbackApiKey } from '@/lib/gemini';
import { ExternalLink, Key, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

interface APIKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const APIKeyDialog: React.FC<APIKeyDialogProps> = ({ open, onOpenChange }) => {
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [showFallbackInfo, setShowFallbackInfo] = useState(false);

  useEffect(() => {
    // Check if API key is already configured
    const userKey = localStorage.getItem('gemini-api-key');
    if (userKey) {
      setApiKey(userKey);
    }
    setIsConfigured(checkAPIConfiguration());
    setShowFallbackInfo(hasFallbackApiKey() && !hasUserApiKey());
  }, [open]);

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsValidating(true);
    
    try {
      // Save the API key
      saveApiKey(apiKey.trim());
      
      // Try to initialize Gemini with the new key
      const success = initializeGemini(apiKey.trim());
      
      if (success) {
        setIsConfigured(true);
        toast.success('API key saved successfully!');
        onOpenChange(false);
      } else {
        toast.error('Invalid API key. Please check and try again.');
      }
    } catch (error) {
      console.error('Error saving API key:', error);
      toast.error('Failed to save API key');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemove = () => {
    setApiKey('');
    setIsConfigured(false);
    localStorage.removeItem('gemini-api-key');
    toast.success('API key removed');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            {hasUserApiKey() ? 'Manage API Key' : 'Configure API Key'}
          </DialogTitle>
          <DialogDescription>
            {hasFallbackApiKey() && !hasUserApiKey() 
              ? 'AI features are ready! Optionally configure your own API key for unlimited usage.'
              : 'Enter your Google Gemini API key to enable AI features.'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* API Key Input */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="font-mono"
            />
          </div>

          {/* Status Indicators */}
          {isConfigured && hasUserApiKey() && (
            <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
              <AlertDescription className="text-green-700 dark:text-green-300">
                Your custom API key is configured and working!
              </AlertDescription>
            </Alert>
          )}

          {showFallbackInfo && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                <div>
                  <p className="font-medium mb-1">AI features are ready!</p>
                  <p className="text-sm">Using default API key. Configure your own key below for unlimited usage and better rate limits.</p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Instructions */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-2">
                <p>To get your Gemini API key:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>Visit Google AI Studio</li>
                  <li>Create a new API key</li>
                  <li>Copy and paste it above</li>
                </ol>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-blue-600 dark:text-blue-400"
                  onClick={() => window.open('https://makersuite.google.com/app/apikey', '_blank')}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Get API Key
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Security Note */}
          <Alert className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
            <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            <AlertDescription className="text-yellow-700 dark:text-yellow-300">
              Your API key is stored locally in your browser and never sent to our servers.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {isConfigured && (
            <Button
              variant="outline"
              onClick={handleRemove}
              className="w-full sm:w-auto"
            >
              Remove Key
            </Button>
          )}
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 sm:flex-none"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isValidating || !apiKey.trim()}
              className="flex-1 sm:flex-none"
            >
              {isValidating ? 'Validating...' : 'Save'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 