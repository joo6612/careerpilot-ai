export interface AuthenticatedUser {
  uid: string;
  email?: string;
  displayName?: string;
  photoURL?: string;
  provider?: string;
}

export interface IAuthProvider {
  verifyToken(token: string): Promise<AuthenticatedUser>;
}

export class AuthenticationService {
  constructor(private provider: IAuthProvider) {}

  /**
   * Authenticates the token and returns the parsed user record.
   */
  async authenticate(token: string): Promise<AuthenticatedUser> {
    if (!token) {
      throw new Error('Unauthorized: Missing token');
    }
    return this.provider.verifyToken(token);
  }
}
