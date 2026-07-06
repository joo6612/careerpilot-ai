import { useContext } from 'react';
import { AuthContext } from './AuthContext';
import type { AuthContextProps } from './AuthContext';

/**
   * Custom hook to consume the AuthContext properties.
   * Throws an error if used outside an AuthProvider.
   */
export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default useAuth;
