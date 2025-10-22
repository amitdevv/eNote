/**
 * Extracts the first 4 words from content to use as title
 * @param content - The note content
 * @returns The first 4 words or "Untitled Note" if content is empty
 */
export const getTitleFromContent = (content: string): string => {
  if (!content || content.trim() === '') {
    return 'Untitled Note';
  }
  
  // Remove markdown syntax and extra whitespace
  const cleanContent = content
    .replace(/[#*`_~\[\]()]/g, '') // Remove markdown syntax
    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
    .trim();
  
  // Split into words and take first 4
  const words = cleanContent.split(' ').filter(word => word.length > 0);
  
  if (words.length === 0) {
    return 'Untitled Note';
  }
  
  // Take first 4 words and join them
  const titleWords = words.slice(0, 4);
  return titleWords.join(' ');
};

/**
 * Gets a display title with ellipsis if too long
 * @param content - The note content
 * @param maxLength - Maximum length for display (default: 50)
 * @returns Truncated title for display
 */
export const getDisplayTitle = (content: string, maxLength: number = 50): string => {
  const title = getTitleFromContent(content);
  if (title.length <= maxLength) {
    return title;
  }
  return title.substring(0, maxLength) + '...';
};
