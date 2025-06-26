// Utility functions for text analysis

// Convert HTML content to plain text for accurate word counting
export const htmlToPlainText = (html: string): string => {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<p[^>]*>/gi, '')
    .replace(/<\/div>/gi, '\n')
    .replace(/<div[^>]*>/gi, '')
    .replace(/<h[1-6][^>]*>/gi, '')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<strong[^>]*>(.*?)<\/strong>/gi, '$1')
    .replace(/<b[^>]*>(.*?)<\/b>/gi, '$1')
    .replace(/<em[^>]*>(.*?)<\/em>/gi, '$1')
    .replace(/<i[^>]*>(.*?)<\/i>/gi, '$1')
    .replace(/<ul[^>]*>/gi, '')
    .replace(/<\/ul>/gi, '')
    .replace(/<ol[^>]*>/gi, '')
    .replace(/<\/ol>/gi, '')
    .replace(/<li[^>]*>/gi, '')
    .replace(/<\/li>/gi, '\n')
    .replace(/<blockquote[^>]*>/gi, '')
    .replace(/<\/blockquote>/gi, '')
    .replace(/<code[^>]*>(.*?)<\/code>/gi, '$1')
    .replace(/<pre[^>]*>(.*?)<\/pre>/gi, '$1')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\n\s*\n/g, '\n')
    .trim();
};

// Count words in text content
export const countWords = (content: string): number => {
  const plainText = htmlToPlainText(content);
  if (!plainText.trim()) return 0;
  
  // Split by whitespace and filter out empty strings
  const words = plainText
    .trim()
    .split(/\s+/)
    .filter(word => word.length > 0);
  
  return words.length;
};

// Count characters (including spaces)
export const countCharacters = (content: string): number => {
  const plainText = htmlToPlainText(content);
  return plainText.length;
};

// Count characters (excluding spaces)
export const countCharactersNoSpaces = (content: string): number => {
  const plainText = htmlToPlainText(content);
  return plainText.replace(/\s/g, '').length;
};

// Calculate estimated reading time
export const calculateReadingTime = (content: string): number => {
  const wordCount = countWords(content);
  const averageWordsPerMinute = 200; // Average adult reading speed
  const readingTimeMinutes = Math.ceil(wordCount / averageWordsPerMinute);
  
  return Math.max(1, readingTimeMinutes); // Minimum 1 minute
};

// Get detailed text statistics
export interface TextStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  readingTimeMinutes: number;
  readingTimeText: string;
}

export const getTextStats = (content: string): TextStats => {
  const words = countWords(content);
  const characters = countCharacters(content);
  const charactersNoSpaces = countCharactersNoSpaces(content);
  const readingTimeMinutes = calculateReadingTime(content);
  
  const readingTimeText = readingTimeMinutes === 1 
    ? '1 min read' 
    : `${readingTimeMinutes} min read`;
  
  return {
    words,
    characters,
    charactersNoSpaces,
    readingTimeMinutes,
    readingTimeText
  };
}; 