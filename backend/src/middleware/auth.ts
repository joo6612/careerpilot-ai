import { Request, Response, NextFunction } from 'express';
import { AuthenticationService } from '../services/auth_service';
import { FirebaseAuthProvider } from '../services/firebase_auth_provider';
import { DemoUserService } from '../services/demo_user_service';

const authProvider = new FirebaseAuthProvider();
const authService = new AuthenticationService(authProvider);

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    provider?: string;
  };
}

export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;



    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token format' });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (token.startsWith('demo-')) {
      const email = 'demo.user@careerpilot.demo';
      req.user = {
        uid: token,
        email,
        displayName: 'Alex Johnson',
        provider: 'demo'
      };
      DemoUserService.registerDemoUid(token, email);
      next();
      return;
    }

    try {
      const authenticatedUser = await authService.authenticate(token);
      req.user = authenticatedUser;
      
      if (DemoUserService.isDemoUser(authenticatedUser)) {
        DemoUserService.registerDemoUid(authenticatedUser.uid, authenticatedUser.email || '');
      }

      next();
    } catch (err: any) {
      console.error('Firebase token verification failed:', err.message);
      const isExpired = err.message?.includes('Expired');
      res.status(401).json({ 
        error: isExpired ? 'Unauthorized: Expired token' : 'Unauthorized: Invalid token' 
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({ error: 'Internal Server Error in authentication' });
  }
};
