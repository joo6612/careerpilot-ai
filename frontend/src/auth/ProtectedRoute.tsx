import React, { useEffect } from 'react';
import { useAuth } from './useAuth';
import { useApp } from '../context/AppContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Protects downstream dashboard/onboarding components.
 * Intercepts routing changes; if loading is complete and no user session is found,
 * it redirects the application state to 'login'.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { setPage } = useApp();

  useEffect(() => {
    if (!loading && !user) {
      setPage('login');
    }
  }, [user, loading, setPage]);

  // Loading spinner to keep view transitions clean while verifying session state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0B1020] text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Prevent flash rendering before redirection runs in useEffect
  if (!user) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
