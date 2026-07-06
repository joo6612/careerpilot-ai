import React, { createContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { authService } from './auth.service';
import { ApiClient } from '../api/client';

export interface AuthContextProps {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<User>;
  loginWithEmail: (email: string, password: string) => Promise<User>;
  signupWithEmail: (email: string, password: string, displayName: string) => Promise<User>;
  logout: () => Promise<void>;
  getIdToken: (forceRefresh?: boolean) => Promise<string | null>;
  getToken: (forceRefresh?: boolean) => Promise<string | null>; // Keep for compatibility
  isDemo: boolean;
  startDemoSession: () => void;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const userRef = React.useRef<User | null>(null);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Sync auth state on startup and clean up subscription on unmount
  useEffect(() => {
    const unsubscribe = authService.onAuthStateChanged((currentUser) => {
      if (userRef.current && userRef.current.providerId === 'demo') {
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Register ApiClient token resolver
  useEffect(() => {
    ApiClient.registerTokenResolver(getIdToken);
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      const loggedInUser = await authService.signInWithGoogle();
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const loginWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.signInWithEmail(email, password);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const signupWithEmail = async (email: string, password: string, displayName: string) => {
    setLoading(true);
    try {
      const loggedInUser = await authService.signUpWithEmail(email, password, displayName);
      setUser(loggedInUser);
      return loggedInUser;
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const startDemoSession = () => {
    const demoUid = `demo-${Math.random().toString(36).substring(2, 15)}-${Math.random().toString(36).substring(2, 15)}`;
    const mockDemoUser: User = {
      uid: demoUid,
      email: 'demo.user@careerpilot.demo',
      displayName: 'Alex Johnson',
      photoURL: '',
      providerId: 'demo',
      emailVerified: true,
      isAnonymous: false,
      metadata: {},
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => demoUid,
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({})
    } as any;
    
    setUser(mockDemoUser);
    setLoading(false);
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (user && user.providerId === 'demo') {
        setUser(null);
        setLoading(false);
        return;
      }
      await authService.signOut();
      setUser(null);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const getIdToken = async (forceRefresh = false) => {
    const currUser = userRef.current;
    if (currUser && currUser.providerId === 'demo') {
      return currUser.uid;
    }
    return authService.getIdToken(forceRefresh);
  };

  const getToken = async (forceRefresh = false) => {
    const currUser = userRef.current;
    if (currUser && currUser.providerId === 'demo') {
      return currUser.uid;
    }
    return authService.getIdToken(forceRefresh);
  };

  const isAuthenticated = !!user;
  const isDemo = !!(user && user.providerId === 'demo');

  return (
    <AuthContext.Provider value={{ user, loading, isAuthenticated, login, loginWithEmail, signupWithEmail, logout, getIdToken, getToken, isDemo, startDemoSession }}>
      {children}
    </AuthContext.Provider>
  );
};
export default AuthContext;
