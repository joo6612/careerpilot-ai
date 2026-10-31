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
  const [isDemo, setIsDemo] = useState<boolean>(() => {
    return localStorage.getItem('is_demo_mode') === 'true';
  });
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('auth_token') || 'demo-user-token';
  });

  const activateDemo = () => {
    const demoToken = 'demo-user-token';
    const demoUserObj = {
      uid: 'demo-user-123',
      email: 'demo@careerpilot.ai',
      displayName: 'Alex Johnson (Demo)',
    };
    setIsDemo(true);
    setToken(demoToken);
    setUser(demoUserObj);
    localStorage.setItem('auth_token', demoToken);
    localStorage.setItem('is_demo_mode', 'true');
    setLoading(false);
  };

  useEffect(() => {
    if (isDemo) {
      activateDemo();
      return;
    }

    if (!isFirebaseConfigured) {
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
          setIsDemo(false);
        } catch (err) {
          console.error('[AUTH CONTEXT] Failed to obtain ID token:', err);
        }
      } else {
        if (!isDemo) {
          setUser(null);
          setToken(null);
          localStorage.removeItem('auth_token');
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isDemo]);

  const login = async () => {
    setLoading(true);
    try {
      if (!isFirebaseConfigured) {
        activateDemo();
        return;
      }
      const u = await authService.signInWithGoogle();
      const jwtToken = await u.getIdToken();
      setUser(u);
      setToken(jwtToken);
      setIsDemo(false);
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
        activateDemo();
        return;
      }
      const u = await authService.signInWithEmail(email, pass);
      const jwtToken = await u.getIdToken();
      setUser(u);
      setToken(jwtToken);
      setIsDemo(false);
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
        activateDemo();
        return;
      }
      const u = await authService.signUpWithEmail(email, pass, name);
      const jwtToken = await u.getIdToken();
      setUser(u);
      setToken(jwtToken);
      setIsDemo(false);
      localStorage.setItem('auth_token', jwtToken);
      localStorage.removeItem('is_demo_mode');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      if (isFirebaseConfigured && !isDemo) {
        await authService.signOut();
      }
    } catch (e) {
      console.warn('Signout warning:', e);
    } finally {
      setUser(null);
      setIsDemo(false);
      setToken(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('is_demo_mode');
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isDemo,
        token,
        login,
        loginWithEmail,
        signupWithEmail,
        loginAsDemo: activateDemo,
        startDemoSession: activateDemo,
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