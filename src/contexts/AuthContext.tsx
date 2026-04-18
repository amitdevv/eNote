import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setLoading(true);
    const baseUrl = window.location.origin;
    const isDev = baseUrl.includes('localhost') || baseUrl.includes('127.0.0.1');
    const redirectTo = isDev ? `${baseUrl}/notes` : 'https://ekeepit.vercel.app/notes';

    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });

    if (error) {
      setLoading(false);
      throw error;
    }
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setLoading(false);
      throw error;
    }

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('enote-')) localStorage.removeItem(key);
    });
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithGoogle, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
