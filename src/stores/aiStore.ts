import { create } from 'zustand';
import { chatWithAI, generateNote as generateNoteService, summarizeNotes as summarizeNotesService, summarizeContent, planDay as planDayService, checkAPIConfiguration } from '@/services/aiService';
import { hasFallbackApiKey } from '@/lib/gemini';
import { useNotesStore } from '@/stores/notesStore';
import { useEditorStore } from '@/stores/editorStore';
import { toast } from 'sonner';

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  isGenerating?: boolean;
}

export interface AIAssistantStore {
  // UI State
  isOpen: boolean;
  isGenerating: boolean;
  
  // Chat State
  messages: ChatMessage[];
  currentMessage: string;
  
  // Quick Actions
  quickActions: Array<{
    id: string;
    label: string;
    description: string;
    action: () => void;
  }>;
  
  // Actions
  toggleSidebar: () => void;
  openSidebar: () => void;
  closeSidebar: () => void;
  setCurrentMessage: (message: string) => void;
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => string;
  updateMessage: (id: string, updates: Partial<ChatMessage>) => void;
  clearChat: () => void;
  
  // AI Actions (to be implemented)
  sendMessage: (message: string) => Promise<void>;
  generateNote: (topic: string) => Promise<void>;
  summarizeNotes: (noteIds?: string[]) => Promise<void>;
  summarizeCurrent: () => Promise<void>;
  planDay: () => Promise<void>;
}

const generateId = () => Math.random().toString(36).substr(2, 9);

