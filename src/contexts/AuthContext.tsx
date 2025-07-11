import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Session cache to prevent multiple auth checks
let sessionCache: { session: Session | null; timestamp: number } | null = null;
const SESSION_CACHE_DURATION = 30 * 1000; // 30 seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const initialCheckRef = useRef(false);
  const authListenerRef = useRef<any>(null);

  // Session restoration with caching
  const initializeAuth = async () => {
    try {
      // Check cache first
      if (sessionCache && Date.now() - sessionCache.timestamp < SESSION_CACHE_DURATION) {
        setSession(sessionCache.session);
        setUser(sessionCache.session?.user ?? null);
        setLoading(false);
        return;
      }

      // Get session from Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }

      // Update cache
      sessionCache = {
        session,
        timestamp: Date.now()
      };

      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Auth initialization error:', error);
      setSession(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle auth state changes
  const handleAuthStateChange = async (event: string, session: Session | null) => {
    console.log('Auth state change:', event, session?.user?.email || 'no user');

    // Update cache
    sessionCache = {
      session,
      timestamp: Date.now()
    };

    setSession(session);
    setUser(session?.user ?? null);
    setLoading(false);

    // Handle specific events
    switch (event) {
      case 'SIGNED_IN':
        console.log('User signed in');
        break;
      case 'SIGNED_OUT':
        console.log('User signed out');
        // Clear any cached data
        sessionCache = null;
        try {
          localStorage.removeItem('enote-notes-cache');
        } catch (error) {
          console.warn('Failed to clear notes cache:', error);
        }
        break;
      case 'TOKEN_REFRESHED':
        console.log('Token refreshed');
        break;
    }
  };

  // Initialize auth and set up listener
  useEffect(() => {
    let mounted = true;

    const setupAuth = async () => {
      // Prevent multiple initializations
      if (initialCheckRef.current) {
        return;
      }
      initialCheckRef.current = true;

      await initializeAuth();

      // Set up auth state listener only once
      if (!authListenerRef.current && mounted) {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);
        authListenerRef.current = subscription;
      }
    };

    setupAuth();

    return () => {
      mounted = false;
      if (authListenerRef.current) {
        authListenerRef.current.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, []);

  // Handle visibility change to refresh session when tab becomes active
  useEffect(() => {
    const handleVisibilityChange = async () => {
      if (!document.hidden && session) {
        // Only refresh if session is close to expiring or cache is stale
        const now = Date.now();
        const cacheAge = sessionCache ? now - sessionCache.timestamp : Infinity;
        
        if (cacheAge > SESSION_CACHE_DURATION) {
          try {
            await supabase.auth.getSession();
          } catch (error) {
            console.warn('Failed to refresh session on visibility change:', error);
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [session]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      
      // Get the correct redirect URL for production vs development
      const getRedirectUrl = () => {
        const baseUrl = window.location.origin;
        
        // If we're in development, use localhost
        if (baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1')) {
          return `${baseUrl}/notes`;
        }
        
        // For production, use your deployed URL
        return 'https://ekeepit.vercel.app/notes';
      };

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getRedirectUrl()
        }
      });
      
      if (error) throw error;
    } catch (error) {
      console.error('Sign in error:', error);
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear cache before signing out
      sessionCache = null;
      
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      // Clear local storage
      try {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('enote-')) {
            localStorage.removeItem(key);
          }
        });
      } catch (error) {
        console.warn('Failed to clear localStorage:', error);
      }
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const refreshSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) {
        console.error('Session refresh error:', error);
        return;
      }

      // Update cache
      sessionCache = {
        session,
        timestamp: Date.now()
      };

      setSession(session);
      setUser(session?.user ?? null);
    } catch (error) {
      console.error('Failed to refresh session:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signInWithGoogle,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 