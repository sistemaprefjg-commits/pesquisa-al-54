import React, { createContext, useContext, useState, useEffect } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  username: string;
  role: 'admin' | 'receptionist';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
  signUp: (email: string, password: string, username: string, role: 'admin' | 'receptionist') => Promise<{ error?: string }>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('username, role')
                .eq('id', session.user.id)
                .single();

              if (profile && !error) {
                setUser({
                  id: session.user.id,
                  username: profile.username,
                  role: profile.role as 'admin' | 'receptionist'
                });
              }
            } catch (error) {
              console.error('Error fetching profile:', error);
            }
          }, 0);
        } else {
          setUser(null);
        }

        setIsLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    // Auto-create admin users if they don't exist
    try {
      await supabase.functions.invoke('auto-create-admin');
    } catch (error) {
      console.log('Auto-create function may not be available yet:', error);
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const signUp = async (
    email: string, 
    password: string, 
    username: string, 
    role: 'admin' | 'receptionist'
  ): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: {
          username,
          role
        }
      }
    });

    if (error) {
      return { error: error.message };
    }

    return {};
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
    } catch (error) {
      console.error('Error during logout:', error);
      // Forçar limpeza local mesmo se o logout remoto falhar
      setUser(null);
      setSession(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, login, logout, signUp, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};