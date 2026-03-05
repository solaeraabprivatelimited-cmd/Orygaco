import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export type UserRole = 'guest' | 'patient' | 'doctor' | 'hospital';

interface AuthContextType {
  isAuthenticated: boolean;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole>('guest');

  useEffect(() => {
    const checkSession = async () => {
      let { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        const { data } = await supabase.auth.refreshSession();
        session = data.session;
      }

      const customToken = localStorage.getItem('authToken');
      const customUser = localStorage.getItem('user');

      if (session) {
        setIsAuthenticated(true);
        const role = session.user.user_metadata?.role as UserRole || 'patient';
        setUserRole(role);
      } else if (customToken && customUser) {
        setIsAuthenticated(true);
        try {
          const parsedUser = JSON.parse(customUser);
          setUserRole(parsedUser.role || 'patient');
        } catch (e) {
          console.error('Error parsing custom user:', e);
          setUserRole('patient');
        }
      } else {
        setIsAuthenticated(false);
        setUserRole('guest');
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('[AuthContext] Auth state changed:', { event: _event, hasSession: !!session });
      
      if (_event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setUserRole('guest');
      } else if (session?.user) {
        setIsAuthenticated(true);
        const role = session.user.user_metadata?.role as UserRole || 'patient';
        setUserRole(role);
      } else {
        // Check custom auth
        const customToken = localStorage.getItem('authToken');
        if (!customToken) {
          setIsAuthenticated(false);
          setUserRole('guest');
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isNewUser');
    setIsAuthenticated(false);
    setUserRole('guest');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, setUserRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