// Helper function to get current context
const getCurrentContext = () => {
  const notes = useNotesStore.getState().notes;
  const editor = useEditorStore.getState();
  
  // Check if we're in editor mode by checking if there's current content
  const isInEditor = editor.title || editor.content;
  
  let context = { notes, currentNote: null as any };
  
  if (isInEditor) {
    // Create a temporary note object with current editor content
    context.currentNote = {
      id: editor.currentNoteId || 'current',
      title: editor.title || 'Current Note',
      content: editor.content,
      tags: editor.tags,
      type: 'markdown' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }
  
  return context;
};

export const useAIStore = create<AIAssistantStore>((set, get) => ({
  // Initial state
  isOpen: false,
  isGenerating: false,
  messages: [],
  currentMessage: '',
  quickActions: [
    {
      id: 'plan-day',
      label: 'Plan my day',
      description: 'Daily planning suggestions',
      action: () => get().planDay(),
    },
    {
      id: 'summarize-current',
      label: 'Summarize current',
      description: 'Quick summary of current note',
      action: () => get().summarizeCurrent(),
    },
    {
      id: 'summarize-all',
      label: 'Summarize notes',
      description: 'Key insights from your notes',
      action: () => get().summarizeNotes(),
    },
    {
      id: 'generate-ideas',
      label: 'Brainstorm ideas',
      description: 'Creative suggestions',
      action: () => get().sendMessage('Help me brainstorm creative ideas for notes or projects'),
    },
  ],

  // UI Actions
  toggleSidebar: () => set((state) => ({ isOpen: !state.isOpen })),
  openSidebar: () => set({ isOpen: true }),
  closeSidebar: () => set({ isOpen: false }),

  // Chat Actions
  setCurrentMessage: (message) => set({ currentMessage: message }),
  
  addMessage: (message) => {
    const id = generateId();
    const newMessage: ChatMessage = {
      id,
      ...message,
      timestamp: new Date(),
    };
    
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
    
    return id;
  },

  updateMessage: (id, updates) => {
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, ...updates } : msg
      ),
    }));
  },

  clearChat: () => set({ messages: [] }),

  // AI Actions
  sendMessage: async (message: string) => {
    // Check if API is configured or fallback is available
    if (!checkAPIConfiguration() && !hasFallbackApiKey()) {
      toast.error('Please configure your Gemini API key first');
      return;
    }

    const userMessageId = get().addMessage({
      content: message,
      role: 'user',
    });

    // Clear current message
    set({ currentMessage: '', isGenerating: true });

    // Add assistant message placeholder
    const assistantMessageId = get().addMessage({
      content: '',
      role: 'assistant',
      isGenerating: true,
    });

    try {
      // Get current context (notes + current editor content if applicable)
      const context = getCurrentContext();
      
      // Build chat history for context
      const chatHistory = get().messages
        .filter(msg => msg.id !== assistantMessageId && msg.id !== userMessageId)
        .map(msg => ({ role: msg.role, content: msg.content }));

      // Enhance message with current note context if in editor
      let enhancedMessage = message;
      if (context.currentNote) {
        enhancedMessage = `I'm currently working on a note titled "${context.currentNote.title}" with the following content:\n\n---\n${context.currentNote.content}\n---\n\nMy question: ${message}`;
      }

      // Call AI service
      const response = await chatWithAI(enhancedMessage, context.notes, chatHistory);
      
      if (response.success) {
        get().updateMessage(assistantMessageId, {
          content: response.content,
          isGenerating: false,
        });
      } else {
        get().updateMessage(assistantMessageId, {
          content: `Sorry, I encountered an error: ${response.error || 'Unknown error'}`,
          isGenerating: false,
        });
        toast.error('AI request failed');
      }
    } catch (error) {
      console.error('AI request error:', error);
      get().updateMessage(assistantMessageId, {
        content: 'Sorry, I encountered an error. Please try again.',
        isGenerating: false,
      });
      toast.error('AI request failed');
    } finally {
      set({ isGenerating: false });
    }
  },

  generateNote: async (topic: string) => {
    // Check if API is configured or fallback is available
    if (!checkAPIConfiguration() && !hasFallbackApiKey()) {
      toast.error('Please configure your Gemini API key first');
      return;
    }

    set({ isGenerating: true });

    // Add user message
    get().addMessage({
      content: `Generate a detailed note about: ${topic}`,
      role: 'user',
    });

    // Add assistant message placeholder
    const assistantMessageId = get().addMessage({
      content: '',
      role: 'assistant',
      isGenerating: true,
    });

    try {
      const response = await generateNoteService(topic);
      
      if (response.success) {
        get().updateMessage(assistantMessageId, {
          content: response.content,
          isGenerating: false,
        });
        toast.success('Note generated successfully!');
      } else {
        get().updateMessage(assistantMessageId, {
          content: `Sorry, I couldn't generate the note: ${response.error || 'Unknown error'}`,
          isGenerating: false,
        });
        toast.error('Failed to generate note');
      }
    } catch (error) {
      console.error('Note generation error:', error);
      get().updateMessage(assistantMessageId, {
        content: 'Sorry, I encountered an error generating the note. Please try again.',
        isGenerating: false,
      });
      toast.error('Failed to generate note');
    } finally {
      set({ isGenerating: false });
    }
  },

  summarizeNotes: async (noteIds?: string[]) => {
    // Check if API is configured or fallback is available
    if (!checkAPIConfiguration() && !hasFallbackApiKey()) {
      toast.error('Please configure your Gemini API key first');
      return;
    }

    const context = getCurrentContext();
    
    if (context.notes.length === 0 && !context.currentNote) {
      toast.error('No notes found to summarize');
      return;
    }

    set({ isGenerating: true });

    // Add user message
    const message = noteIds?.length 
      ? `Summarize the specific notes I've selected`
      : `Summarize all my notes and give me key insights`;
    
    get().addMessage({
      content: message,
      role: 'user',
    });

    // Add assistant message placeholder
    const assistantMessageId = get().addMessage({
      content: '',
      role: 'assistant',
      isGenerating: true,
    });

    try {
      // Include current note in the notes to summarize if we're in editor mode
      const notesToSummarize = context.currentNote 
        ? [context.currentNote, ...context.notes]
        : context.notes;
      
      const response = await summarizeNotesService(notesToSummarize, noteIds);
      
      if (response.success) {
        get().updateMessage(assistantMessageId, {
          content: response.content,
          isGenerating: false,
        });
        toast.success('Notes summarized successfully!');
      } else {
        get().updateMessage(assistantMessageId, {
          content: `Sorry, I couldn't summarize your notes: ${response.error || 'Unknown error'}`,
          isGenerating: false,
        });
        toast.error('Failed to summarize notes');
      }
    } catch (error) {
      console.error('Summarization error:', error);
      get().updateMessage(assistantMessageId, {
        content: 'Sorry, I encountered an error summarizing your notes. Please try again.',
        isGenerating: false,
      });
      toast.error('Failed to summarize notes');
    } finally {
      set({ isGenerating: false });
    }
  },

  summarizeCurrent: async () => {
    // Check if API is configured or fallback is available
    if (!checkAPIConfiguration() && !hasFallbackApiKey()) {
      toast.error('Please configure your Gemini API key first');
      return;
    }

    const context = getCurrentContext();

    if (!context.currentNote) {
      toast.error('No current note to summarize');
      return;
    }

    set({ isGenerating: true });

    // Add user message
    get().addMessage({
      content: `Summarize the current note titled "${context.currentNote.title}"`,
      role: 'user',
    });

    // Add assistant message placeholder
    const assistantMessageId = get().addMessage({
      content: '',
      role: 'assistant',
      isGenerating: true,
    });

    try {
      const response = await summarizeContent(context.currentNote.content);
      
      if (response.success) {
        get().updateMessage(assistantMessageId, {
          content: response.content,
          isGenerating: false,
        });
        toast.success('Current note summarized successfully!');
      } else {
        get().updateMessage(assistantMessageId, {
          content: `Sorry, I couldn't summarize the current note: ${response.error || 'Unknown error'}`,
          isGenerating: false,
        });
        toast.error('Failed to summarize current note');
      }
    } catch (error) {
      console.error('Summarization error:', error);
      get().updateMessage(assistantMessageId, {
        content: 'Sorry, I encountered an error summarizing the current note. Please try again.',
        isGenerating: false,
      });
      toast.error('Failed to summarize current note');
    } finally {
      set({ isGenerating: false });
    }
  },

  planDay: async () => {
    // Check if API is configured or fallback is available
    if (!checkAPIConfiguration() && !hasFallbackApiKey()) {
      toast.error('Please configure your Gemini API key first');
      return;
    }

    const context = getCurrentContext();

    set({ isGenerating: true });

    // Add user message
    get().addMessage({
      content: 'Based on my notes and tasks, what should I focus on today? Help me plan my day.',
      role: 'user',
    });

    // Add assistant message placeholder
    const assistantMessageId = get().addMessage({
      content: '',
      role: 'assistant',
      isGenerating: true,
    });

    try {
      // Include current note in planning if we're in editor mode
      const notesForPlanning = context.currentNote 
        ? [context.currentNote, ...context.notes]
        : context.notes;
      
      const response = await planDayService(notesForPlanning);
      
      if (response.success) {
        get().updateMessage(assistantMessageId, {
          content: response.content,
          isGenerating: false,
        });
        toast.success('Daily plan created successfully!');
      } else {
        get().updateMessage(assistantMessageId, {
          content: `Sorry, I couldn't create your daily plan: ${response.error || 'Unknown error'}`,
          isGenerating: false,
        });
        toast.error('Failed to create daily plan');
      }
    } catch (error) {
      console.error('Day planning error:', error);
      get().updateMessage(assistantMessageId, {
        content: 'Sorry, I encountered an error planning your day. Please try again.',
        isGenerating: false,
      });
      toast.error('Failed to create daily plan');
    } finally {
      set({ isGenerating: false });
    }
  },
})); 