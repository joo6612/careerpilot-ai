import * as admin from 'firebase-admin';
import { IAuthProvider, AuthenticatedUser } from './auth_service';

export class FirebaseAuthProvider implements IAuthProvider {
  /**
   * Verifies the client's Firebase JWT ID token against the Firebase Admin SDK.
   */
  async verifyToken(token: string): Promise<AuthenticatedUser> {
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attempt to retrieve full user record details to get display name and provider info
      const userRecord = await admin.auth().getUser(decodedToken.uid).catch(() => null);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email || userRecord?.email || '',
        displayName: decodedToken.name || userRecord?.displayName || 'Alex Pioneer',
        photoURL: decodedToken.picture || userRecord?.photoURL || '',
        provider: userRecord?.providerData?.[0]?.providerId || 'google.com'
      };
    } catch (err: any) {
      console.error('[FIREBASE-PROVIDER] Token verification failed:', err.message);
      if (err.code === 'auth/id-token-expired' || err.message?.includes('expired')) {
        throw new Error('Unauthorized: Expired token');
      }
      throw new Error('Unauthorized: Invalid token');
    }
  }
}
export default FirebaseAuthProvider;
