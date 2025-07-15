import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';

// Initialize the Gemini API client
let genAI: GoogleGenerativeAI | null = null;
let model: GenerativeModel | null = null;

export const initializeGemini = (apiKey: string) => {
  try {
    genAI = new GoogleGenerativeAI(apiKey);
    model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    return true;
  } catch (error) {
    console.error('Failed to initialize Gemini:', error);
    return false;
  }
};

export const getGeminiModel = (): GenerativeModel | null => {
  return model;
};

export const isGeminiInitialized = (): boolean => {
  return model !== null;
};

// Get API key from environment or localStorage
export const getApiKey = (): string | null => {
  // First try user's custom API key from localStorage
  const userApiKey = localStorage.getItem('gemini-api-key');
  if (userApiKey) {
    return userApiKey;
  }
  
  // Fallback to environment variable (your default API key)
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    return import.meta.env.VITE_GEMINI_API_KEY;
  }
  
  // No API key available
  return null;
};

// Check if user has configured their own API key
export const hasUserApiKey = (): boolean => {
  return !!localStorage.getItem('gemini-api-key');
};

// Check if fallback API key is available
export const hasFallbackApiKey = (): boolean => {
  return !!import.meta.env.VITE_GEMINI_API_KEY;
};

// Check if API is properly configured and initialized
export const checkAPIConfiguration = (): boolean => {
  return isGeminiInitialized();
};

// Save API key to localStorage
export const saveApiKey = (apiKey: string): void => {
  localStorage.setItem('gemini-api-key', apiKey);
};

// Remove API key from localStorage
export const removeApiKey = (): void => {
  localStorage.removeItem('gemini-api-key');
};

// Auto-initialize if API key is available
const apiKey = getApiKey();
if (apiKey) {
  initializeGemini(apiKey);
} 