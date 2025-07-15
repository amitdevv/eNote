import React, { useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

import { useAIStore, ChatMessage } from '@/stores/aiStore';
import { APIKeyDialog } from '@/components/ai/APIKeyDialog';
import { MarkdownRenderer } from '@/components/ai/MarkdownRenderer';
import { checkAPIConfiguration, hasFallbackApiKey } from '@/lib/gemini';
import { cn } from '@/lib/utils';
import { 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  FileText, 
  FileSearch,
  Lightbulb, 
  Loader2,
  User,
  Settings,
  Key,
  Copy,
  Check
} from 'lucide-react';
import { format } from 'date-fns';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy text:', error);
    }
  };
  
  return (
    <div className={cn(
      "flex gap-3 mb-6",
      isUser ? "justify-end" : "justify-start"
    )}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-md">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 break-words shadow-sm",
        isUser 
          ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-br-md" 
          : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-bl-md border border-gray-200 dark:border-gray-700"
      )}>
        {message.isGenerating ? (
          <div className="flex items-center gap-2 py-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm opacity-70">AI is thinking...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
            ) : (
              <MarkdownRenderer 
                content={message.content}
                className="text-sm leading-relaxed"
              />
            )}
            <div className="flex items-center justify-between">
              <p className="text-xs opacity-60">
                {format(message.timestamp, 'HH:mm')}
              </p>
              {!isUser && message.content.trim() && !message.isGenerating && (
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleCopy}
                    size="sm"
                    variant="ghost"
                    className="text-xs h-6 px-2 opacity-80 hover:opacity-100"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-green-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0 shadow-md">
          <User className="w-4 h-4 text-gray-600 dark:text-gray-300" />
        </div>
      )}
    </div>
  );
};

const QuickActionCard: React.FC<{
  action: { id: string; label: string; description: string; action: () => void };
  isDisabled?: boolean;
}> = ({ action, isDisabled }) => (
  <button
    onClick={action.action}
    disabled={isDisabled}
    className={cn(
      "p-3 rounded-xl border text-left transition-all duration-200 w-full mx-4",
      "hover:bg-gradient-to-r hover:from-emerald-50 hover:to-green-50 dark:hover:from-emerald-950/30 dark:hover:to-green-950/30",
      "hover:border-emerald-200 dark:hover:border-emerald-700 hover:shadow-sm",
      "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50",
      isDisabled && "opacity-50 cursor-not-allowed"
    )}
  >
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center flex-shrink-0">
        {action.id === 'plan-day' && <Calendar className="w-4 h-4 text-white" />}
        {action.id === 'summarize-current' && <FileSearch className="w-4 h-4 text-white" />}
        {action.id === 'summarize-all' && <FileText className="w-4 h-4 text-white" />}
        {action.id === 'generate-ideas' && <Lightbulb className="w-4 h-4 text-white" />}
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">
          {action.label}
        </h4>
      </div>
    </div>
  </button>
);

export const AISidebar: React.FC<AISidebarProps> = ({ isOpen, onClose }) => {
  const {
    messages,
    currentMessage,
    isGenerating,
    quickActions,
    setCurrentMessage,
    sendMessage,
  } = useAIStore();

  const [showAPIKeyDialog, setShowAPIKeyDialog] = React.useState(false);
  const [isAPIConfigured, setIsAPIConfigured] = React.useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Check API configuration when sidebar opens
  React.useEffect(() => {
    if (isOpen) {
      setIsAPIConfigured(checkAPIConfiguration());
    }
  }, [isOpen]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when sidebar opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isGenerating) return;
    
    await sendMessage(currentMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-[#1a1a1a] border-l border-gray-200 dark:border-gray-800 z-50 flex flex-col transition-all duration-300 ease-in-out shadow-xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">AI Assistant</h2>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAPIKeyDialog(true)}
            className="h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            title="Configure API Key"
          >
            <Settings className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 w-9 p-0 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full"
            title="Close Chat"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 flex flex-col min-h-0">
        <ScrollArea className="flex-1 p-4">
          {!isAPIConfigured && !hasFallbackApiKey() ? (
            /* API Setup Required */
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mx-auto mb-4">
                <Key className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                API Key Required
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                To use AI features, you need to configure your Google Gemini API key.
              </p>
              <Button
                onClick={() => setShowAPIKeyDialog(true)}
                className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
              >
                <Key className="w-4 h-4 mr-2" />
                Configure API Key
              </Button>
            </div>
          ) : messages.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-6">
                <h3 className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  What would you like to explore?
                </h3>
              </div>

              {/* Quick Actions */}
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <QuickActionCard
                    key={action.id}
                    action={action}
                    isDisabled={isGenerating}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              {messages.map((message) => (
                <MessageBubble key={message.id} message={message} />
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>
      </div>

      {/* Chat Input */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              ref={inputRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isAPIConfigured || hasFallbackApiKey() ? "Type your message..." : "Configure API key to start chatting..."}
              disabled={isGenerating || (!isAPIConfigured && !hasFallbackApiKey())}
              className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded-xl py-3 px-4 text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {isGenerating && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>AI is typing...</span>
              </div>
            )}
          </div>
          <Button
            onClick={(isAPIConfigured || hasFallbackApiKey()) ? handleSendMessage : () => setShowAPIKeyDialog(true)}
            disabled={(isAPIConfigured || hasFallbackApiKey()) && (!currentMessage.trim() || isGenerating)}
            size="sm"
            className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white px-4 py-3 rounded-xl shadow-sm transition-all duration-200"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (isAPIConfigured || hasFallbackApiKey()) ? (
              <Send className="w-4 h-4" />
            ) : (
              <Key className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* API Key Dialog */}
      <APIKeyDialog
        open={showAPIKeyDialog}
        onOpenChange={(open) => {
          setShowAPIKeyDialog(open);
          if (!open) {
            // Recheck API configuration after dialog closes
            setIsAPIConfigured(checkAPIConfiguration());
          }
        }}
      />
    </div>
  );
}; 