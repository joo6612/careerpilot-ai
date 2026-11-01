import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from './auth.service';
import { isFirebaseConfigured } from './firebase';

export interface AuthContextType {
  user: any;
  loading: boolean;
  isDemo: boolean;
  token: string | null;
  login: () => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  loginAsDemo: () => void;
  startDemoSession: () => void;
  logout: () => Promise<void>;
}

export type AuthContextProps = AuthContextType;

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [token, setToken] = useState<string | null>(() => {
    const stored = localStorage.getItem('auth_token');
    // Ensure no demo tokens persist
    if (!stored || stored.startsWith('demo-')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('is_demo_mode');
      return null;
    }
    return stored;
  });

  useEffect(() => {
    // Purge legacy demo artifacts
    localStorage.removeItem('is_demo_mode');

    if (!isFirebaseConfigured) {
      console.warn('[AUTH] Firebase configuration missing. Please verify environment credentials.');
      setLoading(false);
      return;
    }

    const unsubscribe = authService.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const jwtToken = await firebaseUser.getIdToken();
          setUser(firebaseUser);
          setToken(jwtToken);
          localStorage.setItem('auth_token', jwtToken);
          localStorage.removeItem('is_demo_mode');
        } catch (err) {
          console.error('[AUTH CONTEXT] Failed to obtain ID token:', err);
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_token');
        }
      } else {
        setUser(null);
        setToken(null);
        localStorage.removeItem('auth_token');
        localStorage.removeItem('is_demo_mode');
      }
      setLoading(false);
    });

    const handleAuthExpired = () => {
      console.warn('[AUTH] Expired session received. Transitioning state to unauthenticated.');
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('is_demo_mode');
    };
    window.addEventListener('auth:expired', handleAuthExpired);

    return () => {
      unsubscribe();
      window.removeEventListener('auth:expired', handleAuthExpired);
    };
  }, []);

  const login = async () => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase configuration missing.');
      }
      const u = await authService.signInWithGoogle();
      const jwtToken = await u.getIdToken();
      setUser(u);
      setToken(jwtToken);
      localStorage.setItem('auth_token', jwtToken);
      localStorage.removeItem('is_demo_mode');
    } finally {
      setLoading(false);
    }
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase configuration missing.');
      }
      const u = await authService.signInWithEmail(email, pass);
      const jwtToken = await u.getIdToken();
      setUser(u);
      setToken(jwtToken);
      localStorage.setItem('auth_token', jwtToken);
      localStorage.removeItem('is_demo_mode');
    } finally {
      setLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        throw new Error('Firebase configuration missing.');
      }
      const u = await authService.signUpWithEmail(email, pass, name);
      const jwtToken = await u.getIdToken();
      setUser(u);
      setToken(jwtToken);
      localStorage.setItem('auth_token', jwtToken);
      localStorage.removeItem('is_demo_mode');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured) {
        await authService.signOut();
      }
    } catch (e) {
      console.warn('Signout warning:', e);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('is_demo_mode');
      setLoading(false);
    }
  };

  // Demo fallback deprecated: instruct user to sign in
  const deprecatedDemoHandler = () => {
    console.warn('[AUTH] Demo mode has been retired. Please sign in with your account.');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo: false,
        token,
        login,
        loginWithEmail,
        signupWithEmail,
        loginAsDemo: deprecatedDemoHandler,
        startDemoSession: deprecatedDemoHandler,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
