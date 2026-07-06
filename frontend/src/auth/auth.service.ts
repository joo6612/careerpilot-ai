import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import type { User } from 'firebase/auth';
import { auth } from './firebase';

export const authService = {
  /**
   * Signs in a user using the Google Auth provider via popup.
   */
  async signInWithGoogle(): Promise<User> {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    try {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    } catch (error) {
      console.error('[AUTH-SERVICE] Google sign-in failed:', error);
      throw error;
    }
  },

  /**
   * Signs in a user using Email and Password.
   */
  async signInWithEmail(email: string, password: string): Promise<User> {
    console.log('[AUTH-SERVICE] Login started for:', email);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log('[AUTH-SERVICE] Login success for:', email);
      return result.user;
    } catch (error: any) {
      console.error('[AUTH-SERVICE] Login failure for:', email, 'Error code:', error.code, 'Error message:', error.message);
      throw error;
    }
  },

  /**
   * Registers a user using Email and Password, and updates their profile displayName.
   */
  async signUpWithEmail(email: string, password: string, displayName: string): Promise<User> {
    console.log('[AUTH-SERVICE] Signup started for:', email);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[AUTH-SERVICE] Signup user created, updating display name:', displayName);
      await updateProfile(result.user, { displayName });
      console.log('[AUTH-SERVICE] Signup success for:', email);
      return result.user;
    } catch (error: any) {
      console.error('[AUTH-SERVICE] Signup failure for:', email, 'Error code:', error.code, 'Error message:', error.message);
      throw error;
    }
  },

  /**
   * Signs out the current user session.
   */
  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('[AUTH-SERVICE] Sign-out failed:', error);
      throw error;
    }
  },

  /**
   * Gets the currently authenticated user instantly.
   */
  getCurrentUser(): User | null {
    return auth.currentUser;
  },

  /**
   * Fetches the current user's Firebase ID token (JWT).
   * Used for downstream HTTP API authentication headers.
   */
  async getIdToken(forceRefresh = false): Promise<string | null> {
    const user = auth.currentUser;
    if (!user) return null;
    return user.getIdToken(forceRefresh);
  },

  /**
   * Subscribes to authentication state changes (login, logout, token refresh).
   */
  onAuthStateChanged(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
};

export default authService;
