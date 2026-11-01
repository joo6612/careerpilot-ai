import { Request, Response, NextFunction } from 'express';
import { FirebaseAuthProvider } from '../services/firebase_auth_provider';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    provider?: string;
    [key: string]: any;
  };
}

const firebaseAuthProvider = new FirebaseAuthProvider();

/**
 * Strict Firebase Authentication Middleware
 * Enforces valid Firebase JWT ID tokens. Rejects demo tokens and local bypasses.
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid token format'
      });
    }

    const token = authHeader.split(' ')[1]?.trim();

    if (!token || token === 'undefined' || token === 'null' || token === '') {
      return res.status(401).json({
        error: 'Unauthorized: Missing or invalid token format'
      });
    }

    // Live Firebase Token Verification strictly enforced
    try {
      const verifiedUser = await firebaseAuthProvider.verifyToken(token);
      req.user = verifiedUser;
      return next();
    } catch (firebaseErr: any) {
      return res.status(401).json({
        error: firebaseErr.message || 'Unauthorized: Token verification failed'
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Internal Server Error during authentication',
      details: error.message
    });
  }
};

export const authMiddleware = authenticate;
export default authenticate;
