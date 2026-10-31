import { Request, Response, NextFunction } from 'express';
import { DemoUserService } from '../services/demo_user_service';
import { FirebaseAuthProvider } from '../services/firebase_auth_provider';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    displayName?: string;
    photoURL?: string;
    isDemo?: boolean;
    provider?: string;
    [key: string]: any;
  };
}

const firebaseAuthProvider = new FirebaseAuthProvider();

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

    // Demo Session Authentication
    if (token === 'demo-token' || token === 'demo-user-token' || token.startsWith('demo-')) {
      const demoUid = 'demo-user-123';
      const demoEmail = 'demo@careerpilot.ai';
      DemoUserService.registerDemoUid(demoUid, demoEmail);
      const session = DemoUserService.getOrCreateSession(demoUid, demoEmail);

      req.user = {
        uid: demoUid,
        email: demoEmail,
        displayName: session.profile?.name || 'Demo User',
        isDemo: true,
      };
      return next();
    }

    // Live Firebase Token Verification
    try {
      const verifiedUser = await firebaseAuthProvider.verifyToken(token);
      req.user = verifiedUser;
      return next();
    } catch (firebaseErr: any) {
      if (process.env.BYPASS_AUTH === 'true') {
        const demoUid = 'demo-user-123';
        DemoUserService.registerDemoUid(demoUid, 'demo@careerpilot.ai');
        req.user = {
          uid: demoUid,
          email: 'demo@careerpilot.ai',
          displayName: 'Bypass Dev User',
          isDemo: true,
        };
        return next();
      }

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