import { getGeminiModel, isGeminiInitialized } from '@/lib/gemini';
import { Note } from '@/types/note';

export interface AIResponse {
  content: string;
  success: boolean;
  error?: string;
}

// Generate a detailed note on a given topic
export const generateNote = async (topic: string): Promise<AIResponse> => {
  try {
    const model = getGeminiModel();
    if (!model || !isGeminiInitialized()) {
      return {
        content: '',
        success: false,
        error: 'AI service not initialized. Please set up your Gemini API key.',
      };
    }

    const prompt = `Create a comprehensive and well-structured note about "${topic}". 

Please format the note using markdown with:
- Clear headings and subheadings
- Bullet points for key information
- Code blocks if relevant
- Links or references where appropriate

Make it informative, practical, and easy to understand. Include:
1. Introduction/Overview
2. Key concepts or main points
3. Important details or examples
4. Conclusion or summary

The note should be detailed enough to be useful for learning or reference.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      success: true,
    };
  } catch (error) {
    console.error('Error generating note:', error);
    return {
      content: '',
      success: false,
      error: 'Failed to generate note. Please try again.',
    };
  }
};

// Summarize note content into minimal, concise points
export const summarizeContent = async (content: string, title?: string): Promise<AIResponse> => {
  try {
    const model = getGeminiModel();
    if (!model || !isGeminiInitialized()) {
      return {
        content: '',
        success: false,
        error: 'AI service not initialized. Please set up your Gemini API key.',
      };
    }

    // Clean HTML content to plain text for better analysis
    const cleanContent = content
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const prompt = `Extract and organize the most important actionable information from this note.

${title ? `Title: ${title}` : ''}

Content:
${cleanContent}

Focus on identifying and extracting:
1. **Tasks/Todos** - Any action items, things to do, or work items
2. **Key Goals** - Main objectives or priorities mentioned
3. **Important Reminders** - Critical information to remember

Format as:
- **Tasks:** List each task as a short bullet point (under 10 words each)
- **Focus:** Main priority or theme in one line
- **Notes:** Any other critical reminders

Requirements:
- Be extremely concise and actionable
- Extract only the most essential information
- Use simple language
- Maximum 6 total points across all sections
- Make it scannable in 15 seconds

If no clear tasks are found, focus on the main themes and key points.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content_summary = response.text();

    return {
      content: content_summary,
      success: true,
    };
  } catch (error) {
    console.error('Error summarizing content:', error);
    return {
      content: '',
      success: false,
      error: 'Failed to summarize content. Please try again.',
    };
  }
};

// Summarize user's notes
export const summarizeNotes = async (notes: Note[], specificNoteIds?: string[]): Promise<AIResponse> => {
  try {
    const model = getGeminiModel();
    if (!model || !isGeminiInitialized()) {
      return {
        content: '',
        success: false,
        error: 'AI service not initialized. Please set up your Gemini API key.',
      };
    }

    // Filter notes if specific IDs are provided
    const notesToSummarize = specificNoteIds 
      ? notes.filter(note => specificNoteIds.includes(note.id))
      : notes;

    if (notesToSummarize.length === 0) {
      return {
        content: 'No notes found to summarize.',
        success: true,
      };
    }

    // Prepare notes content for summarization
    const notesContent = notesToSummarize
      .map(note => `**${note.title}** (${note.tags?.join(', ') || 'No tags'})\n${note.content}\n---`)
      .join('\n\n');

    const prompt = `Analyze these notes and create an ultra-concise summary optimized for quick scanning.

Notes to analyze:
${notesContent}

Requirements:
- Start with 1 sentence overview (under 20 words)
- List only 3-5 most critical points as short bullets
- Each bullet point under 12 words maximum  
- Focus on actionable insights and key information only
- Use simple language, no fluff
- Format as clean markdown without complex formatting

Make it scannable in under 30 seconds.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      success: true,
    };
  } catch (error) {
    console.error('Error summarizing notes:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to summarize notes',
    };
  }
};

// Plan the user's day based on their notes
export const planDay = async (notes: Note[]): Promise<AIResponse> => {
  try {
    const model = getGeminiModel();
    if (!model || !isGeminiInitialized()) {
      return {
        content: '',
        success: false,
        error: 'AI service not initialized. Please set up your Gemini API key.',
      };
    }

    // Get recent notes and notes with relevant tags
    const recentNotes = notes
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 20); // Last 20 notes

    const taskRelatedNotes = notes.filter(note => 
      note.tags?.some(tag => 
        ['todo', 'task', 'project', 'ongoing', 'urgent', 'today', 'work'].includes(tag.toLowerCase())
      ) || 
      note.content.toLowerCase().includes('todo') ||
      note.content.toLowerCase().includes('task') ||
      note.content.toLowerCase().includes('deadline')
    );

    const relevantNotes = [...new Set([...recentNotes, ...taskRelatedNotes])].slice(0, 15);

    const notesContent = relevantNotes
      .map(note => `**${note.title}** (Tags: ${note.tags?.join(', ') || 'None'})\n${note.content.substring(0, 500)}${note.content.length > 500 ? '...' : ''}\n---`)
      .join('\n\n');

    const prompt = `Based on the user's notes, help them plan their day effectively. Analyze the notes and provide:

1. **Priority Tasks**: Most important things to focus on today
2. **Scheduled Activities**: Time-sensitive items or deadlines
3. **Project Progress**: Ongoing projects that need attention
4. **Learning Goals**: Educational or skill development opportunities
5. **Quick Wins**: Small tasks that can be completed easily
6. **Recommendations**: Suggestions for organizing the day

Recent and relevant notes:
${notesContent}

Provide a practical, actionable daily plan in markdown format. Be encouraging and realistic about what can be accomplished in one day.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      success: true,
    };
  } catch (error) {
    console.error('Error planning day:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to plan day',
    };
  }
};

// General chat function for answering questions about notes
export const chatWithAI = async (message: string, notes: Note[], chatHistory?: Array<{role: string, content: string}>): Promise<AIResponse> => {
  try {
    const model = getGeminiModel();
    if (!model || !isGeminiInitialized()) {
      return {
        content: '',
        success: false,
        error: 'AI service not initialized. Please set up your Gemini API key.',
      };
    }

    // Prepare context from user's notes
    const notesContext = notes
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, 10) // Most recent 10 notes for context
      .map(note => `Title: ${note.title}\nTags: ${note.tags?.join(', ') || 'None'}\nContent: ${note.content.substring(0, 300)}${note.content.length > 300 ? '...' : ''}`)
      .join('\n\n---\n\n');

    // Build conversation history
    let conversationContext = '';
    if (chatHistory && chatHistory.length > 0) {
      conversationContext = chatHistory
        .slice(-6) // Last 6 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n\n');
      conversationContext = `\n\nPrevious conversation:\n${conversationContext}\n\n`;
    }

    const prompt = `You are an AI assistant helping with note-taking and productivity. You have access to the user's notes for context.

User's Recent Notes:
${notesContext}
${conversationContext}
Current User Message: ${message}

Please provide a helpful, accurate response. If the question relates to the user's notes, reference them specifically. Be concise but informative, and use markdown formatting when appropriate.

If the user asks you to create or generate content, provide well-structured, practical responses that they can use in their note-taking system.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    return {
      content,
      success: true,
    };
  } catch (error) {
    console.error('Error in AI chat:', error);
    return {
      content: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get AI response',
    };
  }
};

// Check if API key is configured
export const checkAPIConfiguration = (): boolean => {
  return isGeminiInitialized();
}; 